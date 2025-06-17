import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || 'demo_mode'),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || 'demo_mode'),
        'process.env.NODE_ENV': JSON.stringify(mode)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      server: {
        host: '0.0.0.0',
        port: 8080,
        strictPort: false,
        open: true,
      },
      build: {
        // 专门为Cloudflare Pages优化
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        target: 'es2020', // 现代浏览器支持
        cssCodeSplit: true, // CSS代码分割
        
        rollupOptions: {
          output: {
            // 优化的分包策略，避免单个文件过大
            manualChunks: (id) => {
              // 基础框架
              if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
                return 'react-vendor';
              }
              
              // UI组件库
              if (id.includes('node_modules/lucide-react') || 
                  id.includes('node_modules/@radix-ui') ||
                  id.includes('node_modules/framer-motion')) {
                return 'ui-vendor';
              }
              
              // 地图相关
              if (id.includes('node_modules/leaflet') || 
                  id.includes('node_modules/react-leaflet')) {
                return 'maps-vendor';
              }
              
              // AI和API
              if (id.includes('node_modules/@google') || 
                  id.includes('node_modules/openai') ||
                  id.includes('services/')) {
                return 'ai-vendor';
              }
              
              // 大型第三方库单独分包
              if (id.includes('node_modules/')) {
                return 'vendor';
              }
            },
            
            // 文件命名策略 - 使用更短的hash
            chunkFileNames: 'assets/[name]-[hash:8].js',
            entryFileNames: 'assets/[name]-[hash:8].js',
            assetFileNames: 'assets/[name]-[hash:8].[ext]'
          }
        },
        
        // 压缩优化
        minify: 'esbuild', // 更快的压缩
        chunkSizeWarningLimit: 1000, // 1MB警告限制
        
        // 预加载优化
        assetsInlineLimit: 4096, // 4KB以下内联
      },
      
      // 预构建优化
      optimizeDeps: {
        include: [
          'react',
          'react-dom',
          'lucide-react'
        ],
        exclude: [
          '@google/genai' // 动态导入
        ]
      }
    };
}); 