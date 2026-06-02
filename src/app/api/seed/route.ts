import { NextRequest, NextResponse } from 'next/server';
import { createProduct } from '@/core/db/queries';
import { randomUUID } from 'crypto';

const SAMPLE_PRODUCTS = [
  {
    name: 'AI 短视频脚本生成器',
    description: '基于 AI 的短视频脚本生成工具，输入主题即可生成完整分镜脚本，支持抖音/快手/B站多平台风格。',
    price: 9900,
    currency: 'cny',
    category: 'software',
    coverImage: 'https://picsum.photos/seed/ai-script/400/300',
    downloadUrl: 'https://example.com/downloads/ai-script.zip',
    active: 1,
  },
  {
    name: 'Python 爬虫实战课',
    description: '从零开始学爬虫，涵盖 requests/Scrapy/Selenium，带你做出能赚钱的爬虫项目。',
    price: 19900,
    currency: 'cny',
    category: 'course',
    coverImage: 'https://picsum.photos/seed/python-crawler/400/300',
    downloadUrl: 'https://example.com/downloads/python-crawler.zip',
    active: 1,
  },
  {
    name: '商用手写字体包',
    description: '12款商用授权手写字体，支持中文/英文，适用于海报/LOGO/包装设计。',
    price: 4900,
    currency: 'cny',
    category: 'font',
    coverImage: 'https://picsum.photos/seed/handwrite-font/400/300',
    downloadUrl: 'https://example.com/downloads/handwrite-font.zip',
    active: 1,
  },
  {
    name: '免费：AI 工具导航站源码',
    description: '开源 AI 工具导航站源码，Next.js + Tailwind，部署即用，免费分享。',
    price: 0,
    currency: 'cny',
    category: 'software',
    coverImage: 'https://picsum.photos/seed/ai-nav/400/300',
    downloadUrl: 'https://github.com/example/ai-nav',
    active: 1,
  },
  {
    name: '短视频爆款 BGM 合集 Vol.1',
    description: '200首无版权短视频BGM，涵盖搞笑/情感/科技/美食等12个分类，MP3格式。',
    price: 2900,
    currency: 'cny',
    category: 'audio',
    coverImage: 'https://picsum.photos/seed/bgm-pack/400/300',
    downloadUrl: 'https://example.com/downloads/bgm-vol1.zip',
    active: 1,
  },
];

export async function POST(request: NextRequest) {
  // 简单保护：只在非 production 环境可运行
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Disabled in production' }, { status: 403 });
  }

  try {
    const results = [];
    for (const p of SAMPLE_PRODUCTS) {
      const id = randomUUID();
      await createProduct({ ...p, id });
      results.push({ id, name: p.name, price: p.price });
    }

    return NextResponse.json({
      message: `成功写入 ${results.length} 个示例产品`,
      data: results,
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
