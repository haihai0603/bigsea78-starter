# bigsea78-starter Auth 修复 - 2026-06-04

## 目标
修复 JWT 注册/登录在本地和 Vercel 均报 500 的问题。

## 根因定位

### 问题1：`user` 是 PostgreSQL 保留关键字
- Drizzle schema 定义 `pgTable('user')`，但 PostgreSQL 不允许直接用 `user` 作表名
- 报错：`column "id" does not exist`（因为 SQL 解析错误）
- **修复**：重命名表 `user` → `users`，`session` → `sessions`

### 问题2：`db().insert(user)` 写成了小写 `user`
- schema 导出已改为 `users`，但 auth/index.ts 第 2 处仍是 `insert(user)`
- 报错：`user is not defined`
- **修复**：`insert(user)` → `insert(users)`

### 问题3：`sign-in` 路由响应体为空 `{}`
- `NextResponse.json()` 返回 RSC payload，被中间件拦截替换
- **修复**：改用 `respData()` 返回纯 JSON，用 `response.cookies.set()` 写 HttpOnly Cookie

## 执行的修复

### 数据库（通过 SQL 脚本直接修改 Neon）
```sql
ALTER TABLE "user" RENAME TO "users";
ALTER TABLE "session" RENAME TO "sessions";
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "passwordHash" text;
```

### 代码修改
| 文件 | 修改 |
|------|------|
| `src/core/db/schema.ts` | `user`→`users`，`session`→`sessions`，所有 `user.id` 引用→`users.id` |
| `src/core/auth/index.ts` | `user`→`users`（两处），默认 name 改为 email 前缀 |
| `src/app/api/auth/sign-in/route.ts` | 改用 `respData()` + `cookies.set()`，移除 createAuthCookie |
| `next.config.ts` | 加 `outputFileTracingRoot: './'` 解决 Next.js 多 lockfile 警告 |

### 包管理
- 删除 `pnpm-lock.yaml`，改用 `bun.lock`（本地）
- 推送空 commit 触发 Vercel 用 npm 构建

## 验证结果（本地 localhost:3010）
```
注册 POST /api/auth/sign-up → 200 {code:0, user:{id, email, name, role}}
登录 POST /api/auth/sign-in → 200 {code:0, user:{...}} + Set-Cookie:auth_token=...
会话 GET /api/auth/session   → 200 {code:0, user:{id, email, ...}}（带 Cookie）
```

## 当前状态
- 本地：✅ 认证三端点全部正常
- Vercel：⏳ 构建中（commit ca70e6d，可能遇到 import_error）
- 数据库：✅ 已修改（表名 users/sessions，passwordHash 列存在）

## 关键教训
- PostgreSQL `user` 是保留关键字，表名必须用 `users`
- `NextResponse.json()` 在 Next.js App Router 中会被 RSC 中间件处理，不能直接用于 API 响应
- Bun 在 Windows PATH 中需显式指定 `C:\Program Files\Bun\bin`
- Vercel 多 lockfile 会导致工作目录推断错误，`outputFileTracingRoot` 可解