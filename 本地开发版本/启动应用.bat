@echo off
chcp 65001 >nul
title 幻境之旅生成器 - 启动应用
color 0a

echo ==========================================
echo      🚀 启动幻境之旅生成器应用 🚀
echo ==========================================
echo.

echo 📍 当前目录: %CD%
echo.

echo 🔍 检查开发服务器状态...
curl -s http://localhost:5177/ >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 开发服务器已在运行: http://localhost:5177/
    echo.
    echo 🌐 正在打开浏览器...
    start http://localhost:5177/
    echo.
    echo ✅ 应用已启动！
) else (
    echo ❌ 开发服务器未运行，正在启动...
    echo.
    echo 🛠️ 启动开发服务器...
    start /B npm run dev
    
    echo ⏳ 等待服务器启动...
    timeout /t 5 /nobreak >nul
    
    echo 🌐 正在打开浏览器...
    start http://localhost:5177/
    
    echo.
    echo ✅ 应用正在启动中...
    echo 📱 浏览器将自动打开应用页面
)

echo.
echo ==========================================
echo 💡 提示：
echo - 应用地址: http://localhost:5177/
echo - 按 Ctrl+C 可停止开发服务器
echo - 如有问题请检查控制台日志
echo ==========================================

pause 