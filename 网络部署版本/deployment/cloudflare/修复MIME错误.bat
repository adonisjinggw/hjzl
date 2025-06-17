@echo off
chcp 65001 >nul
echo.
echo 🔧 MIME类型错误自动修复工具
echo ================================
echo.

:: 检查Node.js和npm
echo 📋 检查环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未找到Node.js，请先安装Node.js
    pause
    exit /b 1
)

npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未找到npm，请检查Node.js安装
    pause
    exit /b 1
)

echo ✅ Node.js环境正常

:: 1. 清理构建缓存
echo.
echo 🧹 步骤1: 清理构建缓存...
if exist "dist" (
    rmdir /s /q "dist"
    echo ✅ 已删除dist目录
)

if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo ✅ 已清理Vite缓存
)

if exist ".cache" (
    rmdir /s /q ".cache"
    echo ✅ 已清理.cache目录
)

:: 2. 重新安装依赖
echo.
echo 📦 步骤2: 检查依赖...
if not exist "node_modules" (
    echo 正在安装依赖...
    npm install
    if errorlevel 1 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
    echo ✅ 依赖安装完成
) else (
    echo ✅ 依赖已存在
)

:: 3. 检查并修复Vite配置
echo.
echo ⚙️ 步骤3: 检查构建配置...

:: 检查vite.config.ts是否存在
if exist "vite.config.ts" (
    echo ✅ vite.config.ts 存在
) else (
    echo 📝 创建vite.config.ts...
    (
        echo import { defineConfig } from 'vite'
        echo import react from '@vitejs/plugin-react'
        echo.
        echo export default defineConfig^({
        echo   plugins: [react^(^)],
        echo   base: './',
        echo   build: {
        echo     outDir: 'dist',
        echo     assetsDir: 'assets',
        echo     sourcemap: false,
        echo     minify: 'esbuild'
        echo   },
        echo   server: {
        echo     host: true,
        echo     port: 5173
        echo   }
        echo }^)
    ) > vite.config.ts
    echo ✅ 已创建vite.config.ts
)

:: 4. 重新构建项目
echo.
echo 🔨 步骤4: 重新构建项目...
npm run build
if errorlevel 1 (
    echo ❌ 构建失败，请检查代码错误
    echo.
    echo 常见问题:
    echo - TypeScript类型错误
    echo - 导入路径错误
    echo - 缺少依赖包
    echo.
    pause
    exit /b 1
)
echo ✅ 构建成功

:: 5. 验证构建产物
echo.
echo 🔍 步骤5: 验证构建产物...

if not exist "dist" (
    echo ❌ dist目录不存在
    pause
    exit /b 1
)

if not exist "dist/index.html" (
    echo ❌ index.html不存在
    pause
    exit /b 1
)

if not exist "dist/assets" (
    echo ❌ assets目录不存在
    pause
    exit /b 1
)

echo ✅ 构建产物验证通过

:: 6. 创建部署配置文件
echo.
echo 📄 步骤6: 创建部署配置...

:: 创建_headers文件
(
    echo /assets/*
    echo   Cache-Control: public, max-age=31536000, immutable
    echo.
    echo *.css
    echo   Content-Type: text/css
    echo.
    echo *.js
    echo   Content-Type: application/javascript
    echo.
    echo *.json
    echo   Content-Type: application/json
    echo.
    echo *.woff2
    echo   Content-Type: font/woff2
    echo.
    echo *.woff
    echo   Content-Type: font/woff
    echo.
    echo *.ttf
    echo   Content-Type: font/ttf
) > dist/_headers

:: 创建_redirects文件
(
    echo # SPA重定向
    echo /*    /index.html   200
    echo.
    echo # 资源文件直接访问
    echo /assets/*  /assets/:splat  200
) > dist/_redirects

echo ✅ 部署配置文件已创建

:: 7. 启动预览服务器进行测试
echo.
echo 🚀 步骤7: 启动本地预览服务器...
echo.
echo 📍 即将在浏览器中打开应用
echo 🔧 请检查浏览器控制台是否还有MIME错误
echo ⏹️ 测试完成后，按 Ctrl+C 停止服务器
echo.

:: 启动预览服务器
start "" "http://localhost:4173"
npm run preview

echo.
echo 🎉 修复完成！
echo.
echo 📋 修复内容:
echo ✅ 清理了构建缓存
echo ✅ 重新构建了项目
echo ✅ 创建了正确的部署配置
echo ✅ 启动了本地预览服务器
echo.
echo 📝 下一步:
echo 1. 检查本地预览是否正常
echo 2. 重新部署到Cloudflare Pages
echo 3. 清除浏览器缓存测试线上版本
echo.
pause 