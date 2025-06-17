# 🚀 幻境之旅生成器 - 部署指南

## 📦 项目概述

**幻境之旅生成器** 是一个基于 React + TypeScript + Vite 的 AI 图像和文本生成应用，集成了多种 AI 服务商：
- **文本生成**：16个服务商（OpenAI、Claude、Gemini、DeepSeek等）
- **图像生成**：18个服务商（DALL-E、Midjourney、Stability AI等）
- **高级功能**：模型选择、API配置、智能降级、MCP集成

## 🔧 快速部署

### 1. 克隆项目
```bash
git clone https://github.com/adonisjinggw/hjzl.git
cd hjzl
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
```bash
# 复制并编辑环境变量文件
cp 环境变量配置说明.md .env.example
# 创建实际的 .env 文件并填入API密钥
```

### 4. 配置MCP服务（可选）
```bash
# 复制MCP配置模板
cp .cursor/mcp.json.template .cursor/mcp.json
# 编辑 .cursor/mcp.json 填入实际的API密钥
```

### 5. 启动开发服务器
```bash
npm run dev
```

### 6. 构建生产版本
```bash
npm run build
npm run preview
```

## 🛡️ 安全配置

### 敏感信息保护
- ✅ 所有API密钥通过环境变量管理
- ✅ `.env` 和 `.cursor/mcp.json` 已在 `.gitignore` 中排除
- ✅ 提供模板文件用于配置指导
- ✅ 敏感信息不会被提交到版本控制

### 文件结构
```
├── .cursor/
│   ├── mcp.json.template     # MCP配置模板（安全）
│   └── mcp.json             # 实际MCP配置（被忽略）
├── .env.example             # 环境变量示例
├── .env                     # 实际环境变量（被忽略）
├── 环境变量配置说明.md        # 配置指南
└── DEPLOYMENT_GUIDE.md      # 本文件
```

## 🌐 部署选项

### Vercel 部署
1. Fork 项目到你的 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 自动部署

### Netlify 部署
1. 连接 GitHub 仓库
2. 设置构建命令：`npm run build`
3. 设置发布目录：`dist`
4. 配置环境变量

### 自托管部署
```bash
# 构建项目
npm run build

# 使用任何静态文件服务器
npx serve dist
# 或
python -m http.server 8080 --directory dist
```

## 🔧 高级配置

### API服务商配置
项目支持多个AI服务商，可以根据需要启用：

#### 文本生成服务商
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Google (Gemini)
- DeepSeek
- Moonshot
- SiliconFlow
- Tencent Hunyuan
- 等16个服务商

#### 图像生成服务商
- OpenAI DALL-E
- Stability AI
- Midjourney (通过API)
- 等18个服务商

### MCP 服务集成
支持以下MCP服务：
- `browser-tools` - 浏览器自动化
- `playwright` - 自动化测试
- `mcp-feedback-collector` - 交互式反馈
- `promptx` - 提示工程
- `Figma` - 设计工具集成
- `GitHub` - 代码仓库管理
- `taskmaster-ai` - AI任务管理

## 🐛 故障排除

### 常见问题

1. **API密钥错误**
   - 检查 `.env` 文件中的API密钥格式
   - 确认API密钥有效且有足够配额

2. **MCP服务无法启动**
   - 检查 `.cursor/mcp.json` 配置
   - 确认Node.js版本兼容性

3. **构建失败**
   - 清除缓存：`npm run clean`
   - 重新安装依赖：`rm -rf node_modules && npm install`

4. **端口冲突**
   - 修改 `vite.config.ts` 中的端口配置
   - 或使用环境变量 `VITE_DEV_PORT`

### 获取帮助
- 查看项目 Issues：https://github.com/adonisjinggw/hjzl/issues
- 参考配置文档：`环境变量配置说明.md`
- 检查服务状态：各AI服务商官网

## 📄 许可证

本项目基于开源许可证发布，请查看 LICENSE 文件了解详情。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进项目！

---

**版本**: v1.0.0  
**最后更新**: 2024-12-31  
**维护者**: 幻境之旅开发团队 