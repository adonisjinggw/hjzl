/**
 * 增强的文字生成服务
 * 支持多种AI服务商的统一接口
 */

import type { 
  ApiConfig, 
  TextApiProvider
} from '../types';

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
    'openai',
    'claude', 
    'deepseek', 
    'siliconflow',
    'hunyuan',
    'azure_openai',
    'wenxin',
    'tongyi',
    'doubao',
    'qwen',
    'yi',
    'moonshot',
    'zhipu',
    'minimax',
    'baichuan',
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
        const deepseekService = await import('./deepseekService');
        return await deepseekService.generateTextWithDeepSeek(prompt, apiKey, {
          baseURL: options.customEndpoint,
          model: options.model,
          temperature: options.temperature,
          maxTokens: options.maxTokens
        });
      }
      
      case 'siliconflow': {
        const siliconflowService = await import('./siliconflowService');
        return await siliconflowService.generateTextWithSiliconFlow(prompt, apiKey, {
          baseURL: options.customEndpoint,
          model: options.model,
          temperature: options.temperature,
          maxTokens: options.maxTokens
        });
      }
      
      case 'openai': {
        const openaiService = await import('./openaiService');
        return await openaiService.generateTextWithOpenAI(prompt, apiKey, {
          baseURL: options.customEndpoint,
          model: options.model,
          temperature: options.temperature,
          maxTokens: options.maxTokens
        });
      }
      
      case 'claude': {
        const claudeService = await import('./claudeService');
        return await claudeService.generateTextWithClaude(prompt, apiKey, {
          baseURL: options.customEndpoint,
          model: options.model,
          temperature: options.temperature,
          maxTokens: options.maxTokens
        });
      }
      
      case 'gemini': {
        // 使用现有的Gemini服务
        const { generateTravelScenario } = await import('./geminiService');
        const response = await generateTravelScenario('通用', '1天', '用户', prompt);
        return response.destinationName + '\n' + response.coreScenes.map(s => s.description).join('\n');
      }
      
      case 'hunyuan': {
        // 使用腾讯混元服务
        const { callTencentHunyuanAPI } = await import('./tencentHunyuanService');
        const messages = [{ role: 'user' as const, content: prompt }];
        return await callTencentHunyuanAPI(messages, options.model || 'hunyuan-turbo');
      }
      
      case 'builtin_free': {
        return `[内置模拟回复] 基于提示词"${prompt.substring(0, 50)}..."生成的内容。这是一个模拟回复，实际使用时会根据具体场景生成相应内容。`;
      }
      
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
        // 这些服务商使用通用的OpenAI兼容接口
        return await generateWithOpenAICompatible(provider, prompt, apiKey, options);
        
      default:
        throw new Error(`不支持的服务商: ${provider}`);
    }
  } catch (error) {
    console.error(`${getProviderDisplayName(provider)}文本生成失败:`, error);
    throw error;
  }
}

/**
 * 使用OpenAI兼容接口生成文本
 */
