/**
 * OpenAI GPT 服务
 * 支持 GPT-4、GPT-3.5-turbo 等模型
 */

import type { 
  GeneratedScenario, 
  GeneratedSocialMediaCopy, 
  GeneratedVideoScript, 
  GeneratedRealisticItinerary,
  CoreScene 
} from '../types';

/**
 * OpenAI API配置接口
 */
interface OpenAIConfig {
  apiKey: string;
  model?: string;
  baseUrl?: string;
}

/**
 * OpenAI API请求接口
 */
interface OpenAIRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

/**
 * OpenAI API响应接口
 */
interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * 从localStorage获取OpenAI API配置
 */
const getOpenAIConfig = (): OpenAIConfig | null => {
  try {
    const configJson = localStorage.getItem('travel-generator-api-config');
    if (configJson) {
      const config = JSON.parse(configJson);
      
      if (config.textGeneration?.provider === 'openai' && 
          config.textGeneration?.apiKey) {
        return {
          apiKey: config.textGeneration.apiKey,
          model: config.textGeneration?.model || 'gpt-4o',
          baseUrl: config.textGeneration?.customEndpoint || 'https://api.openai.com/v1'
        };
      }
    }
    return null;
  } catch (error) {
    console.error('获取OpenAI API配置失败:', error);
    return null;
  }
};

/**
 * 调用OpenAI API
 */
export const callOpenAIAPI = async (
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  model: string = 'gpt-3.5-turbo'
): Promise<string> => {
  const config = getOpenAIConfig();
  if (!config) {
    throw new Error('OpenAI API配置未找到，请先配置API密钥');
  }

  if (!config.apiKey) {
    throw new Error('OpenAI API密钥不能为空');
  }

  const requestBody: OpenAIRequest = {
    model: model,
    messages: messages,
    temperature: 0.7,
    max_tokens: 4000,
    stream: false
  };

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        'User-Agent': 'travel-generator/1.0'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API响应错误:', response.status, errorText);
      throw new Error(`OpenAI API调用失败 (${response.status}): ${errorText}`);
    }

    const result: OpenAIResponse = await response.json();
    
    if (!result.choices || result.choices.length === 0) {
      throw new Error('OpenAI API响应格式错误：没有返回选择结果');
    }

    const content = result.choices[0].message.content;
    if (!content) {
      throw new Error('OpenAI API响应内容为空');
    }

    return content.trim();
  } catch (error) {
    console.error('OpenAI API调用失败:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('OpenAI API调用过程中发生未知错误');
  }
};

/**
 * 使用OpenAI生成文本
 */
export async function generateTextWithOpenAI(
  prompt: string,
  apiKey: string,
  options: {
    baseURL?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string> {
  const requestBody = {
    model: options.model || 'gpt-3.5-turbo',
    messages: [
      {
        role: 'user' as const,
        content: prompt
      }
    ],
    temperature: options.temperature || 0.7,
    max_tokens: options.maxTokens || 4000
  };

  try {
    const response = await fetch(`${options.baseURL || 'https://api.openai.com/v1'}/chat/completions`, {
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
      throw new Error(`OpenAI API调用失败 (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    
    if (!result.choices || result.choices.length === 0) {
      throw new Error('OpenAI API响应格式错误');
    }

    return result.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI API调用失败:', error);
    throw error;
  }
}

/**
 * 测试OpenAI连接
 */
export async function testOpenAIConnection(
  apiKey?: string,
  options: {
    customEndpoint?: string;
    model?: string;
  } = {}
): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    const testApiKey = apiKey || getOpenAIConfig()?.apiKey;
    if (!testApiKey) {
      return {
        success: false,
        message: 'OpenAI API密钥未配置',
        details: '请先配置有效的OpenAI API密钥'
      };
    }

    const testPrompt = '请回复"连接测试成功"';
    const response = await generateTextWithOpenAI(testPrompt, testApiKey, {
      baseURL: options.customEndpoint,
      model: options.model || 'gpt-3.5-turbo'
    });

    return {
      success: true,
      message: 'OpenAI API连接成功',
      details: `模型响应: ${response.substring(0, 100)}...`
    };
  } catch (error: any) {
    console.error('OpenAI连接测试失败:', error);
    return {
      success: false,
      message: 'OpenAI API连接失败',
      details: error.message
    };
  }
}

/**
 * 生成旅行场景（虚拟模式）
 */
export async function generateTravelScenarioWithOpenAI(
  theme: string,
  duration: string,
  persona: string,
  customDestination?: string
): Promise<GeneratedScenario> {
  const messages = [
    {
      role: 'system' as const,
      content: `你是一位专业的幻想旅行策划师，擅长创造神奇而引人入胜的虚拟旅行体验。请根据用户的需求生成一个虚拟的旅行场景，包含富有想象力的目的地和体验。

请严格按照以下JSON格式返回，不要添加任何额外的文字说明：

{
  "destinationName": "虚拟目的地名称",
  "coreScenes": [
    {
      "name": "场景名称",
      "description": "详细的场景描述",
      "influencerAttribute": "适合的网红特质",
      "interactiveEgg": "互动彩蛋内容",
      "visualPromptHint": "视觉提示词"
    }
  ],
  "plotHook": "引人入胜的故事钩子",
  "fictionalCulture": "虚构文化背景描述",
  "worldviewHint": "世界观提示"
}`
    },
    {
      role: 'user' as const,
      content: `请为我生成一个${duration}的${theme}主题虚拟旅行场景。
旅行者画像：${persona}
${customDestination ? `希望包含元素：${customDestination}` : ''}

要求：
1. 创造一个完全虚构但引人入胜的目的地
2. 设计3-5个核心场景，每个场景都要有独特的体验
3. 融入幻想元素，但要保持一定的真实感
4. 考虑到旅行者的个性特点来设计体验
5. 所有内容必须是中文`
    }
  ];

  try {
    const config = getOpenAIConfig();
    const model = config?.model || 'gpt-3.5-turbo';
    
    const response = await callOpenAIAPI(messages, model);
    
    // 解析JSON响应
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('OpenAI返回格式不正确，无法解析JSON');
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);
    
    // 验证响应格式
    if (!parsedResponse.destinationName || !parsedResponse.coreScenes) {
      throw new Error('OpenAI返回数据结构不完整');
    }

    return {
      destinationName: parsedResponse.destinationName,
      coreScenes: parsedResponse.coreScenes,
      plotHook: parsedResponse.plotHook || '',
      fictionalCulture: parsedResponse.fictionalCulture || '',
      worldviewHint: parsedResponse.worldviewHint || ''
    };

  } catch (error) {
    console.error('OpenAI场景生成失败:', error);
    throw new Error(`OpenAI场景生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 检查是否有OpenAI API密钥
 */
export function hasOpenAIApiKey(): boolean {
  const config = getOpenAIConfig();
  return !!(config && config.apiKey);
} 