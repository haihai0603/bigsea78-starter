# bigsea78-starter

数字商品商城 SaaS 模板 — 基于 Next.js 16 + Better Auth + Drizzle + Stripe/LemonSqueezy

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router + Turbopack) |
| 样式 | Tailwind CSS v4 + shadcn/ui |
| 认证 | Better Auth (邮箱+Google+GitHub) |
| 数据库 | PostgreSQL (Neon) + Drizzle ORM |
| 支付 | Stripe + LemonSqueezy (双通道) |
| 邮件 | Resend |
| 存储 | Cloudflare R2 |
| 国际化 | next-intl |

## 快速开始

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入你的配置

# 3. 创建数据库表
npx drizzle-kit push

# 4. 启动开发服务器
pnpm dev
```

## 项目结构

```
src/
├── config/          # 全局配置（env → siteConfig）
├── core/            # 通用层：auth、db、rbac、i18n
├── extensions/      # 可插拔扩展：payment、email、storage
├── shared/          # 共享：components、blocks、lib
├── site/            # 每站唯一：config.ts（品牌/分类/导航）
└── app/             # Next.js App Router 页面
```

## 创建新站点

只需修改 `src/site/config.ts` — 品牌、分类、导航、Footer 全在这里。

## 页面清单

- `/` — 首页（Hero + 分类 + 产品列表）
- `/product/[id]` — 产品详情
- `/pricing` — 定价方案
- `/auth/login` — 登录
- `/auth/register` — 注册
- `/download?token=xxx` — 下载页
- `/admin` — 管理后台
- `/about` — 关于
- `/privacy` — 隐私政策
- `/refund` — 退款政策
- `/api/auth/[...all]` — Better Auth API
- `/api/payment/checkout` — 支付结账
- `/api/payment/callback` — 支付回调

## 注意事项

- `pnpm install` 后会自动执行 `scripts/patch-kysely.js` 修复 better-auth 的 kysely 兼容性问题
- Stripe API 版本已设为 `2026-05-27.dahlia`
- Google Fonts 在国内不可用，已改用 system-ui

## License

Private — 仅限 BigSea78 项目使用
