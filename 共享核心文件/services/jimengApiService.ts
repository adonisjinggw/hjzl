/**
 * 即梦3.0 AI图像生成服务
 * 支持多种API提供商接入
 */

export interface JimengImageRequest {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  model?: string;
  sampleStrength?: number;
  style?: string;
}

export interface JimengImageResponse {
  data: Array<{
    url: string;
    base64?: string;
  }>;
  created: number;
  cost?: number;
  requestId?: string;
}

export interface JimengApiSettings {
  provider: 'dmxapi' | 'wavespeed' | 'b3nai' | 'direct';
  apiKey: string;
  baseUrl?: string;
}

/**
 * DMXAPI 即梦3.0服务
 * 推荐使用，性价比高，支持即梦3.0
 */
class DMXAPIService {
  private apiKey: string;
  private baseUrl = 'https://www.dmxapi.com';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateImage(request: JimengImageRequest): Promise<JimengImageResponse> {
    const payload = {
      prompt: request.prompt,
      negative_prompt: request.negativePrompt || '',
      model: request.model || 'seedream-3.0', // 即梦3.0模型
      size: `${request.width || 1024}x${request.height || 1024}`,
      sample_strength: request.sampleStrength || 0.5,
      n: 1
    };

    const response = await fetch(`${this.baseUrl}/v1/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'JimengAPI/1.0.0'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`DMXAPI请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      data: data.data || [],
      created: data.created || Date.now(),
      cost: data.cost,
      requestId: data.id
    };
  }
}

/**
 * WaveSpeed AI 即梦服务
 * 专业的AI图像生成平台
 */
class WaveSpeedService {
  private apiKey: string;
  private baseUrl = 'https://api.wavespeed.ai';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateImage(request: JimengImageRequest): Promise<JimengImageResponse> {
    // 提交任务
    const submitResponse = await fetch(`${this.baseUrl}/api/v3/wavespeed-ai/hidream-i1-full`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: request.prompt,
        size: `${request.width || 1024}*${request.height || 1024}`,
        seed: -1,
        enable_base64_output: false,
        enable_safety_checker: true
      })
    });

    if (!submitResponse.ok) {
      throw new Error(`WaveSpeed任务提交失败: ${submitResponse.status}`);
    }

    const submitData = await submitResponse.json();
    const taskId = submitData.data.id;

    // 轮询获取结果
    let attempts = 0;
    const maxAttempts = 30;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 等待2秒
      
      const resultResponse = await fetch(`${this.baseUrl}/api/v3/predictions/${taskId}/result`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (resultResponse.ok) {
        const resultData = await resultResponse.json();
        
        if (resultData.data.status === 'completed') {
          return {
            data: resultData.data.outputs.map((url: string) => ({ url })),
            created: Date.now(),
            requestId: taskId
          };
        } else if (resultData.data.status === 'failed') {
          throw new Error(`图像生成失败: ${resultData.data.error}`);
        }
      }
      
      attempts++;
    }
    
    throw new Error('图像生成超时');
  }
}

/**
 * B3N AI服务
 * 支持DALL-E-3和其他模型
 */
