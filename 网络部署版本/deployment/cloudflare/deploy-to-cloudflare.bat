@echo off
chcp 65001 >nul
title 幻境之旅生成器 - Cloudflare 自动部署
color 0e

echo ==========================================
echo   🚀 幻境之旅生成器 - Cloudflare 自动部署 🚀
echo ==========================================
echo.

:: 检查Node.js版本
echo [步骤1] 检查运行环境...
for /f "tokens=*" %%i in ('node --version 2^>nul') do set NODE_VERSION=%%i
echo Node.js版本: %NODE_VERSION%

:: 检查Wrangler是否已安装
echo 正在检查Wrangler CLI...
npx wrangler --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  当前Node.js版本可能不支持最新Wrangler
    echo 💡 建议升级到Node.js 20+或使用Cloudflare Pages Web界面部署
    echo.
    echo 📂 构建文件已准备在 dist/ 目录
    echo 🌐 请访问 https://dash.cloudflare.com/pages 手动上传部署
    pause
    exit /b 0
) else (
    echo ✅ Wrangler CLI 已就绪
)
echo.

:: 构建项目
echo [步骤2] 构建生产版本...
echo 📦 正在构建项目...
npm run build
if %errorlevel% neq 0 (
    echo ❌ 构建失败，请检查错误信息
    pause
    exit /b 1
)
echo ✅ 构建完成
echo.

:: 检查是否已登录Cloudflare
echo [步骤3] 检查Cloudflare账户...
npx wrangler whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  需要登录Cloudflare账户
    echo 🔐 正在打开浏览器进行授权...
    npx wrangler login
    if %errorlevel% neq 0 (
        echo ❌ 登录失败
        pause
        exit /b 1
    )
) else (
    echo ✅ 已登录Cloudflare账户
)
echo.

:: 部署到Cloudflare Pages
echo [步骤4] 部署到Cloudflare Pages...
echo 🌐 正在部署到全球CDN...
npx wrangler pages deploy dist --project-name=huanjing-zhilv-generator --compatibility-date=2024-06-08
if %errorlevel% neq 0 (
    echo ❌ 部署失败
    pause
    exit /b 1
)

echo.
echo ==========================================
echo 🎉 部署成功！
echo.
echo 📱 应用已部署到Cloudflare Pages
echo 🌍 全球用户可通过以下地址访问：
echo    https://huanjing-zhilv-generator.pages.dev
echo.
echo 💡 提示：
echo   - API密钥需要在Cloudflare Pages中单独配置
echo   - 首次访问可能需要几分钟生效
echo   - 支持自动HTTPS和全球CDN加速
echo ==========================================
pause 