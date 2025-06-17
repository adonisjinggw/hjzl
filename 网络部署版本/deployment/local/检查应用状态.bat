@echo off
chcp 65001 >nul
echo.
echo 🔍 应用状态检查工具
echo ===================
echo.

:: 1. 检查端口占用
echo 📋 步骤1: 检查端口状态...
netstat -ano | findstr ":5174" >nul
if errorlevel 1 (
    echo ❌ 端口5174未被占用，应用可能未启动
) else (
    echo ✅ 端口5174正在使用
)

:: 2. 检查Node进程
echo.
echo 📋 步骤2: 检查Node.js进程...
tasklist | findstr "node.exe" >nul
if errorlevel 1 (
    echo ❌ 未找到Node.js进程
) else (
    echo ✅ Node.js进程正在运行
    tasklist | findstr "node.exe"
)

:: 3. 检查关键文件
echo.
echo 📋 步骤3: 检查关键文件...

if not exist "index.html" (
    echo ❌ 缺少 index.html
) else (
    echo ✅ index.html 存在
)

if not exist "App.tsx" (
    echo ❌ 缺少 App.tsx
) else (
    echo ✅ App.tsx 存在
)

if not exist "index.tsx" (
    echo ❌ 缺少 index.tsx
) else (
    echo ✅ index.tsx 存在
)

:: 4. 检查package.json
echo.
echo 📋 步骤4: 检查启动脚本...
if exist "package.json" (
    findstr "\"dev\"" package.json >nul
    if errorlevel 1 (
        echo ❌ 未找到dev脚本
    ) else (
        echo ✅ dev脚本存在
    )
) else (
    echo ❌ 缺少 package.json
)

:: 5. 提供修复建议
echo.
echo 🔧 修复建议:
echo ================================
echo.
echo 1️⃣ 如果看到JavaScript错误:
echo    - 按F12打开开发者工具
echo    - 查看Console标签页的红色错误
echo    - 复制错误信息给我
echo.
echo 2️⃣ 如果应用加载缓慢:
echo    - 等待几秒钟让React加载完成
echo    - 检查网络请求是否卡住
echo.
echo 3️⃣ 如果页面完全空白:
echo    - 可能是CSS样式问题
echo    - 尝试右键→检查元素
echo    - 查看是否有隐藏的内容
echo.
echo 4️⃣ 立即修复操作:
echo.

:: 6. 创建最小化测试页面
echo 📝 创建测试页面...
(
    echo ^<!DOCTYPE html^>
    echo ^<html lang="zh-CN"^>
    echo ^<head^>
    echo   ^<meta charset="UTF-8"^>
    echo   ^<meta name="viewport" content="width=device-width, initial-scale=1.0"^>
    echo   ^<title^>应用状态测试^</title^>
    echo   ^<style^>
    echo     body { font-family: sans-serif; padding: 20px; background: #1e3a8a; color: white; }
    echo     .status { background: #22c55e; padding: 10px; border-radius: 5px; margin: 10px 0; }
    echo     .error { background: #ef4444; padding: 10px; border-radius: 5px; margin: 10px 0; }
    echo   ^</style^>
    echo ^</head^>
    echo ^<body^>
    echo   ^<h1^>🔍 应用状态测试页面^</h1^>
    echo   ^<div class="status"^>✅ HTML加载成功^</div^>
    echo   ^<div id="react-test"^>⏳ 正在检查React...^</div^>
    echo   
    echo   ^<script^>
    echo     // 检查React是否加载
    echo     setTimeout(function() {
    echo       const reactTest = document.getElementById('react-test'^);
    echo       if (window.React^) {
    echo         reactTest.className = 'status';
    echo         reactTest.textContent = '✅ React已加载';
    echo       } else {
    echo         reactTest.className = 'error';
    echo         reactTest.textContent = '❌ React未加载';
    echo       }
    echo     }, 2000^);
    echo     
    echo     // 检查控制台错误
    echo     window.addEventListener('error', function(e^) {
    echo       console.error('发现错误:', e.error^);
    echo       document.body.innerHTML += '^<div class="error"^>❌ 发现JavaScript错误: ' + e.message + '^</div^>';
    echo     }^);
    echo   ^</script^>
    echo ^</body^>
    echo ^</html^>
) > test-status.html

echo ✅ 已创建 test-status.html 测试页面
echo.
echo 🌐 请在浏览器中打开以下地址测试:
echo    http://localhost:5174/test-status.html
echo.

:: 7. 尝试重启开发服务器
echo 🔄 是否重启开发服务器? (Y/N):
set /p restart=
if /i "%restart%"=="Y" (
    echo.
    echo 🛑 停止现有服务器...
    taskkill /f /im node.exe >nul 2>&1
    
    echo ⏳ 等待3秒...
    timeout /t 3 >nul
    
    echo 🚀 重新启动服务器...
    start cmd /k "npm run dev"
    
    echo ✅ 新的开发服务器已启动
    echo 🌐 请打开: http://localhost:8080
)

echo.
echo 📞 如果问题仍然存在，请提供:
echo 1. 浏览器控制台的错误信息
echo 2. 终端中的错误日志
echo 3. test-status.html 的显示结果
echo.
pause 