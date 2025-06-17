import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/', // 确保使用绝对路径，适配Cloudflare Pages
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
        host: '0.0.0.0', // 使用0.0.0.0避免IPv6权限问题
        port: 8080,      // 使用8080端口避免权限问题
        strictPort: false, // 如果端口被占用，自动尝试下一个端口
        open: true,      // 自动打开浏览器
      },
      build: {
        // 优化 Cloudflare Pages 部署
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false, // 生产环境不生成sourcemap减小体积
        rollupOptions: {
          output: {
            // 手动分包，优化加载性能
            manualChunks: {
              'vendor': ['react', 'react-dom'],
              'ui': ['lucide-react'],
              'maps': ['leaflet'],
              'ai': ['@google/genai']
            }
          }
        },
        // 压缩配置
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true, // 移除console.log
            drop_debugger: true
          }
        }
      }
    };
});
