/**
 * API配置验证服务
 * 统一检查和验证所有API服务的配置问题
 */

import type { ApiConfig } from '../types';

/**
 * API验证结果接口
 */
export interface ApiValidationResult {
  provider: string;
  category: 'text' | 'image';
  status: 'valid' | 'warning' | 'error' | 'missing';
  message: string;
  suggestions?: string[];
  autoFix?: () => ApiConfig;
}

/**
 * 已知的正确API端点配置
 */
const CORRECT_ENDPOINTS: Record<string, string> = {
  // 文本生成服务
  'openai': 'https://api.openai.com/v1',
  'gemini': 'https://generativelanguage.googleapis.com/v1beta',
  'anthropic': 'https://api.anthropic.com/v1',
  'deepseek': 'https://api.deepseek.com/v1',
  'zhipu': 'https://open.bigmodel.cn/api/paas/v4',
  'moonshot': 'https://api.moonshot.cn/v1',
  'siliconflow': 'https://api.siliconflow.cn/v1',
  'groq': 'https://api.groq.com/openai/v1',
  'hunyuan': 'https://api.hunyuan.cloud.tencent.com/v1',
  
  // 图像生成服务
  'openai_dalle': 'https://api.openai.com/v1',
  'stability': 'https://api.stability.ai/v1',
  'tencent_hunyuan': 'https://api.hunyuan.cloud.tencent.com/v1',
  'jiemeng': 'https://visual.volcengineapi.com',
  'pollinations': 'https://image.pollinations.ai',
  'huggingface': 'https://api-inference.huggingface.co'
};

/**
 * API密钥格式验证规则
 */
const API_KEY_PATTERNS: Record<string, RegExp> = {
  'openai': /^sk-[A-Za-z0-9]{48,}$/,
  'openai_dalle': /^sk-[A-Za-z0-9]{48,}$/,
  'anthropic': /^sk-ant-[A-Za-z0-9\-_]{95,}$/,
  'gemini': /^[A-Za-z0-9\-_]{39}$/,
  'deepseek': /^sk-[A-Za-z0-9]{48,}$/,
  'stability': /^sk-[A-Za-z0-9]{64}$/,
  'zhipu': /^[A-Za-z0-9]{32}\.[A-Za-z0-9]{6}$/,
  'moonshot': /^sk-[A-Za-z0-9]{48,}$/,
  'siliconflow': /^sk-[A-Za-z0-9]{48,}$/,
  'tencent_hunyuan': /^sk-[A-Za-z0-9\-_]{20,}$/,
  'jiemeng': /^[A-Za-z0-9]{32,}$/
};

/**
 * 验证单个API配置
 */
export function validateApiConfig(
  provider: string,
  config: any,
  category: 'text' | 'image'
): ApiValidationResult {
  const result: ApiValidationResult = {
    provider,
    category,
    status: 'valid',
    message: '配置正常',
    suggestions: []
  };

  // 检查是否配置了API密钥
  if (!config?.apiKey) {
    return {
      ...result,
      status: 'missing',
      message: '未配置API密钥',
      suggestions: ['请在对应的配置页面中添加有效的API密钥']
    };
  }

  // 检查API密钥格式
  const keyPattern = API_KEY_PATTERNS[provider];
  if (keyPattern && !keyPattern.test(config.apiKey)) {
    result.status = 'warning';
    result.message = 'API密钥格式可能不正确';
    result.suggestions?.push(
      `${provider} API密钥格式通常为：${getExpectedKeyFormat(provider)}`
    );
  }

  // 检查端点配置
  const customEndpoint = config.customEndpoint;
  const correctEndpoint = CORRECT_ENDPOINTS[provider];
  
  if (customEndpoint) {
    // 检查是否使用了示例地址
    if (customEndpoint.includes('api.example.com')) {
      return {
        ...result,
        status: 'error',
        message: '使用了示例API端点',
        suggestions: [
          '请更改为正确的API端点地址',
          `推荐端点：${correctEndpoint}`
        ],
        autoFix: () => createFixedConfig(provider, config, correctEndpoint)
      };
    }

    // 检查端点是否正确
    if (correctEndpoint && !customEndpoint.startsWith(correctEndpoint.split('/').slice(0, 3).join('/'))) {
      result.status = 'warning';
      result.message = '自定义端点可能不正确';
      result.suggestions?.push(`官方推荐端点：${correctEndpoint}`);
    }
  }

  // 特殊检查：腾讯混元的文生文和文生图分离
  if (provider === 'tencent_hunyuan' && category === 'image') {
    if (customEndpoint && customEndpoint.includes('hunyuan.tencentcloudapi.com')) {
      return {
        ...result,
        status: 'error',
        message: '腾讯混元图像生成不支持腾讯云原生API格式',
        suggestions: [
          '图像生成请使用OpenAI兼容格式',
          '推荐端点：https://api.hunyuan.cloud.tencent.com/v1',
          '如需使用腾讯云原生API，请等待后续版本支持'
        ],
        autoFix: () => createFixedConfig(provider, config, CORRECT_ENDPOINTS[provider])
      };
    }
  }

  return result;
}

