@echo off
echo ================================================
echo      🌟 幻境之旅生成器 - 启动脚本 v2.0
echo ================================================
echo.

echo 💡 检查Node.js环境...
node --version
if %errorlevel% neq 0 (
    echo ❌ 错误：未检测到Node.js环境
    echo 📥 请先安装Node.js: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js环境正常
echo.

echo 📦 检查依赖包...
if not exist "node_modules" (
    echo 🔄 正在安装依赖包...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
) else (
    echo ✅ 依赖包已安装
)

echo.
echo 🚀 启动开发服务器...
echo 📍 使用端口: 8080 (避免权限问题)
echo 🌐 访问地址: http://localhost:8080
echo 🌐 网络访问: http://0.0.0.0:8080
echo.
echo 💡 提示：如果遇到端口占用，程序会自动尝试其他端口
echo ⏹️  按 Ctrl+C 停止服务器
echo.

:: 使用0.0.0.0避免IPv6权限问题，端口8080通常没有权限限制
npx vite --host 0.0.0.0 --port 8080

if %errorlevel% neq 0 (
    echo.
    echo ❌ 服务器启动失败，尝试备用端口...
    echo 🔄 尝试端口 9000...
    npx vite --host 0.0.0.0 --port 9000
)

pause 