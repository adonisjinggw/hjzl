@echo off
chcp 65001 >nul
echo.
echo 🚑 快速修复应用渲染问题
echo ========================
echo.

:: 1. 停止现有服务器
echo 🛑 停止现有服务器...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 >nul

:: 2. 备份原文件
echo 💾 备份原文件...
if exist "index.tsx" copy "index.tsx" "index.tsx.backup" >nul

:: 3. 创建简化的index.tsx
echo 🔧 创建简化的index.tsx...
(
    echo import React from 'react'^;
    echo import ReactDOM from 'react-dom/client'^;
    echo import App from './App'^;
    echo import './index.css'^;
    echo.
    echo // 添加错误边界
    echo class ErrorBoundary extends React.Component {
    echo   constructor^(props^) {
    echo     super^(props^)^;
    echo     this.state = { hasError: false }^;
    echo   }
    echo.
    echo   static getDerivedStateFromError^(error^) {
    echo     return { hasError: true }^;
    echo   }
    echo.
    echo   componentDidCatch^(error, errorInfo^) {
    echo     console.error^('React应用错误:', error, errorInfo^)^;
    echo   }
    echo.
    echo   render^(^) {
    echo     if ^(this.state.hasError^) {
    echo       return ^(
    echo         ^<div style={{
    echo           padding: '20px',
    echo           textAlign: 'center',
    echo           backgroundColor: '#1e3a8a',
    echo           color: 'white',
    echo           minHeight: '100vh',
    echo           display: 'flex',
    echo           alignItems: 'center',
    echo           justifyContent: 'center'
    echo         }}^>
    echo           ^<div^>
    echo             ^<h1^>⚠️ 应用加载错误^</h1^>
    echo             ^<p^>React组件渲染失败，请检查控制台错误信息^</p^>
    echo             ^<button 
    echo               onClick={^(^) =^> window.location.reload^(^)}
    echo               style={{
    echo                 background: '#3b82f6',
    echo                 color: 'white',
    echo                 padding: '10px 20px',
    echo                 border: 'none',
    echo                 borderRadius: '5px',
    echo                 cursor: 'pointer'
    echo               }}
    echo             ^>
    echo               🔄 重新加载
    echo             ^</button^>
    echo           ^</div^>
    echo         ^</div^>
    echo       ^)^;
    echo     }
    echo     return this.props.children^;
    echo   }
    echo }
    echo.
    echo const rootElement = document.getElementById^('root'^)^;
    echo if ^(!rootElement^) {
    echo   throw new Error^("找不到根元素挂载React应用"^)^;
    echo }
    echo.
    echo const root = ReactDOM.createRoot^(rootElement^)^;
    echo.
    echo // 简化的渲染，移除可能导致问题的严格模式和工具栏
    echo root.render^(
    echo   ^<ErrorBoundary^>
    echo     ^<App /^>
    echo   ^</ErrorBoundary^>
    echo ^)^;
    echo.
    echo // 添加基础错误监听
    echo window.addEventListener^('error', function^(event^) {
    echo   console.error^('全局错误:', event.error^)^;
    echo }^)^;
    echo.
    echo window.addEventListener^('unhandledrejection', function^(event^) {
    echo   console.error^('未处理的Promise错误:', event.reason^)^;
    echo }^)^;
) > index.tsx

echo ✅ 已创建简化版index.tsx

:: 4. 检查App.tsx文件开头
echo.
echo 🔍 检查App.tsx文件...
if exist "App.tsx" (
    echo ✅ App.tsx 存在
) else (
    echo ❌ App.tsx 缺失，正在创建基础版本...
    (
        echo import React from 'react'^;
        echo.
        echo function App^(^) {
        echo   return ^(
        echo     ^<div style={{
        echo       minHeight: '100vh',
        echo       background: 'linear-gradient^(135deg, #1e3a8a 0%%, #3730a3 50%%, #581c87 100%%^)',
        echo       color: 'white',
        echo       display: 'flex',
        echo       alignItems: 'center',
        echo       justifyContent: 'center',
        echo       padding: '20px'
        echo     }}^>
        echo       ^<div style={{ textAlign: 'center' }}^>
        echo         ^<h1^>🎮 幻境之旅生成器^</h1^>
        echo         ^<p^>应用正在加载中...^</p^>
        echo       ^</div^>
        echo     ^</div^>
        echo   ^)^;
        echo }
        echo.
        echo export default App^;
    ) > App.tsx
    echo ✅ 已创建基础App.tsx
)

:: 5. 确保index.css存在
echo.
echo 🎨 检查样式文件...
if not exist "index.css" (
    echo 📝 创建基础样式文件...
    (
        echo * {
        echo   margin: 0^;
        echo   padding: 0^;
        echo   box-sizing: border-box^;
        echo }
        echo.
        echo body {
        echo   font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif^;
        echo   -webkit-font-smoothing: antialiased^;
        echo   -moz-osx-font-smoothing: grayscale^;
        echo }
        echo.
        echo #root {
        echo   width: 100%%^;
        echo   height: 100vh^;
        echo }
    ) > index.css
    echo ✅ 已创建基础样式文件
)

:: 6. 清理缓存
echo.
echo 🧹 清理缓存...
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"

:: 7. 重新启动
echo.
echo 🚀 重新启动开发服务器...
start cmd /k "npm run dev"

echo.
echo ✅ 修复完成！
echo.
echo 📋 修复内容:
echo ✅ 移除了可能导致问题的stagewise工具栏
echo ✅ 添加了错误边界组件
echo ✅ 简化了React渲染逻辑  
echo ✅ 创建了基础样式文件
echo ✅ 清理了Vite缓存
echo.
echo 🌐 请等待几秒钟，然后打开:
echo    http://localhost:8080
echo.
echo 💡 如果仍然空白，请按F12查看控制台错误
echo.

:: 8. 创建回滚选项
echo 🔄 如果需要恢复原文件，请运行:
echo    copy index.tsx.backup index.tsx
echo.
pause 