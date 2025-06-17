@echo off
chcp 65001 >nul
title 幻境之旅生成器启动器
color 0a

echo ======================================
echo       🌟 幻境之旅生成器启动器 🌟
echo ======================================
echo.

:: 检查Node.js是否安装
echo [1/5] 检查Node.js环境...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未检测到Node.js，请先安装Node.js
    echo 请访问 https://nodejs.org 下载并安装
    pause
    exit /b 1
)
echo ✅ Node.js环境检查通过

:: 检查npm是否可用
echo [2/5] 检查npm包管理器...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm不可用，请检查Node.js安装
    pause
    exit /b 1
)
echo ✅ npm包管理器检查通过

:: 检查并创建.env.local文件
echo [3/5] 检查环境配置...
if not exist ".env.local" (
    echo ⚠️  未找到环境配置文件，正在创建...
    echo # 幻境之旅生成器环境配置 > .env.local
    echo # 请在下方填入你的Gemini API密钥 >> .env.local
    echo GEMINI_API_KEY=your_gemini_api_key_here >> .env.local
    echo.
    echo ⚠️  重要提醒：
    echo 请编辑 .env.local 文件，将 'your_gemini_api_key_here' 替换为你的真实Gemini API密钥
    echo 获取API密钥请访问：https://makersuite.google.com/app/apikey
    echo.
    echo 配置完成后，请重新运行此启动器
    pause
    exit /b 0
)
echo ✅ 环境配置文件检查通过

:: 检查并安装依赖
echo [4/5] 检查项目依赖...
if not exist "node_modules" (
    echo 📦 正在安装项目依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ 依赖安装失败，请检查网络连接
        pause
        exit /b 1
    )
    echo ✅ 依赖安装完成
) else (
    echo ✅ 项目依赖已存在
)

:: 启动应用
echo [5/5] 启动幻境之旅生成器...
echo.
echo 🚀 正在启动开发服务器...
echo 浏览器将自动打开，如果没有请手动访问显示的本地地址
echo 按 Ctrl+C 可停止服务器
echo.

call npm run dev

echo.
echo 感谢使用幻境之旅生成器！
pause
