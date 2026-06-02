// Server component that fetches product data
import { getProducts } from '@/core/db/queries';

const MOCK_PRODUCTS = [
  { id: '1', name: 'AI写作助手', description: '智能文案生成工具，支持多种风格', price: 9900, category: 'software', coverImage: '' },
  { id: '2', name: '视频剪辑速成课', description: '从零到一学会专业剪辑', price: 19900, category: 'course', coverImage: '' },
  { id: '3', name: '创业者电子书合集', description: '10本必读商业书籍精编版', price: 2900, category: 'ebook', coverImage: '' },
  { id: '4', name: '思源黑体定制版', description: '适合UI设计的字体优化版本', price: 0, category: 'font', coverImage: '' },
];

export async function getProductList() {
  try {
    const dbProducts = await getProducts({ active: true, limit: 12 });
    if (dbProducts.length > 0) return dbProducts as any[];
  } catch {
    // DB not configured
  }
  return MOCK_PRODUCTS;
}
