# bigsea78-starter 部署修复 - 2026-06-04 中午

## 目标
修复 Vercel 构建 ERROR（TypeScript 类型错误），让商城网站成功上线。

## 根因

**`src/core/db/queries.ts` 和 `schema-types.ts` 仍引用 `user` 而非 `users`**
- 数据库表名已是 `users`（因 `user` 是 PG 保留关键字）
- 但 queries.ts 第5行：`import { user, products, orders, ... } from './schema'` — `user` 不存在于 schema
- schema-types.ts 第5行：同样引用 `user`
- 本地 build 成功是因为 Vercel build 是独立环境，两边状态不同步
- Vercel build 日志确认：`./src/core/db/queries.ts:5:10 — Type error: '"./schema"' has no exported member named 'user'. Did you mean 'users'?`

## 修复

| 文件 | 修改 |
|------|------|
| `src/core/db/queries.ts` | `import { user, ...}` → `import { users, ...}`，删除 `const users = user` 别名 |
| `src/core/db/schema-types.ts` | `import type { user, ...}` → `import type { users, ...}`，类型改为 `typeof users` |

commit: `e47fdd3`

## 结果

```
State: READY | ReadyState: READY | Sha: e47fdd3
URL: https://bigsea78-starter-6a6v549ir-haihai0603-3384s-projects.vercel.app
```

**网站终于 BUILD SUCCESS 了！**

## 其他发现
- `next.config.ts` 中 `outputFileTracingRoot: './'` 会被 Vercel 警告"应为绝对路径"（但不影响构建）
- `node_modules/.pnpm not found, skipping patch` — kysely patch 脚本在 npm 环境下跳过（kysely 已不用，无害）
- 本地网络请求 Vercel 被 SIGKILL（可能是网络策略限制），但 build 状态已确认 READY

## 待验证（需大洋访问）
1. 访问 `https://bigsea78-starter-6a6v549ir-haihai0603-3384s-projects.vercel.app` 确认首页
2. 访问 `/api/health` 确认数据库连接
3. 访问 `/api/auth/sign-up` 测试注册
4. 配置 `bigsea78.top` 域名绑定