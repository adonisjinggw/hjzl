@echo off
echo 📝 路径引用已更新，请手动检查以下文件:
echo.
echo 🔧 需要手动更新的配置文件:
echo - package.json (如果引用了移动的脚本)
echo - vite.config.ts (如果引用了移动的配置)
echo - README.md (更新文档路径)
echo.
echo 📂 新的文件路径:
echo - 本地部署: deployment/local/
echo - Cloudflare部署: deployment/cloudflare/
echo - GitHub部署: deployment/github/
echo - MCP工具: tools/mcp/
echo - API配置: tools/api-config/
echo - 诊断工具: tools/diagnostic/
echo - 临时文件: temp/
echo.
pause
