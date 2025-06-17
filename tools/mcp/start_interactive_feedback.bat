@echo off
echo 🚀 启动 Interactive Feedback MCP Server (简化版)
echo ================================================

cd /d "C:\Users\Administrator\Downloads\幻境之旅-清洁版"

echo 📍 当前目录: %CD%
echo 📄 启动服务器文件: interactive-feedback-mcp\server_simple.py

python "interactive-feedback-mcp\server_simple.py"

if %errorlevel% neq 0 (
    echo ❌ 服务器启动失败，错误代码: %errorlevel%
    pause
) else (
    echo ✅ 服务器正常退出
) 