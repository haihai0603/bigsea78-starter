// Site configuration - the ONLY file you change per site
// All other core/ extensions/ shared/ code reads from here

export type ConfigMap = Record<string, string>;

export const siteConfig = {
  // === 每站必改 ===
  app_name: process.env.NEXT_PUBLIC_APP_NAME ?? 'BigSea78',
  app_url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  app_description: process.env.NEXT_PUBLIC_APP_DESCRIPTION ?? 'Digital Products Store',

  // === 基础配置 ===
  theme: process.env.NEXT_PUBLIC_THEME ?? 'default',
  locale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? 'zh',
  currency: process.env.NEXT_PUBLIC_CURRENCY ?? 'cny',

  // === 数据库 ===
  database_url: process.env.DATABASE_URL ?? '',
  database_provider: process.env.DATABASE_PROVIDER ?? 'postgresql',

  // === 认证 ===
  auth_secret: process.env.AUTH_SECRET ?? '',
  auth_url: process.env.AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || '',
  google_client_id: process.env.GOOGLE_CLIENT_ID ?? '',
  google_client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
  github_client_id: process.env.GITHUB_CLIENT_ID ?? '',
  github_client_secret: process.env.GITHUB_CLIENT_SECRET ?? '',

  // === 支付 ===
  stripe_secret_key: process.env.STRIPE_SECRET_KEY ?? '',
  stripe_publishable_key: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '',
  stripe_signing_secret: process.env.STRIPE_SIGNING_SECRET ?? '',
  lemonsqueezy_api_key: process.env.LEMONSQUEEZY_API_KEY ?? '',
  lemonsqueezy_store_id: process.env.LEMONSQUEEZY_STORE_ID ?? '',
  lemonsqueezy_signing_secret: process.env.LEMONSQUEEZY_SIGNING_SECRET ?? '',

  // === 邮件 ===
  resend_api_key: process.env.RESEND_API_KEY ?? '',
  email_from: process.env.EMAIL_FROM ?? 'noreply@bigsea78.top',

  // === 存储 ===
  r2_account_id: process.env.R2_ACCOUNT_ID ?? '',
  r2_access_key_id: process.env.R2_ACCESS_KEY_ID ?? '',
  r2_secret_access_key: process.env.R2_SECRET_ACCESS_KEY ?? '',
  r2_bucket_name: process.env.R2_BUCKET_NAME ?? '',
} as const;

// Type-safe config getter
export function getConfig<K extends keyof typeof siteConfig>(key: K): (typeof siteConfig)[K] {
  return siteConfig[key];
}
