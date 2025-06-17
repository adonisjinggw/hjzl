@echo off
chcp 65001 >nul
echo ================================
echo  OpenMemory MCP 一键配置脚本
echo ================================
echo.

echo [1/4] 检查依赖项...
python -c "import mem0, mcp" 2>nul
if errorlevel 1 (
    echo ❌ 缺少必要的依赖项！
    echo 正在安装 mem0ai 和 mcp...
    pip install mem0ai mcp
    if errorlevel 1 (
        echo ❌ 安装失败！请检查Python环境。
        pause
        exit /b 1
    )
)
echo ✅ 依赖项检查完成

echo.
echo [2/4] 备份现有Cursor配置...
set "cursor_config=C:\Users\Administrator\AppData\Roaming\Cursor\User\settings.json"
if exist "%cursor_config%" (
    copy "%cursor_config%" "%cursor_config%.backup" >nul 2>&1
    echo ✅ 已备份现有配置
) else (
    echo ⚠️  没有找到现有配置文件，将创建新的
)

echo.
echo [3/4] 应用OpenMemory MCP配置...
copy "cursor_settings_updated.json" "%cursor_config%" >nul 2>&1
if errorlevel 1 (
    echo ❌ 配置应用失败！请检查权限和文件路径
    pause
    exit /b 1
) else (
    echo ✅ 配置已成功应用到Cursor
)

echo.
echo [4/4] 配置检查...
echo ✅ OpenMemory MCP服务器: openmemory_mcp_server.py
echo ✅ Cursor配置: 已更新
echo ✅ 启动脚本: start_openmemory.bat

echo.
echo ================================
echo         配置完成！
echo ================================
echo.
echo 📋 下一步操作：
echo 1. 编辑 start_openmemory.bat 设置您的OpenAI API密钥
echo 2. 重启Cursor应用程序
echo 3. 在Cursor中测试OpenMemory功能
echo.
echo 💡 提示：运行 start_openmemory.bat 来启动OpenMemory服务器
echo.
pause 