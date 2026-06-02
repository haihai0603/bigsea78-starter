// Seed sample products into Neon PostgreSQL
// Run: node scripts/seed-products.mjs
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL
  || 'postgresql://neondb_owner:npg_gcuxXHmvj72S@ep-ancient-rice-aocsm9nj-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const sql = neon(DATABASE_URL);

const products = [
  {
    id: crypto.randomUUID(),
    name: 'ClipStudio Pro - 智能剪辑工具',
    description: '基于AI的自动化视频剪辑工具，支持批量处理、字幕生成、智能转场',
    price: 9900,
    currency: 'cny',
    category: 'software',
    cover_image: '/covers/clipstudio.jpg',
    download_url: 'clipstudio-pro-v1.2.zip',
    metadata: JSON.stringify({ version: '1.2.0', fileSize: '45MB', requirements: 'Windows 10+' }),
    active: 1,
  },
  {
    id: crypto.randomUUID(),
    name: 'AI变现实战课 - 从0到1',
    description: '独立开发者AI变现完整指南，含11个真实案例、代码模板、部署流程',
    price: 19900,
    currency: 'cny',
    category: 'course',
    cover_image: '/covers/ai-course.jpg',
    download_url: null,
    metadata: JSON.stringify({ duration: '6小时', lessons: 24, hasCertificate: true }),
    active: 1,
  },
  {
    id: crypto.randomUUID(),
    name: 'Next.js SaaS 脚手架 - ShipAny Two',
    description: '开箱即用的SaaS模板，含Better Auth、Stripe支付、多语言、Tailwind v4',
    price: 0,
    currency: 'cny',
    category: 'template',
    cover_image: '/covers/shipany.jpg',
    download_url: 'shipany-two-template.zip',
    metadata: JSON.stringify({ framework: 'Next.js 16', styling: 'Tailwind v4', license: 'MIT' }),
    active: 1,
  },
  {
    id: crypto.randomUUID(),
    name: 'Snooker教学电子书 - 从入门到进阶',
    description: '图文并茂的斯诺克教学电子书，含147满分杆解析、训练计划',
    price: 4900,
    currency: 'cny',
    category: 'ebook',
    cover_image: '/covers/snooker-ebook.jpg',
    download_url: 'snooker-ebook-v2.pdf',
    metadata: JSON.stringify({ pages: 128, format: 'PDF', language: 'zh-CN' }),
    active: 1,
  },
  {
    id: crypto.randomUUID(),
    name: 'ComfyUI 工作流合集 - 设计师必备',
    description: '50+ 精选ComfyUI工作流，含人像修复、风格迁移、视频生成',
    price: 14900,
    currency: 'cny',
    category: 'template',
    cover_image: '/covers/comfyui.jpg',
    download_url: 'comfyui-workflows-v3.zip',
    metadata: JSON.stringify({ workflowCount: 52, compatVersion: 'ComfyUI 0.3+' }),
    active: 1,
  },
  {
    id: crypto.randomUUID(),
    name: 'RVC音色转换模型包',
    description: '5个高质量RVC v2模型（男声/女声/卡通角色），含推理脚本和使用教程',
    price: 7900,
    currency: 'cny',
    category: 'audio',
    cover_image: '/covers/rvc-models.jpg',
    download_url: 'rvc-model-pack-v1.zip',
    metadata: JSON.stringify({ models: 5, format: 'RVC v2', sampleRate: '40kHz' }),
    active: 1,
  },
];

console.log(`Seeding ${products.length} products...`);

try {
  for (const p of products) {
    await sql`
      INSERT INTO products (id, name, description, price, currency, category, cover_image, download_url, metadata, active, created_at, updated_at)
      VALUES (${p.id}, ${p.name}, ${p.description}, ${p.price}, ${p.currency}, ${p.category}, ${p.cover_image}, ${p.download_url}, ${p.metadata}, ${p.active}, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `;
  }
  console.log(`✅ Seeded ${products.length} products successfully!`);
  process.exit(0);
} catch (err) {
  console.error('❌ Seeding failed:', err.message);
  process.exit(1);
}
