# 🎨 幻境之旅生成器

> 基于 React + TypeScript + Vite 的 AI 图像和文本生成应用

## 🌟 项目简介

幻境之旅生成器是一个现代化的AI内容生成平台，集成了多种AI服务商，为用户提供强大的图像和文本生成能力。

### ✨ 核心特性

- 🎯 **多服务商集成** - 16个文本服务商 + 18个图像服务商
- 🚀 **现代化技术栈** - React 19 + TypeScript + Vite
- 🎨 **美观UI设计** - 响应式设计，支持多设备
- ⚡ **智能降级** - 自动服务商切换和容错机制
- 🔧 **灵活配置** - 支持API配置和模型选择
- 🌍 **地图集成** - 集成Leaflet地图功能
- 📱 **PWA支持** - 渐进式Web应用

## 🛠️ 技术栈

### 前端框架
- **React 19** - 最新版本的React框架
- **TypeScript** - 类型安全的JavaScript
- **Vite** - 快速的构建工具

### UI组件
- **Lucide React** - 现代化图标库
- **Tailwind CSS** - 实用优先的CSS框架
- **响应式设计** - 适配各种设备

### 地图服务
- **Leaflet** - 开源地图库
- **免费地图服务** - 支持多种地图提供商

### AI服务集成
- **Google Gemini** - Google AI服务
- **多服务商支持** - 16个文本 + 18个图像服务商
- **智能API管理** - 自动降级和负载均衡

### 开发工具
- **Playwright** - 端到端测试
- **ESLint + TypeScript** - 代码质量保证
- **Wrangler** - Cloudflare部署工具

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn
- Git

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/adonisjinggw/lvxing.git
   cd lvxing
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **构建生产版本**
   ```bash
   npm run build
   ```

### 配置说明

1. **API配置** - 在应用中配置各种AI服务商的API密钥
2. **地图服务** - 配置地图服务提供商
3. **环境变量** - 根据需要设置环境变量

## 📁 项目结构

```
lvxing/
├── components/          # React组件
├── services/           # API服务
├── styles/            # 样式文件
├── scripts/           # 构建脚本
├── docs/              # 文档
├── tests/             # 测试文件
├── App.tsx            # 主应用组件
├── types.ts           # TypeScript类型定义
├── constants.ts       # 常量定义
├── package.json       # 项目配置
└── vite.config.ts     # Vite配置
```

## 🎯 主要功能

### AI文本生成
- 支持16个文本生成服务商
- 智能模型选择
- 自动降级机制
- 实时生成预览

### AI图像生成
- 支持18个图像生成服务商
- 多种图像尺寸和风格
- 批量生成功能
- 图像优化和压缩

### 地图功能
- 交互式地图界面
- 位置标记和路径规划
- 多种地图样式
- 离线地图支持

### 用户体验
- 响应式设计
- 加载状态指示
- 错误处理和恢复
- 用户友好的界面

## 🔧 部署

### Cloudflare Pages
```bash
npm run deploy
```

### 其他平台
项目支持部署到各种静态托管平台：
- Vercel
- Netlify
- GitHub Pages
- 自定义服务器

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- React团队提供的优秀框架
- Vite团队的快速构建工具
- 所有开源贡献者的努力
- AI服务提供商的支持

## 📞 联系方式

- GitHub: [@adonisjinggw](https://github.com/adonisjinggw)
- 项目链接: [https://github.com/adonisjinggw/lvxing](https://github.com/adonisjinggw/lvxing)

---

⭐ 如果这个项目对您有帮助，请给它一个星标！ 