#!/usr/bin/env node

/**
 * TaskMaster AI 初始化脚本
 * 为幻境之旅生成器项目初始化 TaskMaster AI
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🚀 正在初始化 TaskMaster AI...\n');

// 创建必要的目录结构
const directories = [
  '.taskmaster',
  '.taskmaster/tasks',
  '.taskmaster/docs',
  '.taskmaster/templates',
  '.taskmaster/reports'
];

directories.forEach(dir => {
  const fullPath = join(projectRoot, dir);
  if (!existsSync(fullPath)) {
    mkdirSync(fullPath, { recursive: true });
    console.log(`✅ 创建目录: ${dir}`);
  }
});

// 创建 TaskMaster 配置文件
const taskmasterConfig = {
  "models": {
    "main": {
      "provider": "openrouter", 
      "modelId": "openai/gpt-4o-mini",
      "maxTokens": 120000,
      "temperature": 0.2
    },
    "research": {
      "provider": "google",
      "modelId": "gemini-pro", 
      "maxTokens": 8700,
      "temperature": 0.1
    },
    "fallback": {
      "provider": "openai",
      "modelId": "gpt-4o-mini",
      "maxTokens": 8192,
      "temperature": 0.1
    }
  },
  "global": {
    "logLevel": "info",
    "debug": false,
    "defaultSubtasks": 5,
    "defaultPriority": "medium",
    "projectName": "幻境之旅生成器",
    "userId": "user_001"
  },
  "project": {
    "name": "幻境之旅生成器",
    "description": "基于 React + TypeScript + Vite 的 AI 图像和文本生成应用",
    "version": "1.0.0",
    "type": "ai-app",
    "framework": "react",
    "language": "typescript"
  }
};

const configPath = join(projectRoot, '.taskmaster', 'config.json');
writeFileSync(configPath, JSON.stringify(taskmasterConfig, null, 2));
console.log('✅ 创建配置文件: .taskmaster/config.json');

// 创建示例任务模板
const taskTemplate = {
  "templates": {
    "bug_fix": {
      "name": "Bug修复任务",
      "description": "修复应用程序中的错误",
      "priority": "high",
      "estimatedTime": "2-4小时",
      "steps": [
        "分析问题",
        "定位错误源",
        "实施修复",
        "测试验证",
        "文档更新"
      ]
    },
    "feature_development": {
      "name": "功能开发任务",
      "description": "开发新功能或增强现有功能", 
      "priority": "medium",
      "estimatedTime": "4-8小时",
      "steps": [
        "需求分析",
        "设计方案",
        "编码实现", 
        "单元测试",
        "集成测试",
        "文档编写"
      ]
    },
    "refactoring": {
      "name": "代码重构任务",
      "description": "改进代码结构和性能",
      "priority": "low", 
      "estimatedTime": "1-3小时",
      "steps": [
        "识别重构点",
        "制定重构计划",
        "执行重构",
        "测试验证",
        "性能对比"
      ]  
    }
  }
};

const templatePath = join(projectRoot, '.taskmaster', 'templates', 'default.json');
writeFileSync(templatePath, JSON.stringify(taskTemplate, null, 2));
console.log('✅ 创建任务模板: .taskmaster/templates/default.json');

// 创建环境变量示例文件
const envExample = `# TaskMaster AI 环境变量配置
# 复制到 .env 文件并填入真实的 API 密钥

# OpenAI API (必需)
OPENAI_API_KEY=sk-your-openai-api-key-here

# OpenRouter API (推荐)
OPENROUTER_API_KEY=sk-or-your-openrouter-api-key-here

# Google AI API
GOOGLE_API_KEY=your-google-ai-api-key-here

# Anthropic Claude API (可选)
ANTHROPIC_API_KEY=your-anthropic-api-key-here

# Perplexity API (可选)
PERPLEXITY_API_KEY=your-perplexity-api-key-here

# TaskMaster 配置
TASKMASTER_PROJECT_PATH=./
TASKMASTER_LOG_LEVEL=info
`;

const envExamplePath = join(projectRoot, '.env.taskmaster.example');
writeFileSync(envExamplePath, envExample);
console.log('✅ 创建环境变量示例: .env.taskmaster.example');

// 创建使用说明文档
const readme = `# TaskMaster AI 集成

TaskMaster AI 已成功集成到幻境之旅生成器项目中。

## 🚀 快速开始

### 1. 配置环境变量
\`\`\`bash
cp .env.taskmaster.example .env.taskmaster
# 编辑 .env.taskmaster 文件，填入您的 API 密钥
\`\`\`

### 2. 运行 TaskMaster AI
\`\`\`bash
# 启动 TaskMaster AI CLI
npm run taskmaster

# 启动 MCP 服务器模式
npm run taskmaster:mcp

# 初始化新任务
npm run taskmaster:init

# 查看状态
npm run taskmaster:status
\`\`\`

## 📁 目录结构

\`\`\`
.taskmaster/
├── config.json          # 主配置文件
├── tasks/               # 任务存储目录
├── templates/           # 任务模板
├── docs/               # 文档目录
└── reports/            # 报告目录
\`\`\`

## 🔧 配置文件

主要配置位于 \`.taskmaster/config.json\` 中，包含：

- **models**: AI 模型配置
- **global**: 全局设置
- **project**: 项目特定配置

## 🎯 使用示例

### 创建新任务
\`\`\`javascript
// 使用 JavaScript/TypeScript
import TaskMaster from 'task-master-ai';

const taskmaster = new TaskMaster();
await taskmaster.createTask({
  title: "优化图像加载性能",
  description: "改进应用中图像的加载速度和用户体验",
  priority: "high",
  template: "feature_development"
});
\`\`\`

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
`;

const readmePath = join(projectRoot, '.taskmaster', 'README.md');
writeFileSync(readmePath, readme);
console.log('✅ 创建使用说明: .taskmaster/README.md');

console.log('\n🎉 TaskMaster AI 初始化完成！');
console.log('\n📋 下一步操作:');
console.log('1. 复制 .env.taskmaster.example 到 .env.taskmaster');
console.log('2. 编辑 .env.taskmaster 文件，填入您的 API 密钥');
console.log('3. 运行 npm run taskmaster:status 检查状态');
console.log('4. 运行 npm run taskmaster:mcp 启动 MCP 服务器');
console.log('\n📖 详细说明请查看: .taskmaster/README.md'); 