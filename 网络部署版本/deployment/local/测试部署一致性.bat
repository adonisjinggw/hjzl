@echo off
chcp 65001 >nul
title 测试部署一致性 - 幻境之旅生成器
color 0b

echo ===============================================
echo         🧪 部署一致性测试工具 🧪
echo ===============================================
echo.

echo 📋 正在检查环境配置...

:: 检查环境变量文件
if exist ".env.local" (
    echo ✅ 找到本地环境配置文件
    echo 📄 当前配置内容:
    echo ---------------------
    type .env.local
    echo ---------------------
    echo.
) else (
    echo ❌ 未找到 .env.local 文件
    echo 💡 建议：创建 .env.local 文件并配置 GEMINI_API_KEY
    echo.
)

echo 🔍 选择测试方式:
echo.
echo [1] 测试本地开发环境 (npm run dev)
echo [2] 测试生产构建 (本地预览)
echo [3] 测试统一构建 (模拟部署环境)
echo [4] 对比所有环境差异
echo [5] 退出
echo.

set /p choice="请选择测试方式 (1-5): "

if "%choice%"=="1" (
    echo.
    echo === 🔧 启动本地开发环境 ===
    echo 这将启动开发服务器，使用 .env.local 配置
    echo.
    npm run dev
    
) else if "%choice%"=="2" (
    echo.
    echo === 🏗️ 测试生产构建 ===
    echo 这将构建生产版本并启动本地预览
    echo.
    call npm run build
    if %errorlevel% equ 0 (
        echo ✅ 构建成功，启动预览服务器...
        npm run preview
    ) else (
        echo ❌ 构建失败
        pause
    )
    
) else if "%choice%"=="3" (
    echo.
    echo === 🎯 测试统一构建 ===
    echo 这将使用统一构建脚本，模拟部署环境
    echo.
    call npm run build:unified
    if %errorlevel% equ 0 (
        echo ✅ 统一构建成功
        echo.
        echo 📊 构建信息:
        if exist "dist\build-info.json" (
            type dist\build-info.json
        )
        echo.
        echo 🚀 启动预览服务器...
        npm run preview
    ) else (
        echo ❌ 统一构建失败
        pause
    )
    
) else if "%choice%"=="4" (
    echo.
    echo === 📊 对比环境差异 ===
    echo.
    
    echo 📋 本地环境配置:
    echo ---------------------
    if exist ".env.local" (
        type .env.local
    ) else (
        echo 未找到 .env.local
    )
    echo.
    
    echo 📋 生产环境配置:
    echo ---------------------
    if exist ".env.production" (
        type .env.production
    ) else (
        echo 未找到 .env.production (构建时自动生成)
    )
    echo.
    
    echo 📋 Vite 配置分析:
    echo ---------------------
    echo 检查 vite.config.ts 中的环境变量处理...
    echo 本地模式: loadEnv(mode, '.', '')
    echo 生产模式: 使用构建时环境变量
    echo.
    
    echo 📋 建议:
    echo 1. 确保 .env.local 中有有效的 GEMINI_API_KEY
    echo 2. 使用 npm run build:unified 进行统一构建
    echo 3. 部署时使用统一的环境变量配置
    echo.
    pause
    
) else if "%choice%"=="5" (
    echo 👋 感谢使用部署一致性测试工具！
    exit /b 0
    
) else (
    echo ❌ 无效选择，请重新运行脚本
    pause
    exit /b 1
)

echo.
echo ✅ 测试完成！
pause 