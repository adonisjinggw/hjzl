/**
 * Anthropic Claude 服务
 * 支持 Claude-3.5-sonnet、Claude-3-haiku 等模型
 */

import type { 
  GeneratedScenario, 
  CoreScene 
} from '../types';

/**
 * Claude API配置接口
 */
interface ClaudeConfig {
  apiKey: string;
  model?: string;
  baseUrl?: string;
}

/**
 * 从localStorage获取Claude API配置
 */
const getClaudeConfig = (): ClaudeConfig | null => {
  try {
    const configJson = localStorage.getItem('travel-generator-api-config');
    if (configJson) {
      const config = JSON.parse(configJson);
      
      if (config.textGeneration?.provider === 'claude' && 
          config.textGeneration?.apiKey) {
        return {
          apiKey: config.textGeneration.apiKey,
          model: config.textGeneration?.model || 'claude-3-5-sonnet-20241022',
          baseUrl: config.textGeneration?.customEndpoint || 'https://api.anthropic.com'
        };
      }
    }
    return null;
  } catch (error) {
    console.error('获取Claude API配置失败:', error);
    return null;
  }
};

/**
 * 使用Claude生成文本
 */
export async function generateTextWithClaude(
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
    model: options.model || 'claude-3-5-sonnet-20241022',
    max_tokens: options.maxTokens || 4000,
    temperature: options.temperature || 0.7,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  };

  try {
    const response = await fetch(`${options.baseURL || 'https://api.anthropic.com'}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'User-Agent': 'travel-generator/1.0'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API调用失败 (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    
    if (!result.content || result.content.length === 0) {
      throw new Error('Claude API响应格式错误');
    }

    return result.content[0].text.trim();
  } catch (error) {
    console.error('Claude API调用失败:', error);
    throw error;
  }
}

/**
 * 测试Claude连接
 */
export async function testClaudeConnection(
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
    const testApiKey = apiKey || getClaudeConfig()?.apiKey;
    if (!testApiKey) {
      return {
        success: false,
        message: 'Claude API密钥未配置',
        details: '请先配置有效的Claude API密钥'
      };
    }

    const testPrompt = '请回复"连接测试成功"';
    const response = await generateTextWithClaude(testPrompt, testApiKey, {
      baseURL: options.customEndpoint,
      model: options.model || 'claude-3-5-sonnet-20241022'
    });

    return {
      success: true,
      message: 'Claude API连接成功',
      details: `模型响应: ${response.substring(0, 100)}...`
    };
  } catch (error: any) {
    console.error('Claude连接测试失败:', error);
    return {
      success: false,
      message: 'Claude API连接失败',
      details: error.message
    };
  }
}

/**
 * 检查是否有Claude API密钥
 */
export function hasClaudeApiKey(): boolean {
  const config = getClaudeConfig();
  return !!(config && config.apiKey);
} 