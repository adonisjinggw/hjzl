/**
 * DeepSeek API Service
 * 深度求索 DeepSeek AI 文本生成服务
 * 官方文档: https://platform.deepseek.com/docs
 */

interface DeepSeekConfig {
  apiKey: string;
  model?: string;
  baseURL?: string;
}

interface DeepSeekChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekChatRequest {
  model: string;
  messages: DeepSeekChatMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
}

interface DeepSeekChatResponse {
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
 * DeepSeek API服务类
 */
export class DeepSeekService {
  private config: DeepSeekConfig;
  private baseURL: string;

  constructor(config: DeepSeekConfig) {
    this.config = config;
    this.baseURL = config.baseURL || 'https://api.deepseek.com';
  }

  /**
   * 发送聊天请求
   */
  async chat(
    messages: DeepSeekChatMessage[],
    options: Partial<DeepSeekChatRequest> = {}
  ): Promise<string> {
    try {
      console.log('🤖 DeepSeek API调用开始:', {
        model: this.config.model || 'deepseek-chat',
        messagesCount: messages.length
      });

      const requestBody: DeepSeekChatRequest = {
        model: this.config.model || 'deepseek-chat',
        messages,
        temperature: options.temperature || 0.3,
        max_tokens: options.max_tokens || 2000,
        top_p: options.top_p || 0.95,
        ...options
      };

      const response = await fetch(`${this.baseURL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DeepSeek API请求失败: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data: DeepSeekChatResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('DeepSeek API返回数据格式错误');
      }

      const content = data.choices[0].message.content;
      console.log('✅ DeepSeek API调用成功:', {
        tokensUsed: data.usage?.total_tokens || 0,
        responseLength: content.length
      });

      return content;

    } catch (error: any) {
      console.error('❌ DeepSeek API调用失败:', error);
      throw new Error(`DeepSeek API调用失败: ${error.message}`);
    }
  }

  /**
   * 生成旅行内容
   */
  async generateTravelContent(prompt: string): Promise<string> {
    const messages: DeepSeekChatMessage[] = [
      {
        role: 'system',
        content: '你是一个专业的旅行内容创作助手，能够生成高质量的旅行攻略、景点介绍和文案内容。请用中文回复，内容要生动有趣且实用。'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    return await this.chat(messages, {
      temperature: 0.7,
      max_tokens: 3000
    });
  }

  /**
   * 测试API连接
   */
  async testConnection(): Promise<{ success: boolean; message: string; details?: string }> {
    try {
      const testMessage = await this.chat([
        {
          role: 'user',
          content: '请回复"DeepSeek API连接正常"'
        }
      ], {
        max_tokens: 50
      });

      return {
        success: true,
        message: 'DeepSeek API连接成功',
        details: `响应: ${testMessage}`
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'DeepSeek API连接失败',
        details: error.message
      };
    }
  }
}

/**
 * 全局DeepSeek服务实例
 */
let deepSeekService: DeepSeekService | null = null;

/**
 * 获取DeepSeek服务实例
 */
export function getDeepSeekService(): DeepSeekService | null {
  return deepSeekService;
}

/**
 * 初始化DeepSeek服务
 */
export function initializeDeepSeekService(config: DeepSeekConfig): DeepSeekService {
  deepSeekService = new DeepSeekService(config);
  return deepSeekService;
}

/**
 * 使用DeepSeek生成文本（统一接口）
 */
export async function generateTextWithDeepSeek(
  prompt: string, 
  apiKey: string,
  options: {
    model?: string;
    baseURL?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string> {
  const service = initializeDeepSeekService({
    apiKey,
    model: options.model || 'deepseek-chat',
    baseURL: options.baseURL
  });

  return await service.generateTravelContent(prompt);
}

/**
 * 测试DeepSeek API连接
 */
export async function testDeepSeekConnection(
  apiKey: string,
  options: {
    model?: string;
    baseURL?: string;
  } = {}
): Promise<{ success: boolean; message: string; details?: string }> {
  try {
    const service = initializeDeepSeekService({
      apiKey,
      model: options.model || 'deepseek-chat',
      baseURL: options.baseURL
    });

    return await service.testConnection();
  } catch (error: any) {
    return {
      success: false,
      message: 'DeepSeek服务初始化失败',
      details: error.message
    };
  }
} 