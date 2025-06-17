@echo off
chcp 65001 >nul
echo.
echo 🚀 Cloudflare Pages 优化构建工具
echo ================================
echo.

:: 1. 清理旧版本
echo 🧹 步骤1: 清理缓存和旧构建...
if exist "dist" (
    rmdir /s /q "dist"
    echo ✅ 已删除dist目录
)

if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo ✅ 已清理Vite缓存
)

:: 2. 备份原配置
echo.
echo 💾 步骤2: 备份配置文件...
if exist "vite.config.ts" (
    copy "vite.config.ts" "vite.config.backup.ts" >nul
    echo ✅ 已备份原配置为 vite.config.backup.ts
)

:: 3. 使用Cloudflare优化配置
echo.
echo ⚙️ 步骤3: 应用Cloudflare优化配置...
copy "vite.config.cloudflare.ts" "vite.config.ts" >nul
echo ✅ 已应用Cloudflare优化配置

:: 4. 优化构建
echo.
echo 🔨 步骤4: 执行优化构建...
npm run build

if errorlevel 1 (
    echo ❌ 构建失败！
    echo.
    echo 正在恢复原配置...
    if exist "vite.config.backup.ts" (
        copy "vite.config.backup.ts" "vite.config.ts" >nul
        echo ✅ 已恢复原配置
    )
    pause
    exit /b 1
)

echo ✅ 构建成功！

:: 5. 分析构建产物
echo.
echo 📊 步骤5: 分析构建产物...
echo.
echo 📁 文件大小分析:
for /f "tokens=*" %%f in ('dir "dist\assets\*.js" /b 2^>nul') do (
    for %%s in ("dist\assets\%%f") do (
        set /a size=%%~zs/1024
        echo   %%f: !size! KB
    )
)

echo.
echo 📁 CSS文件:
for /f "tokens=*" %%f in ('dir "dist\assets\*.css" /b 2^>nul') do (
    for %%s in ("dist\assets\%%f") do (
        set /a size=%%~zs/1024
        echo   %%f: !size! KB
    )
)

:: 6. 创建优化的部署配置
echo.
echo 📄 步骤6: 创建部署配置文件...

:: 创建_headers文件（更严格的缓存策略）
(
    echo # 静态资源缓存
    echo /assets/*
    echo   Cache-Control: public, max-age=31536000, immutable
    echo   X-Content-Type-Options: nosniff
    echo.
    echo # CSS文件
    echo *.css
    echo   Content-Type: text/css; charset=utf-8
    echo   X-Content-Type-Options: nosniff
    echo.
    echo # JavaScript文件
    echo *.js
    echo   Content-Type: application/javascript; charset=utf-8
    echo   X-Content-Type-Options: nosniff
    echo.
    echo # JSON文件
    echo *.json
    echo   Content-Type: application/json; charset=utf-8
    echo.
    echo # 字体文件
    echo *.woff2
    echo   Content-Type: font/woff2
    echo   Cache-Control: public, max-age=31536000, immutable
    echo.
    echo # 主页面
    echo /
    echo   X-Frame-Options: DENY
    echo   X-Content-Type-Options: nosniff
    echo   Referrer-Policy: strict-origin-when-cross-origin
) > dist/_headers

:: 创建_redirects文件（更精确的重定向）
(
    echo # 静态资源直接访问
    echo /assets/*  /assets/:splat  200
    echo.
    echo # SPA路由重定向
    echo /*    /index.html   200
) > dist/_redirects

echo ✅ 部署配置文件已创建

:: 7. 验证关键文件
echo.
echo 🔍 步骤7: 验证构建产物...

set "error_found=0"

if not exist "dist\index.html" (
    echo ❌ 缺少 index.html
    set "error_found=1"
)

if not exist "dist\assets" (
    echo ❌ 缺少 assets 目录
    set "error_found=1"
)

if not exist "dist\_headers" (
    echo ❌ 缺少 _headers 文件
    set "error_found=1"
)

if not exist "dist\_redirects" (
    echo ❌ 缺少 _redirects 文件
    set "error_found=1"
)

if "%error_found%"=="1" (
    echo.
    echo ❌ 构建验证失败！
    pause
    exit /b 1
)

echo ✅ 构建产物验证通过

:: 8. 提供部署指导
echo.
echo 🎉 Cloudflare优化构建完成！
echo.
echo 📋 构建优化内容:
echo ✅ 代码分割优化，避免单文件过大
echo ✅ 使用更短的文件名hash
echo ✅ CSS代码分割
echo ✅ 现代浏览器目标编译
echo ✅ 优化的缓存策略
echo.
echo 📝 部署步骤:
echo 1. 压缩 dist 目录为 zip 文件
echo 2. 登录 Cloudflare Pages 控制台
echo 3. 选择项目并上传新版本
echo 4. 等待部署完成（通常2-3分钟）
echo 5. 强制刷新浏览器 (Ctrl+Shift+R)
echo.
echo 🔧 如果仍有问题:
echo - 检查 Cloudflare Pages 的构建日志
echo - 确认文件大小是否在限制内
echo - 清除 Cloudflare 缓存
echo.

:: 恢复原配置
echo 🔄 恢复原配置文件...
if exist "vite.config.backup.ts" (
    copy "vite.config.backup.ts" "vite.config.ts" >nul
    del "vite.config.backup.ts" >nul
    echo ✅ 已恢复原配置
)

pause 