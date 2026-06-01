// Site-specific configuration
// THIS IS THE ONLY FILE YOU CHANGE when creating a new site from this template

export const site = {
  // Brand
  name: 'BigSea78',
  tagline: '数字商品商城',
  description: '课程、软件、电子书、字体、音频 — 一站式数字商品',
  logo: '/logo.svg',
  favicon: '/favicon.ico',

  // Navigation
  nav: [
    { title: '首页', href: '/' },
    { title: '产品', href: '/#products' },
    { title: '关于', href: '/about' },
  ],

  // Categories for the store
  categories: [
    { id: 'software', name: '实用软件', icon: 'Monitor' },
    { id: 'course', name: '精品课程', icon: 'GraduationCap' },
    { id: 'ebook', name: '电子书', icon: 'BookOpen' },
    { id: 'font', name: '字体资源', icon: 'Type' },
    { id: 'audio', name: '音频素材', icon: 'Music' },
    { id: 'template', name: '模板', icon: 'Layout' },
  ],

  // Footer
  footer: {
    copyright: 'BigSea78',
    links: [
      { title: '隐私政策', href: '/privacy' },
      { title: '退款政策', href: '/refund' },
      { title: '联系我们', href: 'mailto:support@bigsea78.top' },
    ],
  },

  // Social
  social: {
    wechat: 'bigsea78',
    github: 'https://github.com/haihai0603',
  },
} as const;
