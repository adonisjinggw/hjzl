/**
 * 构建后处理脚本
 * 为Cloudflare Pages生成必要的配置文件
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const distDir = 'dist';

// 确保dist目录存在
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

// 1. 创建_redirects文件 - 支持React Router SPA路由
const redirectsContent = `# SPA路由支持
/*    /index.html   200

# API代理（如果需要）
/api/*  https://api.example.com/:splat  200

# 静态资源缓存优化
/assets/*  /assets/:splat  200  Cache-Control: public,max-age=31536000,immutable
`;

writeFileSync(join(distDir, '_redirects'), redirectsContent);
console.log('✅ 已生成 _redirects 文件');

// 2. 创建_headers文件 - 优化缓存策略
const headersContent = `# 静态资源缓存
/assets/*
  Cache-Control: public, max-age=31536000, immutable
  X-Content-Type-Options: nosniff

# JavaScript和CSS文件
/*.js
  Cache-Control: public, max-age=31536000, immutable
  X-Content-Type-Options: nosniff

/*.css
  Cache-Control: public, max-age=31536000, immutable
  X-Content-Type-Options: nosniff

# HTML文件 - 不缓存确保更新及时
/*.html
  Cache-Control: public, max-age=0, must-revalidate
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

# 字体文件
/*.woff2
  Cache-Control: public, max-age=31536000, immutable

/*.woff
  Cache-Control: public, max-age=31536000, immutable

# 图片文件
/*.png
  Cache-Control: public, max-age=31536000, immutable

/*.jpg
  Cache-Control: public, max-age=31536000, immutable

/*.svg
  Cache-Control: public, max-age=31536000, immutable

# 根目录HTML
/
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
`;

writeFileSync(join(distDir, '_headers'), headersContent);
console.log('✅ 已生成 _headers 文件');

// 3. 创建robots.txt
const robotsContent = `User-agent: *
Allow: /

Sitemap: https://huanjing-zhilv-generator.pages.dev/sitemap.xml
`;

writeFileSync(join(distDir, 'robots.txt'), robotsContent);
console.log('✅ 已生成 robots.txt 文件');

// 4. 创建简单的sitemap.xml
const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://huanjing-zhilv-generator.pages.dev/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;

writeFileSync(join(distDir, 'sitemap.xml'), sitemapContent);
console.log('✅ 已生成 sitemap.xml 文件');

console.log('\n🎉 Cloudflare Pages 配置文件生成完成！');
console.log('📦 构建产物已优化，准备部署到Cloudflare Pages'); 