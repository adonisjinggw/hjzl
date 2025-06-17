@echo off
chcp 65001 >nul
echo.
echo 🔬 原始诊断测试
echo ===============
echo.

:: 1. 创建纯HTML测试页面
echo 📄 创建纯HTML测试页面...
(
    echo ^<!DOCTYPE html^>
    echo ^<html lang="zh-CN"^>
    echo ^<head^>
    echo   ^<meta charset="UTF-8"^>
    echo   ^<meta name="viewport" content="width=device-width, initial-scale=1.0"^>
    echo   ^<title^>原始诊断测试^</title^>
    echo   ^<style^>
    echo     body {
    echo       margin: 0^;
    echo       padding: 20px^;
    echo       background: linear-gradient^(45deg, #ff6b6b, #4ecdc4^)^;
    echo       color: white^;
    echo       font-family: Arial, sans-serif^;
    echo       min-height: 100vh^;
    echo       display: flex^;
    echo       flex-direction: column^;
    echo       align-items: center^;
    echo       justify-content: center^;
    echo     }
    echo     .test-result {
    echo       background: rgba^(255,255,255,0.2^)^;
    echo       padding: 20px^;
    echo       border-radius: 10px^;
    echo       margin: 10px^;
    echo       text-align: center^;
    echo     }
    echo     .success { background: rgba^(34,197,94,0.8^)^; }
    echo     .error { background: rgba^(239,68,68,0.8^)^; }
    echo   ^</style^>
    echo ^</head^>
    echo ^<body^>
    echo   ^<h1^>🔬 原始诊断测试^</h1^>
    echo   
    echo   ^<div class="test-result success"^>
    echo     ^<h2^>✅ HTML加载成功^</h2^>
    echo     ^<p^>基础HTML渲染正常^</p^>
    echo   ^</div^>
    echo   
    echo   ^<div id="js-test" class="test-result"^>
    echo     ^<h2^>⏳ JavaScript测试中...^</h2^>
    echo   ^</div^>
    echo   
    echo   ^<div id="react-test" class="test-result"^>
    echo     ^<h2^>⏳ React测试中...^</h2^>
    echo   ^</div^>
    echo   
    echo   ^<div id="vite-test" class="test-result"^>
    echo     ^<h2^>⏳ Vite模块测试中...^</h2^>
    echo   ^</div^>
    echo   
    echo   ^<script^>
    echo     // 测试基础JavaScript
    echo     try {
    echo       const jsTest = document.getElementById^('js-test'^)^;
    echo       jsTest.className = 'test-result success'^;
    echo       jsTest.innerHTML = '^<h2^>✅ JavaScript正常^</h2^>^<p^>基础JS功能工作正常^</p^>'^;
    echo     } catch^(e^) {
    echo       console.error^('JavaScript错误:', e^)^;
    echo     }
    echo     
    echo     // 测试ES模块和React
    echo     setTimeout^(async function^(^) {
    echo       const reactTest = document.getElementById^('react-test'^)^;
    echo       const viteTest = document.getElementById^('vite-test'^)^;
    echo       
    echo       try {
    echo         // 测试动态导入React
    echo         const React = await import^('/node_modules/react/index.js'^)^;
    echo         reactTest.className = 'test-result success'^;
    echo         reactTest.innerHTML = '^<h2^>✅ React导入成功^</h2^>^<p^>React库可以正常加载^</p^>'^;
    echo       } catch^(e^) {
    echo         reactTest.className = 'test-result error'^;
    echo         reactTest.innerHTML = '^<h2^>❌ React导入失败^</h2^>^<p^>' + e.message + '^</p^>'^;
    echo         console.error^('React导入错误:', e^)^;
    echo       }
    echo       
    echo       try {
    echo         // 测试Vite的模块解析
    echo         const response = await fetch^('/index.tsx'^)^;
    echo         if ^(response.ok^) {
    echo           viteTest.className = 'test-result success'^;
    echo           viteTest.innerHTML = '^<h2^>✅ Vite模块解析正常^</h2^>^<p^>TypeScript文件可以访问^</p^>'^;
    echo         } else {
    echo           throw new Error^('HTTP ' + response.status^)^;
    echo         }
    echo       } catch^(e^) {
    echo         viteTest.className = 'test-result error'^;
    echo         viteTest.innerHTML = '^<h2^>❌ Vite模块解析失败^</h2^>^<p^>' + e.message + '^</p^>'^;
    echo         console.error^('Vite模块错误:', e^)^;
    echo       }
    echo     }, 1000^)^;
    echo     
    echo     // 全局错误监听
    echo     window.addEventListener^('error', function^(e^) {
    echo       console.error^('全局错误:', e.error^)^;
    echo       document.body.innerHTML += '^<div class="test-result error"^>^<h2^>❌ 全局错误^</h2^>^<p^>' + e.message + '^</p^>^</div^>'^;
    echo     }^)^;
    echo   ^</script^>
    echo ^</body^>
    echo ^</html^>
) > raw-test.html

:: 2. 创建最简单的index.html测试
echo.
echo 📄 创建最简单的index.html...
(
    echo ^<!DOCTYPE html^>
    echo ^<html lang="zh-CN"^>
    echo ^<head^>
    echo   ^<meta charset="UTF-8" /^>
    echo   ^<meta name="viewport" content="width=device-width, initial-scale=1.0" /^>
    echo   ^<title^>最简测试^</title^>
    echo   ^<style^>
    echo     body { 
    echo       background: red^; 
    echo       color: white^; 
    echo       padding: 50px^; 
    echo       font-size: 30px^; 
    echo       text-align: center^;
    echo     }
    echo   ^</style^>
    echo ^</head^>
    echo ^<body^>
    echo   ^<h1^>🔴 最简测试页面^</h1^>
    echo   ^<div id="root"^>如果看到这个，说明HTML正常^</div^>
    echo   ^<script^>
    echo     console.log^('🔬 最简测试脚本运行'^)^;
    echo     document.getElementById^('root'^).innerHTML = '^<h2^>✅ JavaScript也正常^</h2^>'^;
    echo   ^</script^>
    echo ^</body^>
    echo ^</html^>
) > index-simple.html

echo ✅ 测试页面已创建
echo.
echo 🌐 请分别测试以下页面:
echo.
echo 1️⃣ 原始诊断页面:
echo    http://localhost:8080/raw-test.html
echo.
echo 2️⃣ 最简测试页面:  
echo    http://localhost:8080/index-simple.html
echo.
echo 3️⃣ 标准React页面:
echo    http://localhost:8080/
echo.
echo 📋 预期结果:
echo ✅ 如果1和2都正常，3异常 = React/TypeScript配置问题
echo ❌ 如果1和2都异常 = 基础Web服务问题
echo ❌ 如果只有3异常 = React渲染问题
echo.
echo �� 测试完成后请告诉我结果！
pause 