async function generateWithOpenAICompatible(
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
  // 获取默认端点和模型配置
  const providerConfig = getProviderConfig(provider);
  const baseURL = options.customEndpoint || providerConfig.defaultEndpoint;
  const model = options.model || providerConfig.defaultModel;

  const requestBody = {
    model: model,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: options.temperature || 0.7,
    max_tokens: options.maxTokens || 4000
  };

  try {
    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'travel-generator/1.0'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${getProviderDisplayName(provider)} API调用失败 (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    
    if (!result.choices || result.choices.length === 0) {
      throw new Error(`${getProviderDisplayName(provider)} API响应格式错误`);
    }

    return result.choices[0].message.content.trim();
  } catch (error) {
    console.error(`${getProviderDisplayName(provider)} API调用失败:`, error);
    throw error;
  }
}

/**
 * 获取服务商配置
 */
function getProviderConfig(provider: TextApiProvider): {
  defaultEndpoint: string;
  defaultModel: string;
} {
  const configs: Record<string, { defaultEndpoint: string; defaultModel: string }> = {
    azure_openai: {
      defaultEndpoint: 'https://your-resource.openai.azure.com',
      defaultModel: 'gpt-4o'
    },
    wenxin: {
      defaultEndpoint: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop',
      defaultModel: 'ernie-4.0-turbo'
    },
    tongyi: {
      defaultEndpoint: 'https://dashscope.aliyuncs.com/api/v1',
      defaultModel: 'qwen2.5-72b-instruct'
    },
    doubao: {
      defaultEndpoint: 'https://ark.cn-beijing.volces.com/api/v3',
      defaultModel: 'doubao-pro-32k'
    },
    qwen: {
      defaultEndpoint: 'https://dashscope.aliyuncs.com/api/v1',
      defaultModel: 'qwen2.5-72b-instruct'
    },
    yi: {
      defaultEndpoint: 'https://api.lingyiwanwu.com/v1',
      defaultModel: 'yi-large'
    },
    moonshot: {
      defaultEndpoint: 'https://api.moonshot.cn/v1',
      defaultModel: 'moonshot-v1-128k'
    },
    zhipu: {
      defaultEndpoint: 'https://open.bigmodel.cn/api/paas/v4',
      defaultModel: 'glm-4-plus'
    },
    minimax: {
      defaultEndpoint: 'https://api.minimax.chat/v1',
      defaultModel: 'abab6.5s-chat'
    },
    baichuan: {
      defaultEndpoint: 'https://api.baichuan-ai.com/v1',
      defaultModel: 'baichuan4'
    },
    openai: {
      defaultEndpoint: 'https://api.openai.com/v1',
      defaultModel: 'gpt-4o'
    },
    claude: {
      defaultEndpoint: 'https://api.anthropic.com',
      defaultModel: 'claude-3-5-sonnet-20241022'
    },
    deepseek: {
      defaultEndpoint: 'https://api.deepseek.com/v1',
      defaultModel: 'deepseek-chat'
    },
    siliconflow: {
      defaultEndpoint: 'https://api.siliconflow.cn/v1',
      defaultModel: 'Qwen/Qwen2.5-72B-Instruct'
    },
    gemini: {
      defaultEndpoint: 'https://generativelanguage.googleapis.com/v1beta',
      defaultModel: 'gemini-2.0-flash-exp'
    },
    hunyuan: {
      defaultEndpoint: 'https://api.hunyuan.cloud.tencent.com/v1',
      defaultModel: 'hunyuan-pro'
    }
  };

  return configs[provider] || {
    defaultEndpoint: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o'
  };
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
        const deepseekService = await import('./deepseekService');
        if (deepseekService) {
          return await deepseekService.testDeepSeekConnection(apiKey, options);
        }
        throw new Error('DeepSeek服务模块不可用');
      }
      
      case 'siliconflow': {
        const siliconflowService = await import('./siliconflowService');
        if (siliconflowService) {
          return await siliconflowService.testSiliconFlowConnection(apiKey, options);
        }
        throw new Error('SiliconFlow服务模块不可用');
      }
      
      case 'openai': {
        const openaiService = await import('./openaiService');
        return await openaiService.testOpenAIConnection(apiKey, options);
      }
      
      case 'claude': {
        const claudeService = await import('./claudeService');
        return await claudeService.testClaudeConnection(apiKey, options);
      }
      
      case 'gemini': {
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
      
      case 'azure_openai':
      case 'wenxin':
      case 'tongyi':
      case 'doubao':
      case 'qwen':
      case 'yi':
      case 'moonshot':
      case 'zhipu':
      case 'minimax':
      case 'baichuan': {
        // 使用通用测试方法
        try {
          const testResponse = await generateWithOpenAICompatible(
            provider, 
            '请回复"连接测试成功"', 
            apiKey, 
            options
          );
          return {
            success: true,
            message: `${getProviderDisplayName(provider)} API连接成功`,
            details: `响应: ${testResponse.substring(0, 50)}...`
          };
        } catch (error: any) {
          return {
            success: false,
            message: `${getProviderDisplayName(provider)} API连接失败`,
            details: error.message
          };
        }
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