class B3NService {
  private apiKey: string;
  private baseUrl = 'https://api.b3n.fun';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateImage(request: JimengImageRequest): Promise<JimengImageResponse> {
    const payload = {
      model: request.model || 'dall-e-3',
      prompt: request.prompt,
      n: 1,
      size: `${request.width || 1024}x${request.height || 1024}`
    };

    const response = await fetch(`${this.baseUrl}/v1/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`B3N API请求失败: ${response.status}`);
    }

    const data = await response.json();
    return {
      data: data.data || [],
      created: data.created || Date.now()
    };
  }
}

/**
 * 即梦3.0 API管理器
 * 统一管理多个API提供商
 */
export class JimengApiManager {
  private settings: JimengApiSettings;
  private service: DMXAPIService | WaveSpeedService | B3NService;

  constructor(settings: JimengApiSettings) {
    this.settings = settings;
    
    switch (settings.provider) {
      case 'dmxapi':
        this.service = new DMXAPIService(settings.apiKey);
        break;
      case 'wavespeed':
        this.service = new WaveSpeedService(settings.apiKey);
        break;
      case 'b3nai':
        this.service = new B3NService(settings.apiKey);
        break;
      default:
        throw new Error(`不支持的API提供商: ${settings.provider}`);
    }
  }

  /**
   * 生成图像
   */
  async generateImage(request: JimengImageRequest): Promise<JimengImageResponse> {
    try {
      console.log(`[即梦API] 使用 ${this.settings.provider} 生成图片`, {
        prompt: request.prompt,
        size: `${request.width || 1024}x${request.height || 1024}`
      });

      const result = await this.service.generateImage(request);
      
      console.log(`[即梦API] 图片生成成功`, {
        provider: this.settings.provider,
        imageCount: result.data.length,
        requestId: result.requestId
      });

      return result;
    } catch (error) {
      console.error(`[即梦API] 图片生成失败:`, error);
      throw error;
    }
  }

  /**
   * 获取支持的模型列表
   */
  getSupportedModels(): string[] {
    switch (this.settings.provider) {
      case 'dmxapi':
        return ['seedream-3.0', 'dall-e-3', 'flux-schnell', 'flux-dev'];
      case 'wavespeed':
        return ['hidream-i1-full', 'hidream-i1-dev'];
      case 'b3nai':
        return ['dall-e-3'];
      default:
        return [];
    }
  }

  /**
   * 获取提供商信息
   */
  getProviderInfo() {
    const providerInfo: Record<string, any> = {
      'dmxapi': {
        name: 'DMXAPI',
        description: '专业的AI API聚合平台，支持即梦3.0等多种模型',
        website: 'https://www.dmxapi.com',
        features: ['即梦3.0', '高性价比', '快速响应'],
        pricing: '按次计费，约0.01-0.05元/次'
      },
      'wavespeed': {
        name: 'WaveSpeed AI',
        description: '高速AI图像生成平台，专注于高质量输出',
        website: 'https://wavespeed.ai',
        features: ['HiDream模型', '高质量输出', '加速推理'],
        pricing: '按次计费，具体价格请查看官网'
      },
      'b3nai': {
        name: 'B3N AI',
        description: '多模型AI服务平台',
        website: 'https://b3n.fun',
        features: ['DALL-E-3', '多种模型', 'OpenAI兼容'],
        pricing: '按次计费，具体价格请查看官网'
      },
      'direct': {
        name: '直接调用',
        description: '直接调用即梦官方API',
        website: 'https://jimeng.jianying.com',
        features: ['官方服务', '最新功能'],
        pricing: '官方定价'
      }
    };

    return providerInfo[this.settings.provider] || null;
  }
}

/**
 * 获取推荐的API提供商配置
 */
export const getRecommendedProviders = () => [
  {
    id: 'dmxapi',
    name: 'DMXAPI (推荐)',
    description: '支持即梦3.0，性价比最高',
    website: 'https://www.dmxapi.com',
    pros: ['支持即梦3.0', '价格便宜', '响应快速', '稳定可靠'],
    apiKeyHelp: '注册DMXAPI账号后在控制台获取API Key'
  },
  {
    id: 'wavespeed',
    name: 'WaveSpeed AI',
    description: '专业AI图像生成平台',
    website: 'https://wavespeed.ai',
    pros: ['图像质量高', '加速推理', 'HiDream模型'],
    apiKeyHelp: '注册WaveSpeed账号后获取API Key'
  },
  {
    id: 'b3nai',
    name: 'B3N AI',
    description: 'DALL-E-3等多模型支持',
    website: 'https://b3n.fun',
    pros: ['DALL-E-3', '多种模型', 'OpenAI兼容'],
    apiKeyHelp: '注册B3N账号后获取API Key'
  }
];

/**
 * 验证API密钥
 */
export const validateJimengApiKey = async (provider: string, apiKey: string): Promise<boolean> => {
  try {
    const manager = new JimengApiManager({
      provider: provider as any,
      apiKey
    });

    // 尝试生成一个简单的测试图片
    await manager.generateImage({
      prompt: '一只可爱的小猫',
      width: 512,
      height: 512
    });

    return true;
  } catch (error) {
    console.error('API密钥验证失败:', error);
    return false;
  }
}; 