# 个人网站建设完整指南（避坑版）

> 基于 bigsea78-starter 项目 (2026-06-02 ~ 2026-06-04) 的实战经验总结  
> 适用场景：Next.js + PostgreSQL + Vercel + Cloudflare 技术栈

---

## 目录

1. [技术选型决策](#1-技术选型决策)
2. [认证方案选择（最重要）](#2-认证方案选择)
3. [数据库设计陷阱](#3-数据库设计陷阱)
4. [Next.js App Router 常见坑](#4-nextjs-app-router-常见坑)
5. [React Hydration Error 根治方案](#5-react-hydration-error-根治方案)
6. [Vercel 部署必知](#6-vercel-部署必知)
7. [Cookie/Session 调试手册](#7-cookiesession-调试手册)
8. [Git/PowerShell 操作技巧](#8-gitpowershell-操作技巧)
9. [Cloudflare 反代配置](#9-cloudflare-反代配置)
10. [完整构建流程（推荐路线）](#10-完整构建流程)
11. [紧急问题排查清单](#11-紧急问题排查清单)

---

## 1. 技术选型决策

### ✅ 推荐组合（经过验证）

| 组件 | 推荐方案 | 理由 |
|------|----------|------|
| **框架** | Next.js 15.5.19 (App Router) | Turbopack 强制，需适配 |
| **数据库** | Neon PostgreSQL | 免费 tier，Serverless |
| **ORM** | Drizzle ORM | 类型安全，Neon 官方推荐 |
| **认证** | Clerk Auth / Supabase Auth | 避免自建 JWT 的坑（见第2节） |
| **部署** | Vercel + Cloudflare | Vercel 国内被墙，必须反代 |
| **邮件** | Resend | 免费 3000 封/月 |
| **支付** | Stripe / LemonSqueezy | 取决于目标市场 |

### ❌ 避免的组合

- **Better Auth + Next.js 16 + Turbopack** → 解析失败（`kysely-adapter` 的 `package.json` `exports` 字段格式不兼容）
- **自建 JWT + bcrypt** → 需要处理 cookie、credentials、hydration 三大坑（除非你完全理解第5节）
- **pnpm + Vercel** → Vercel 默认用 npm，需 `vercel.json` 强制指定

---

## 2. 认证方案选择（最重要）

### 方案对比

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **Clerk Auth** | 10分钟集成，免费5000 MAU | 国内访问慢，需科学上网 | ⭐⭐⭐⭐⭐ |
| **Supabase Auth** | 开源，免费 | 需自己管理数据库 | ⭐⭐⭐⭐ |
| **NextAuth.js (Auth.js)** | 社区成熟 | v5 文档混乱，配置复杂 | ⭐⭐⭐ |
| **自建 JWT + bcrypt** | 完全控制 | 需处理大量边界情况（见下方坑清单） | ⭐⭐ |

### 自建 JWT 的坑（我们踩过的）

#### 坑1: `respData()` 返回类型问题

**现象**：登录成功，但 cookie 未设置

**根因**：`respData()` 返回 `NextResponse`，但 TypeScript 推断为 `Response`，导致 `.cookies.set()` 调用失败（运行时其实可以，但类型不安全）

**解决**：
```typescript
// ❌ 错误：类型推断可能出错
const response = respData({ code: 0, data: { token } });
response.cookies.set('auth_token', token); // TS 可能报错

// ✅ 正确：直接用 NextResponse.json()
const response = NextResponse.json({ code: 0, data: { token } });
response.cookies.set('auth_token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 7, // 7天
});
```

#### 坑2: 客户端 fetch 默认不带 cookie

**现象**：登录后，`fetch('/api/auth/session')` 返回 `{ user: null }`

**根因**：浏览器 `fetch()` 默认**不发送** cookie，需显式设置 `credentials: 'include'`

**解决**：
```typescript
// ❌ 错误：默认不带 cookie
const res = await fetch('/api/auth/session');

// ✅ 正确：显式带 credentials
const res = await fetch('/api/auth/session', {
  credentials: 'include',
});
```

**注意**：此问题**只影响客户端组件**，`next/headers` 的 `cookies()` 在服务端组件/路由中正常工作。

#### 坑3: JWT 验证与数据库查询分离

**现象**：token 有效，但用户信息缺失

**解决**：创建独立的 `getUserById()` 函数
```typescript
// src/core/auth/index.ts
import { db } from '@/core/db';
import { users } from '@/core/db/schema';
import { eq } from 'drizzle-orm';

export async function getUserById(id: string) {
  try {
    const result = await db()
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0] || null;
  } catch (e) {
    console.error('[getUserById] error:', e);
    return null;
  }
}
```

#### 坑4: `AUTH_SECRET` 不一致导致登录后用户状态为 null（❗最隐蔽的坑）

**现象**：登录成功，token 正常签发，但访问任何需要登录的页面都显示"未登录"，Header 右上角显示"登录/注册"而非用户邮箱。Chrome DevTools Network 显示 `/api/auth/session` 返回 `{ code: 0, data: { user: null } }`。

**根因**：JWT token 用 `AUTH_SECRET` 密钥 A 签发，但服务端验证时用的是密钥 B（Vercel 环境变量中的 `AUTH_SECRET` 默认值与代码中 `.env` 的值不同）。导致 `verifyToken()` 解密失败，返回 `null`，用户永远被视为未登录。

**排查步骤**：
1. 打开 Chrome DevTools → Console
2. 在 `/api/auth/session` 接口响应中检查 `user` 是否为 `null`
3. 如果 `user: null` 且确定用户已登录 → 99% 是 `AUTH_SECRET` 问题

**解决**：
```bash
# Step 1: 生成一个强随机密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# 输出示例: ZOVSYpj46R1SeRi65aPTBW7hU9gD2e4iM0gPqj2I28Y

# Step 2: 在 Vercel Dashboard → Settings → Environment Variables
# 删除旧的 AUTH_SECRET，添加新的 AUTH_SECRET = 上面生成的密钥
# 值必须与本地 .env 中的 AUTH_SECRET 完全一致！

# Step 3: 更新 NEXT_PUBLIC_APP_URL 为正式域名（如果不一致）
# NEXT_PUBLIC_APP_URL = https://bigsea78.top

# Step 4: 触发重新部署
# 任意方式均可：Vercel Console 点击 Redeploy / git push 一个空 commit / 设置环境变量后自动触发

git commit --allow-empty -m "chore: trigger redeploy after AUTH_SECRET fix"
git push origin master

# Step 5: 用户必须重新登录（因为旧 token 用旧密钥签的，验证不了了）
# 通知用户退出后重新登录
```

**⚠️ 重要提醒**：
- `AUTH_SECRET` 必须本地和 Vercel **完全一致**，哪怕差一个字符 token 就无法验证
- 环境变量修改后必须 Redeploy，Vercel 不会自动重新构建
- 修复后旧的 token 全部失效，所有已登录用户需要重新登录
- 如果登录状态仍不显示，清除浏览器缓存后再试（运行 `clear_browser_cache.ps1`）

---

## 3. 数据库设计陷阱

### 陷阱1: PostgreSQL 保留字

**现象**：Drizzle ORM 查询报错 `relation "user" does not exist`

**根因**：`user` 是 PostgreSQL 保留字，不能作为表名

**解决**：
```typescript
// ❌ 错误
export const user = pgTable('user', { ... });

// ✅ 正确
export const users = pgTable('users', { ... });
```

**影响范围**：所有引用 `user` 的地方都要改：
- Schema 定义：`user.ts` → `users.ts`
- 导入语句：`from './user'` → `from './users'`
- 查询：`db.select().from(user)` → `db.select().from(users)`

### 陷阱2: 环境变量区分

**现象**：本地 `productCount = 22`，Vercel 生产环境 `productCount = 1`

**根因**：Vercel 环境变量 `DATABASE_URL` 可能指向**不同的 Neon 数据库实例**

**解决**：
1. 在 Neon Console 确认数据库 ID
2. 在 Vercel Dashboard → Settings → Environment Variables 检查 `DATABASE_URL`
3. 确保本地 `.env.local` 和 Vercel 使用**同一个**数据库实例

**验证方法**：
```sql
-- 在 Neon SQL Editor 执行
SELECT count(*) FROM products;
```

---

## 4. Next.js App Router 常见坑

### 坑1: Turbopack 强制启用（无法禁用）

**现象**：某些 npm 包在 Turbopack 下解析失败

**解决**：
- 降级 Next.js 到 15.5.19（最后支持 webpack 的版本？❌ 错误，Turbopack 仍强制）
- **正确方案**：选择兼容 Turbopack 的包，或改用 CDN 引入

### 坑2: Server Component 中无法使用 `useState` / `useEffect`

**现象**：`You're importing a component that needs useState`

**根因**：Server Component 运行在服务器，没有 React 运行时

**解决**：
- 标记为 `'use client'`
- 或拆分为 Server Component（数据获取）+ Client Component（交互）

### 坑3: `next/headers` 的 `cookies()` 是异步的

**现象**：`cookies().get('token')` 报错 `cookies is not a function`

**根因**：Next.js 15 App Router 中，`cookies()` 返回 `Promise`

**解决**：
```typescript
// ❌ 错误（Next.js 14 及之前）
import { cookies } from 'next/headers';
const token = cookies().get('auth_token');

// ✅ 正确（Next.js 15 App Router）
import { cookies } from 'next/headers';
const cookieStore = await cookies();
const token = cookieStore.get('auth_token')?.value;
```

---

## 5. React Hydration Error 根治方案

### 什么是 Hydration Error？

**定义**：Server 渲染的 HTML 与 Client hydrate 后的结果不一致

**常见原因**：
1. 客户端组件中 `useEffect` 设 state（server 首次渲染为 `null`，client hydrate 后有值）
2. 访问 `window`/`document`（server 不存在）
3. 使用 `Math.random()` / `Date.now()`（server/client 结果不同）

### 我们的案例：Header 登录状态

**现象**：React Error #418 (Hydration mismatch)

**错误代码**：
```tsx
'use client';

export function Header() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => setUser(data.user));
  }, []);

  return (
    <header>
      {user ? <span>{user.name}</span> : <button>登录</button>}
    </header>
  );
}
```

**问题**：Server 渲染时 `user = null`，Client hydrate 后 `user = { name: '...' }` → 不匹配

### ✅ 根治方案：Server/Client 拆分

**核心思路**：在 Server Component 中读取 cookie，将用户状态**作为 props** 传给 Client Component

**实现步骤**：

#### Step 1: 创建 Server Component (`HeaderServer.tsx`)

```tsx
import { cookies } from 'next/headers';
import HeaderClient from './HeaderClient';
import { verifyToken, getUserById } from '@/core/auth';

async function getUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    const user = await getUserById(payload.sub || payload.userId);
    if (!user || !user.emailVerified) return null;

    return user;
  } catch (e) {
    console.error('[getUser] error:', e);
    return null;
  }
}

export async function Header() {
  const user = await getUser();

  return (
    <header>
      <HeaderClient user={user} />
    </header>
  );
}
```

#### Step 2: 创建 Client Component (`HeaderClient.tsx`)

```tsx
'use client';

import { Button } from '@/components/ui/button';

interface HeaderClientProps {
  user: AuthUser | null;
}

export default function HeaderClient({ user }: HeaderClientProps) {
  async function handleLogout() {
    await fetch('/api/auth/sign-out', { method: 'POST', credentials: 'include' });
    window.location.href = '/';
  }

  return (
    <>
      {user ? (
        <>
          <span>{user.name || user.email}</span>
          <Button onClick={handleLogout}>退出登录</Button>
        </>
      ) : (
        <>
          <a href="/auth/login">登录</a>
          <a href="/auth/register">注册</a>
        </>
      )}
    </>
  );
}
```

#### Step 3: 在 `layout.tsx` 中引入 Server Component

```tsx
import { Header } from '@/components/blocks/HeaderServer';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
```

**原理**：Server Component 在服务端渲染时就知道用户状态，因此 server HTML 和 client hydrate 结果一致 → 根治 hydration error。

### ❌ 不推荐方案：`suppressHydrationWarning`

```tsx
<span suppressHydrationWarning>{user?.name}</span>
```

**理由**：这只是隐藏警告，没有解决问题。如果用户禁用 JavaScript，会看到错误的状态。

---

## 6. Vercel 部署必知

### 必知1: 构建命令配置

**现象**：Vercel 默认用 `npm install && npm run build`，但项目用 `bun`

**解决**：创建 `vercel.json`
```json
{
  "buildCommand": "npm install && npm run build",
  "installCommand": "npm install"
}
```

### 必知2: 环境变量必须手动添加

**现象**：本地 `.env.local` 的变量在 Vercel 上不存在

**解决**：
1. 访问 https://vercel.com/<team>/<project>/settings/environment-variables
2. 添加所有必需变量（`DATABASE_URL`, `AUTH_SECRET`, `RESEND_API_KEY` 等）
3. **重要**：添加后必须**重新部署**（Redeploy）

### 必知3: 构建日志查看

**位置**：Vercel Dashboard → Deployments → 选择 deployment → Build Logs

**常见错误**：
- `import error: cannot find module` → 依赖未安装或导入路径错误
- `Type error: ...` → TypeScript 类型错误，需本地修复后推送
- `ENOENT: no such file or directory` → 文件未推送到 GitHub

### 必知4: Vercel 国内被墙

**现象**：`*.vercel.app` 在国内无法访问

**解决**：
1. 购买域名（如 `bigsea78.top`）
2. 将域名 NS 托管到 Cloudflare
3. 在 Cloudflare 创建 CNAME 记录指向 `cname.vercel-dns.com`
4. 在 Vercel 添加自定义域名

**详细步骤**：见第9节

---

## 7. Cookie/Session 调试手册

### 调试工具

| 工具 | 用途 |
|------|------|
| **F12 → Application → Cookies** | 查看浏览器存储的 cookie |
| **F12 → Network → 请求详情** | 查看请求/响应头中的 `Set-Cookie` |
| **F12 → Console** | `document.cookie` 查看当前页面可访问的 cookie |
| **服务端日志** | `console.log('cookie:', token)` |

### 常见问题排查

#### 问题1: Cookie 未存储

**检查清单**：
- [ ] 响应头中有 `Set-Cookie: auth_token=...` 吗？
- [ ] `httpOnly` 为 `true` 时，`document.cookie` 看不到（正常）
- [ ] `secure: true` 时，必须在 HTTPS 下才能存储
- [ ] `sameSite: 'strict'` 时，跨站请求不发送 cookie

**推荐配置**：
```typescript
response.cookies.set('auth_token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // HTTPS 才发 cookie
  sameSite: 'lax', // 允许顶级导航带 cookie
  maxAge: 60 * 60 * 24 * 7, // 7天
  path: '/', // 全站有效
});
```

#### 问题2: Cookie 未发送

**检查清单**：
- [ ] 客户端 `fetch()` 是否带 `credentials: 'include'`？
- [ ] Cookie 的 `domain` 是否匹配当前域名？
- [ ] Cookie 是否过期？

**调试代码**：
```typescript
// 客户端
fetch('/api/auth/session', {
  credentials: 'include', // 必须带这个
}).then(res => res.json()).then(console.log);

// 服务端 route.ts
export async function GET(request: Request) {
  const cookie = request.headers.get('cookie');
  console.log('[session] cookie:', cookie); // 看是否有 auth_token
  // ...
}
```

---

## 8. Git/PowerShell 操作技巧

### 问题: PowerShell 不支持 `&&`

**现象**：
```powershell
cd D:\project && git add -A && git commit -m "fix" && git push
```
报错：`&&` 不是此版本中的有效语句分隔符

**解决方案**：

#### 方案1: 用 `;`（不推荐，前面失败后面仍执行）
```powershell
cd D:\project; git add -A; git commit -m "fix"; git push
```

#### 方案2: 用 Node.js 脚本（✅ 推荐）

创建 `push.js`：
```javascript
const { execSync } = require('child_process');

try {
  console.log('📦 Adding files...');
  execSync('git add -A', { stdio: 'inherit', shell: true });
  
  console.log('\n💾 Committing...');
  execSync('git commit -m "fix: description"', { stdio: 'inherit', shell: true });
  
  console.log('\n🚀 Pushing...');
  execSync('git push', { stdio: 'inherit', shell: true });
  
  console.log('\n✅ Done!');
} catch (e) {
  console.error('\n❌ Error:', e.message);
  process.exit(1);
}
```

执行：
```powershell
cd D:\project; node push.js
```

#### 方案3: 用 `cmd /c`（兼容 CMD 语法）
```powershell
cmd /c "cd D:\project && git add -A && git commit -m "fix" && git push"
```

---

## 9. Cloudflare 反代配置

### 为什么需要反代？

Vercel 的 `*.vercel.app` 域名在国内被 GFW 屏蔽，需通过 Cloudflare（国外 CDN）反代访问。

### 配置步骤

#### Step 1: 域名 NS 托管到 Cloudflare

1. 在域名注册商（如阿里云）修改 NS 服务器为 Cloudflare 提供的地址
2. 等待 24-48 小时生效

#### Step 2: 在 Cloudflare 添加 CNAME 记录

| 类型 | 名称 | 内容 | Proxy 状态 |
|------|------|------|-----------|
| CNAME | @ | cname.vercel-dns.com | ✅ Proxied (橙色云朵) |
| CNAME | www | cname.vercel-dns.com | ✅ Proxied |

#### Step 3: 在 Vercel 添加自定义域名

1. 访问 Vercel Dashboard → Settings → Domains
2. 输入 `bigsea78.top`
3. 等待 SSL 证书自动颁发（1-2 分钟）

#### Step 4: 验证

```bash
curl -I https://bigsea78.top
# 应返回 HTTP/2 200
```

---

## 10. 完整构建流程（推荐路线）

### Phase 1: 项目初始化

```bash
npx create-next-app@latest my-site --typescript --tailwind --eslint --app --src-dir
cd my-site
```

**选择**：
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ ESLint
- ✅ App Router
- ✅ src/ directory
- ❌ Turbopack（默认启用，无法取消）

### Phase 2: 数据库配置

```bash
npm install drizzle-orm drizzle-kit pg
npm install -D @types/pg
```

创建 `src/core/db/schema.ts`：
```typescript
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  emailVerified: timestamp('email_verified'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

### Phase 3: 认证集成（推荐 Clerk）

```bash
npm install @clerk/nextjs
```

在 `src/app/layout.tsx` 中包裹：
```tsx
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### Phase 4: 部署到 Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## 11. 紧急问题排查清单

### 网站打不开

- [ ] Vercel Deployment 状态（Ready / Error / Building）
- [ ] 域名 DNS 解析（`nslookup bigsea78.top`）
- [ ] Cloudflare Proxy 状态（橙色云朵是否开启）
- [ ] SSL 证书是否有效（浏览器地址栏锁图标）

### 登录功能异常

- [ ] F12 → Network → `/api/auth/sign-in` 响应状态
- [ ] F12 → Application → Cookies → `auth_token` 是否存在
- [ ] 服务端日志：`console.log('token:', token)`
- [ ] 数据库 `users` 表是否有该用户

### React 报错

- [ ] F12 Console 错误堆栈（含文件名和行号）
- [ ] 是否是 Hydration Error（Error #418）
- [ ] 是否是 Client Component 中用了服务端 API（如 `cookies()`）

---

## 附录：常用命令速查

### Next.js

```bash
npm run dev          # 本地开发 (localhost:3000)
npm run build        # 构建生产版本
npm run start        # 启动生产服务器
```

### Drizzle ORM

```bash
npx drizzle-kit push        # 推送 schema 到数据库（不生成迁移文件）
npx drizzle-kit generate    # 生成迁移文件
npx drizzle-kit migrate     # 执行迁移
npx drizzle-kit studio      # 打开 Drizzle Studio（数据库 GUI）
```

### Git

```bash
git add -A                      # 添加所有变更
git commit -m "feat: add xxx"  # 提交
git push                        # 推送到远程
git log --oneline -5            # 查看最近5条提交
```

---

## 总结：最优路线

1. **认证**：直接用 Clerk Auth（10分钟集成，避免所有 JWT 坑）
2. **数据库**：Neon PostgreSQL + Drizzle ORM（免费，Serverless）
3. **部署**：Vercel + Cloudflare 反代（解决国内访问问题）
4. **邮件**：Resend（免费 3000 封/月）
5. **支付**：Stripe（国际）/ 支付宝（国内）

**核心原则**：
- ✅ 用成熟第三方服务，避免重复造轮子
- ✅ Server Component 读 cookie，Client Component 只处理交互
- ✅ 所有客户端 `fetch()` 都带 `credentials: 'include'`
- ✅ Vercel 环境变量添加后必须 Redeploy
- ✅ `AUTH_SECRET` 本地与 Vercel 必须完全一致，修改后需重新登录

---

**文档版本**: v1.0  
**最后更新**: 2026-06-04  
**维护者**: 洋洋 (AI Assistant)