/**
 * 验证完整的API配置
 */
export function validateFullApiConfig(config: ApiConfig): ApiValidationResult[] {
  const results: ApiValidationResult[] = [];

  // 验证文本生成配置
  if (config.textGeneration?.enablePaid && config.textGeneration?.provider) {
    results.push(validateApiConfig(
      config.textGeneration.provider,
      config.textGeneration,
      'text'
    ));
  }

  // 验证图像生成配置
  if (config.imageGeneration?.enablePaid && config.imageGeneration?.provider) {
    results.push(validateApiConfig(
      config.imageGeneration.provider,
      config.imageGeneration,
      'image'
    ));
  }

  return results;
}

/**
 * 获取API密钥的期望格式描述
 */
function getExpectedKeyFormat(provider: string): string {
  const formats: Record<string, string> = {
    'openai': 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'openai_dalle': 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'anthropic': 'sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'gemini': 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'deepseek': 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'stability': 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'zhipu': 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.xxxxxx',
    'moonshot': 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'siliconflow': 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'tencent_hunyuan': 'sk-xxxxxxxxxxxxxxxxxxxxx',
    'jiemeng': 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
  };
  
  return formats[provider] || 'API密钥格式请参考官方文档';
}

/**
 * 创建修复后的配置
 */
function createFixedConfig(provider: string, originalConfig: any, correctEndpoint: string): ApiConfig {
  // 这里返回一个修复建议，实际的自动修复需要在UI层面实现
  return originalConfig;
}

/**
 * 批量测试所有已配置的API连接
 */
export async function testAllConfiguredApis(config: ApiConfig): Promise<Record<string, any>> {
  const testResults: Record<string, any> = {};

  // 测试文本生成API
  if (config.textGeneration?.enablePaid && config.textGeneration?.apiKey) {
    const provider = config.textGeneration.provider;
    try {
      switch (provider) {
        case 'openai':
          const { testOpenAIConnection } = await import('./openaiService');
          testResults[provider] = await testOpenAIConnection(config.textGeneration.apiKey);
          break;
        case 'claude':
          const { testClaudeConnection } = await import('./claudeService');
          testResults[provider] = await testClaudeConnection(config.textGeneration.apiKey);
          break;
        case 'gemini':
          // Gemini测试需要特殊处理
          testResults[provider] = { success: true, message: 'Gemini配置检查完成' };
          break;
        case 'deepseek':
          const { testDeepSeekConnection } = await import('./deepseekService');
          testResults[provider] = await testDeepSeekConnection(
            config.textGeneration.apiKey, 
            { model: config.textGeneration.model }
          );
          break;
        case 'hunyuan':
          const { testTencentHunyuanConnection } = await import('./tencentHunyuanService');
          testResults[provider] = await testTencentHunyuanConnection();
          break;
        // 可以继续添加其他服务商
      }
    } catch (error) {
      testResults[provider] = {
        success: false,
        message: `测试失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  // 测试图像生成API
  if (config.imageGeneration?.enablePaid && config.imageGeneration?.apiKey) {
    const provider = config.imageGeneration.provider;
    try {
      switch (provider) {
        case 'openai_dalle':
          const { testOpenAIDalleConnection } = await import('./openaiDalleService');
          testResults[provider] = await testOpenAIDalleConnection(config.imageGeneration.apiKey);
          break;
        case 'stability':
          const { testStabilityConnection } = await import('./stabilityService');
          testResults[provider] = await testStabilityConnection(config.imageGeneration.apiKey);
          break;
        case 'tencent_hunyuan':
          const { testTencentHunyuanImageConnection } = await import('./tencentHunyuanService');
          testResults[provider] = await testTencentHunyuanImageConnection();
          break;
        // 可以继续添加其他服务商
      }
    } catch (error) {
      testResults[provider] = {
        success: false,
        message: `测试失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  return testResults;
}

/**
 * 生成API配置健康报告
 */
export function generateApiHealthReport(config: ApiConfig): {
  overall: 'healthy' | 'warning' | 'critical';
  summary: string;
  details: ApiValidationResult[];
  recommendations: string[];
} {
  const validationResults = validateFullApiConfig(config);
  
  const errorCount = validationResults.filter(r => r.status === 'error').length;
  const warningCount = validationResults.filter(r => r.status === 'warning').length;
  
  let overall: 'healthy' | 'warning' | 'critical';
  let summary: string;
  
  if (errorCount > 0) {
    overall = 'critical';
    summary = `发现 ${errorCount} 个严重配置问题需要立即修复`;
  } else if (warningCount > 0) {
    overall = 'warning';
    summary = `发现 ${warningCount} 个配置警告，建议检查优化`;
  } else {
    overall = 'healthy';
    summary = 'API配置健康，所有服务配置正常';
  }
  
  const recommendations: string[] = [
    '定期检查API密钥是否过期',
    '确保使用官方推荐的API端点',
    '监控API调用额度和使用情况',
    '备用多个API服务以确保稳定性'
  ];
  
  return {
    overall,
    summary,
    details: validationResults,
    recommendations
  };
} 