/**
 * TaskMaster AI 项目配置
 * 幻境之旅生成器专用配置
 */

export default {
  // 项目基本信息
  project: {
    name: "幻境之旅生成器",
    description: "基于 React + TypeScript + Vite 的 AI 图像和文本生成应用",
    version: "1.0.0",
    type: "ai-app"
  },

  // AI 模型配置
  models: {
    main: {
      provider: "openrouter",
      modelId: "openai/gpt-4o-mini",
      maxTokens: 120000,
      temperature: 0.2
    },
    research: {
      provider: "google",
      modelId: "gemini-pro",
      maxTokens: 8700,
      temperature: 0.1
    },
    fallback: {
      provider: "openai",
      modelId: "gpt-4o-mini",
      maxTokens: 8192,
      temperature: 0.1
    }
  },

  // 全局设置
  global: {
    logLevel: "info",
    debug: false,
    defaultSubtasks: 5,
    defaultPriority: "medium",
    projectPath: "./",
    srcPath: "./src",
    docsPath: "./docs",
    testsPath: "./tests"
  },

  // 任务模板
  templates: {
    bug_fix: {
      name: "Bug修复任务",
      description: "修复应用程序中的错误",
      priority: "high",
      estimatedTime: "2-4小时"
    },
    feature: {
      name: "功能开发任务", 
      description: "开发新功能或增强现有功能",
      priority: "medium",
      estimatedTime: "4-8小时"
    },
    refactor: {
      name: "代码重构任务",
      description: "改进代码结构和性能",
      priority: "low",
      estimatedTime: "1-3小时"
    }
  },

  // 环境变量
  env: {
    development: {
      apiUrl: "http://localhost:3000",
      debug: true
    },
    production: {
      apiUrl: "https://your-app.com",
      debug: false
    }
  }
}; 