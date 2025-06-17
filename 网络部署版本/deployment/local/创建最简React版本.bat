@echo off
chcp 65001 >nul
echo.
echo 🧪 创建最简React版本测试
echo ========================
echo.

:: 1. 备份复杂文件
echo 💾 备份现有文件...
if exist "App.tsx" copy "App.tsx" "App.tsx.complex" >nul
if exist "index.tsx" copy "index.tsx" "index.tsx.complex" >nul

:: 2. 创建超简化的App.tsx
echo 🔧 创建超简化App.tsx...
(
    echo import React from 'react'^;
    echo.
    echo export default function App^(^) {
    echo   return ^(
    echo     ^<div 
    echo       style={{
    echo         width: '100vw',
    echo         height: '100vh',
    echo         background: 'linear-gradient^(45deg, #ff6b6b, #4ecdc4^)',
    echo         display: 'flex',
    echo         alignItems: 'center',
    echo         justifyContent: 'center',
    echo         fontFamily: 'Arial, sans-serif',
    echo         color: 'white'
    echo       }}
    echo     ^>
    echo       ^<div style={{ textAlign: 'center' }}^>
    echo         ^<h1^>🎉 React应用运行成功！^</h1^>
    echo         ^<p^>当前时间: {new Date^(^).toLocaleString^(^)}^</p^>
    echo         ^<button 
    echo           onClick={^(^) =^> alert^('按钮点击成功！'^)}
    echo           style={{
    echo             background: '#fff',
    echo             color: '#333',
    echo             border: 'none',
    echo             padding: '10px 20px',
    echo             borderRadius: '5px',
    echo             cursor: 'pointer',
    echo             fontSize: '16px',
    echo             marginTop: '20px'
    echo           }}
    echo         ^>
    echo           🖱️ 点击测试
    echo         ^</button^>
    echo       ^</div^>
    echo     ^</div^>
    echo   ^)^;
    echo }
) > App.tsx

echo ✅ 已创建超简化App.tsx

:: 3. 创建超简化的index.tsx
echo.
echo 🔧 创建超简化index.tsx...
(
    echo import React from 'react'^;
    echo import ReactDOM from 'react-dom/client'^;
    echo import App from './App'^;
    echo.
    echo const root = document.getElementById^('root'^)^;
    echo.
    echo if ^(root^) {
    echo   ReactDOM.createRoot^(root^).render^(^<App /^>^)^;
    echo } else {
    echo   console.error^('Root element not found'^)^;
    echo }
) > index.tsx

echo ✅ 已创建超简化index.tsx

:: 4. 确保index.html存在且正确
echo.
echo 📄 检查index.html...
if not exist "index.html" (
    echo 📝 创建基础index.html...
    (
        echo ^<!DOCTYPE html^>
        echo ^<html lang="zh-CN"^>
        echo ^<head^>
        echo   ^<meta charset="UTF-8" /^>
        echo   ^<meta name="viewport" content="width=device-width, initial-scale=1.0" /^>
        echo   ^<title^>幻境之旅 - 测试版本^</title^>
        echo ^</head^>
        echo ^<body^>
        echo   ^<div id="root"^>^</div^>
        echo   ^<script type="module" src="/index.tsx"^>^</script^>
        echo ^</body^>
        echo ^</html^>
    ) > index.html
    echo ✅ 已创建基础index.html
) else (
    echo ✅ index.html 已存在
)

:: 5. 清理缓存并重启
echo.
echo 🧹 清理缓存...
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"

echo.
echo 🛑 停止现有服务器...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 >nul

echo.
echo 🚀 启动测试版本...
start cmd /k "echo 🧪 超简化React测试版本 && npm run dev"

echo.
echo ✅ 超简化版本已创建！
echo.
echo 📊 测试结果判断:
echo ✅ 如果看到彩色背景和"React应用运行成功"文字 = React正常
echo ❌ 如果仍然空白 = JavaScript/TypeScript编译问题
echo ❌ 如果看到错误页面 = 依赖问题
echo.
echo 🌐 请打开: http://localhost:8080
echo.
echo 🔄 恢复复杂版本:
echo    copy App.tsx.complex App.tsx
echo    copy index.tsx.complex index.tsx
echo.
pause 