/**
 * 增强的文字生成服务
 * 支持多种AI服务商的统一接口
 */

import type { 
  ApiConfig, 
  TextApiProvider
} from '../types';

// 动态导入服务
const importDeepSeekService = async () => {
  try {
    return await import('./deepseekService');
  } catch (error) {
    console.warn('DeepSeek服务不可用:', error);
    return null;
  }
};

const importSiliconFlowService = async () => {
  try {
    return await import('./siliconflowService');
  } catch (error) {
    console.warn('SiliconFlow服务不可用:', error);
    return null;
  }
};

/**
 * 获取服务商显示名称
 */
export function getProviderDisplayName(provider: TextApiProvider): string {
  const names: Record<TextApiProvider, string> = {
    gemini: 'Google Gemini',
    openai: 'OpenAI GPT',
    claude: 'Anthropic Claude',
    deepseek: 'DeepSeek API',
    siliconflow: 'SiliconFlow',
    azure_openai: 'Azure OpenAI',
    wenxin: '百度文心一言',
    tongyi: '阿里通义千问',
    hunyuan: '腾讯混元',
    doubao: '字节豆包',
    qwen: '阿里千问',
    yi: '零一万物',
    moonshot: '月之暗面 Kimi',
    zhipu: '智谱 GLM',
    minimax: 'MiniMax',
    baichuan: '百川智能',
    builtin_free: '内置免费服务'
  };
  return names[provider] || provider;
}

/**
 * 检查服务商是否可用
 */
export function isProviderAvailable(provider: TextApiProvider): boolean {
  const availableProviders: TextApiProvider[] = [
    'gemini',
    'deepseek', 
    'siliconflow',
    'hunyuan',
    'builtin_free'
  ];
  return availableProviders.includes(provider);
}

/**
 * 使用指定的文本生成服务
 */
export async function generateTextWithProvider(
  provider: TextApiProvider, 
  prompt: string, 
  apiKey: string,
  options: {
    customEndpoint?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string> {
  console.log(`🔄 使用${getProviderDisplayName(provider)}生成文本...`);
  
  try {
    switch (provider) {
      case 'deepseek': {
        const deepseekService = await importDeepSeekService();
        if (deepseekService) {
          return await deepseekService.generateTextWithDeepSeek(prompt, apiKey, {
            baseURL: options.customEndpoint,
            model: options.model,
            temperature: options.temperature,
            maxTokens: options.maxTokens
          });
        }
        throw new Error('DeepSeek服务不可用');
      }
      
      case 'siliconflow': {
        const siliconflowService = await importSiliconFlowService();
        if (siliconflowService) {
          return await siliconflowService.generateTextWithSiliconFlow(prompt, apiKey, {
            baseURL: options.customEndpoint,
            model: options.model,
            temperature: options.temperature,
            maxTokens: options.maxTokens
          });
        }
        throw new Error('SiliconFlow服务不可用');
      }
      
      case 'gemini': {
        // 使用现有的Gemini服务
        const { generateTravelScenario } = await import('./geminiService');
        // 创建一个简单的包装函数来匹配接口
        const response = await generateTravelScenario('通用', '1天', '用户', prompt);
        return response.destinationName + '\n' + response.coreScenes.map(s => s.description).join('\n');
      }
      
      case 'hunyuan': {
        // 使用腾讯混元服务
        const { callTencentHunyuanAPI } = await import('./tencentHunyuanService');
        const messages = [{
          role: 'user' as const,
          content: prompt
        }];
        
        return await callTencentHunyuanAPI(messages, options.model || 'hunyuan-turbo');
      }
      
      case 'builtin_free': {
        // 使用内置免费服务
        return `[内置模拟回复] 基于提示词"${prompt.substring(0, 50)}..."生成的内容。这是一个模拟回复，实际使用时会根据具体场景生成相应内容。`;
      }
      
      case 'openai':
      case 'claude':
      case 'azure_openai':
      case 'wenxin':
      case 'tongyi':
      case 'doubao':
      case 'qwen':
      case 'yi':
      case 'moonshot':
      case 'zhipu':
      case 'minimax':
      case 'baichuan':
        throw new Error(`${getProviderDisplayName(provider)}服务暂未实现，请选择其他服务商或联系开发者`);
        
      default:
        throw new Error(`不支持的服务商: ${provider}`);
    }
  } catch (error) {
    console.error(`${getProviderDisplayName(provider)}文本生成失败:`, error);
    throw error;
  }
}

/**
 * 测试指定服务商的连接
 */
export async function testProviderConnection(
  provider: TextApiProvider,
  apiKey: string,
  options: {
    customEndpoint?: string;
    model?: string;
  } = {}
): Promise<{ success: boolean; message: string; details?: string }> {
  try {
    if (!isProviderAvailable(provider)) {
      return {
        success: false,
        message: `${getProviderDisplayName(provider)}服务暂未实现`,
        details: '该服务商正在开发中，请选择其他可用的服务商'
      };
    }

    switch (provider) {
      case 'deepseek': {
        const deepseekService = await importDeepSeekService();
        if (deepseekService) {
          return await deepseekService.testDeepSeekConnection(apiKey, options);
        }
        throw new Error('DeepSeek服务模块不可用');
      }
      
      case 'siliconflow': {
        const siliconflowService = await importSiliconFlowService();
        if (siliconflowService) {
          return await siliconflowService.testSiliconFlowConnection(apiKey, options);
        }
        throw new Error('SiliconFlow服务模块不可用');
      }
      
      case 'gemini': {
        // 使用现有的Gemini测试
        const testResponse = await generateTextWithProvider(provider, '请回复"连接正常"', apiKey);
        return {
          success: true,
          message: 'Gemini API连接成功',
          details: `响应: ${testResponse.substring(0, 50)}...`
        };
      }
      
      case 'hunyuan': {
        // 使用腾讯混元连接测试
        const { testTencentHunyuanConnection } = await import('./tencentHunyuanService');
        return await testTencentHunyuanConnection();
      }
      
      case 'builtin_free': {
        return {
          success: true,
          message: '内置免费服务可用',
          details: '无需API密钥，直接使用模拟内容'
        };
      }
      
      default:
        return {
          success: false,
          message: `${getProviderDisplayName(provider)}服务连接测试暂未实现`,
          details: '请直接使用该服务或联系开发者'
        };
    }
  } catch (error: any) {
    return {
      success: false,
      message: `${getProviderDisplayName(provider)}连接测试失败`,
      details: error.message
    };
  }
} 