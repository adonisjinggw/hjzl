/**
 * SiliconFlow API Service
 * 硅基流动 SiliconFlow AI 服务集成
 * 官方文档: https://docs.siliconflow.cn/
 */

interface SiliconFlowConfig {
  apiKey: string;
  model?: string;
  baseURL?: string;
}

interface SiliconFlowMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface SiliconFlowChatRequest {
  model: string;
  messages: SiliconFlowMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
}

interface SiliconFlowChatResponse {
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
 * SiliconFlow API服务类
 */
export class SiliconFlowService {
  private config: SiliconFlowConfig;
  private baseURL: string;

  constructor(config: SiliconFlowConfig) {
    this.config = config;
    this.baseURL = config.baseURL || 'https://api.siliconflow.cn';
  }

  /**
   * 发送聊天请求
   */
  async chat(
    messages: SiliconFlowMessage[],
    options: Partial<SiliconFlowChatRequest> = {}
  ): Promise<string> {
    try {
      console.log('🚀 SiliconFlow API调用开始:', {
        model: this.config.model || 'Qwen/Qwen2.5-72B-Instruct',
        messagesCount: messages.length
      });

      const requestBody: SiliconFlowChatRequest = {
        model: this.config.model || 'Qwen/Qwen2.5-72B-Instruct',
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
        throw new Error(`SiliconFlow API请求失败: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data: SiliconFlowChatResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('SiliconFlow API返回数据格式错误');
      }

      const content = data.choices[0].message.content;
      console.log('✅ SiliconFlow API调用成功:', {
        tokensUsed: data.usage?.total_tokens || 0,
        responseLength: content.length
      });

      return content;

    } catch (error: any) {
      console.error('❌ SiliconFlow API调用失败:', error);
      throw new Error(`SiliconFlow API调用失败: ${error.message}`);
    }
  }

  /**
   * 生成旅行内容
   */
  async generateTravelContent(prompt: string): Promise<string> {
    const messages: SiliconFlowMessage[] = [
      {
        role: 'system',
        content: '你是一个专业的旅行内容创作专家，擅长生成富有创意和实用性的旅行攻略、景点推荐和文案内容。请用中文回复，内容要详细、准确且有趣。'
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
          content: '请回复"SiliconFlow API连接正常"'
        }
      ], {
        max_tokens: 50
      });

      return {
        success: true,
        message: 'SiliconFlow API连接成功',
        details: `响应: ${testMessage}`
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'SiliconFlow API连接失败',
        details: error.message
      };
    }
  }

  /**
   * 获取可用模型列表
   */
  getAvailableModels(): string[] {
    return [
      'Qwen/Qwen2.5-72B-Instruct',
      'Qwen/Qwen2.5-32B-Instruct', 
      'Qwen/Qwen2.5-14B-Instruct',
      'Qwen/Qwen2.5-7B-Instruct',
      'THUDM/glm-4-9b-chat',
      'Pro/THUDM/glm-4-9b-chat',
      'deepseek-ai/DeepSeek-V2.5',
      'meta-llama/Meta-Llama-3.1-70B-Instruct',
      'meta-llama/Meta-Llama-3.1-8B-Instruct',
      'mistralai/Mistral-7B-Instruct-v0.3'
    ];
  }
}

/**
 * 全局SiliconFlow服务实例
 */
let siliconFlowService: SiliconFlowService | null = null;

/**
 * 获取SiliconFlow服务实例
 */
export function getSiliconFlowService(): SiliconFlowService | null {
  return siliconFlowService;
}

/**
 * 初始化SiliconFlow服务
 */
export function initializeSiliconFlowService(config: SiliconFlowConfig): SiliconFlowService {
  siliconFlowService = new SiliconFlowService(config);
  return siliconFlowService;
}

/**
 * 使用SiliconFlow生成文本（统一接口）
 */
export async function generateTextWithSiliconFlow(
  prompt: string, 
  apiKey: string,
  options: {
    model?: string;
    baseURL?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string> {
  const service = initializeSiliconFlowService({
    apiKey,
    model: options.model || 'Qwen/Qwen2.5-72B-Instruct',
    baseURL: options.baseURL
  });

  return await service.generateTravelContent(prompt);
}

/**
 * 测试SiliconFlow API连接
 */
export async function testSiliconFlowConnection(
  apiKey: string,
  options: {
    model?: string;
    baseURL?: string;
  } = {}
): Promise<{ success: boolean; message: string; details?: string }> {
  try {
    const service = initializeSiliconFlowService({
      apiKey,
      model: options.model || 'Qwen/Qwen2.5-72B-Instruct',
      baseURL: options.baseURL
    });

    return await service.testConnection();
  } catch (error: any) {
    return {
      success: false,
      message: 'SiliconFlow服务初始化失败',
      details: error.message
    };
  }
} 