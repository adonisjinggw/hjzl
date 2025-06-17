@echo off
chcp 65001 >nul
title 幻境之旅生成器 - 项目状态检查
color 0e

echo ==========================================
echo      🔍 幻境之旅生成器项目状态检查 🔍
echo ==========================================
echo.

:: 检查Node.js版本
echo [检查1] Node.js环境：
node --version 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js未安装
) else (
    echo ✅ Node.js已安装
)
echo.

:: 检查npm版本
echo [检查2] npm包管理器：
npm --version 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm不可用
) else (
    echo ✅ npm可用
)
echo.

:: 检查项目依赖
echo [检查3] 项目依赖：
if exist "node_modules" (
    echo ✅ 依赖已安装
    echo 主要依赖包：
    if exist "node_modules\react" echo   - React: ✅
    if exist "node_modules\vite" echo   - Vite: ✅
    if exist "node_modules\@google\genai" echo   - Gemini AI: ✅
    if exist "node_modules\lucide-react" echo   - Lucide Icons: ✅
) else (
    echo ❌ 依赖未安装，请运行 npm install
)
echo.

:: 检查环境配置
echo [检查4] 环境配置：
if exist ".env.local" (
    echo ✅ 环境配置文件存在
    findstr /C:"GEMINI_API_KEY" .env.local >nul 2>&1
    if %errorlevel% equ 0 (
        findstr /C:"your_gemini_api_key_here" .env.local >nul 2>&1
        if %errorlevel% equ 0 (
            echo ⚠️  请配置真实的Gemini API密钥
        ) else (
            echo ✅ API密钥已配置
        )
    ) else (
        echo ❌ 缺少GEMINI_API_KEY配置
    )
) else (
    echo ❌ 缺少.env.local文件
    echo 请参考"环境配置说明.md"创建此文件
)
echo.

:: 检查项目文件
echo [检查5] 核心文件：
if exist "package.json" (echo ✅ package.json) else (echo ❌ package.json)
if exist "App.tsx" (echo ✅ App.tsx) else (echo ❌ App.tsx)
if exist "index.html" (echo ✅ index.html) else (echo ❌ index.html)
if exist "vite.config.ts" (echo ✅ vite.config.ts) else (echo ❌ vite.config.ts)
echo.

:: 检查启动脚本
echo [检查6] 启动脚本：
if exist "启动幻境之旅.bat" (echo ✅ 启动幻境之旅.bat) else (echo ❌ 启动幻境之旅.bat)
if exist "start-app.bat" (echo ✅ start-app.bat) else (echo ❌ start-app.bat)
echo.

echo ==========================================
echo 检查完成！如果看到❌标记，请解决相应问题。
echo 全部✅后即可运行"启动幻境之旅.bat"启动应用。
echo ==========================================
pause 