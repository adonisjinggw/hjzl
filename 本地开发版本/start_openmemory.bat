@echo off
echo 启动OpenMemory MCP服务器...
echo 请确保已设置OPENAI_API_KEY环境变量

REM 设置OpenAI API密钥 (请替换为您的实际密钥)
set OPENAI_API_KEY=your_openai_api_key_here

REM 启动OpenMemory MCP服务器
python openmemory_mcp_server.py

pause 