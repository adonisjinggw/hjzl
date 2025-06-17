# TaskMaster AI 集成

TaskMaster AI 已成功集成到幻境之旅生成器项目中。

## 🚀 快速开始

### 1. 配置环境变量
```bash
cp .env.taskmaster.example .env.taskmaster
# 编辑 .env.taskmaster 文件，填入您的 API 密钥
```

### 2. 运行 TaskMaster AI
```bash
# 启动 TaskMaster AI CLI
npm run taskmaster

# 启动 MCP 服务器模式
npm run taskmaster:mcp

# 初始化新任务
npm run taskmaster:init

# 查看状态
npm run taskmaster:status
```

## 📁 目录结构

```
.taskmaster/
├── config.json          # 主配置文件
├── tasks/               # 任务存储目录
├── templates/           # 任务模板
├── docs/               # 文档目录
└── reports/            # 报告目录
```

## 🔧 配置文件

主要配置位于 `.taskmaster/config.json` 中，包含：

- **models**: AI 模型配置
- **global**: 全局设置
- **project**: 项目特定配置

## 🎯 使用示例

### 创建新任务
```javascript
// 使用 JavaScript/TypeScript
import TaskMaster from 'task-master-ai';

const taskmaster = new TaskMaster();
await taskmaster.createTask({
  title: "优化图像加载性能",
  description: "改进应用中图像的加载速度和用户体验",
  priority: "high",
  template: "feature_development"
});
```

### MCP 集成
TaskMaster AI 现在可以作为 MCP (Model Context Protocol) 服务器运行，与 Cursor 等编辑器无缝集成。

## 🛠️ 故障排除

如果遇到问题，请检查：

1. Node.js 版本 >= 18.19.0
2. 环境变量是否正确配置
3. API 密钥是否有效
4. 网络连接是否正常

## 📚 更多资源

- [TaskMaster AI 官方文档](https://github.com/eyaltoledano/claude-task-master)
- [MCP 协议说明](https://modelcontextprotocol.io)
