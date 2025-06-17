@echo off
chcp 65001 >nul
echo.
echo 🚑 紧急简化版本构建工具
echo ========================
echo 💡 此版本移除复杂功能，确保基础功能可用
echo.

:: 1. 清理
echo 🧹 清理缓存...
if exist "dist" rmdir /s /q "dist"
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"

:: 2. 创建临时简化配置
echo.
echo ⚙️ 创建简化构建配置...
(
    echo import { defineConfig } from 'vite'^;
    echo import react from '@vitejs/plugin-react'^;
    echo.
    echo export default defineConfig^({
    echo   plugins: [react^(^)],
    echo   base: './',
    echo   build: {
    echo     outDir: 'dist',
    echo     assetsDir: 'assets',
    echo     sourcemap: false,
    echo     minify: 'esbuild',
    echo     target: 'es2015',
    echo     rollupOptions: {
    echo       output: {
    echo         manualChunks: {
    echo           'react': ['react', 'react-dom'],
    echo           'vendor': ['lucide-react']
    echo         }
    echo       }
    echo     }
    echo   }
    echo }^)
) > vite.config.simple.ts

:: 3. 备份原配置
if exist "vite.config.ts" copy "vite.config.ts" "vite.config.original.ts" >nul

:: 4. 使用简化配置
copy "vite.config.simple.ts" "vite.config.ts" >nul
echo ✅ 已应用简化配置

:: 5. 构建
echo.
echo 🔨 执行简化构建...
npm run build

if errorlevel 1 (
    echo ❌ 构建失败！
    goto :restore_config
)

:: 6. 创建基础部署文件
echo.
echo 📄 创建部署文件...
(
    echo *.css
    echo   Content-Type: text/css
    echo *.js  
    echo   Content-Type: application/javascript
) > dist/_headers

(
    echo /*    /index.html   200
) > dist/_redirects

echo ✅ 简化版本构建完成！
echo.
echo 📦 部署方式:
echo 1. 直接上传 dist 目录到 Cloudflare Pages
echo 2. 或运行: wrangler pages publish dist
echo.

:restore_config
echo 🔄 恢复原配置...
if exist "vite.config.original.ts" (
    copy "vite.config.original.ts" "vite.config.ts" >nul
    del "vite.config.original.ts" >nul
)
del "vite.config.simple.ts" >nul 2>nul

pause 