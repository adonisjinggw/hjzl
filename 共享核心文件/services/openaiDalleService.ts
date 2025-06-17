/**
 * OpenAI DALL-E 图像生成服务
 * 支持 DALL-E 2 和 DALL-E 3 模型
 */

/**
 * OpenAI DALL-E API配置接口
 */
interface OpenAIDalleConfig {
  apiKey: string;
  model?: string;
  baseUrl?: string;
}

/**
 * 从localStorage获取OpenAI DALL-E配置
 */
const getOpenAIDalleConfig = (): OpenAIDalleConfig | null => {
  try {
    const configJson = localStorage.getItem('travel-generator-api-config');
    if (configJson) {
      const config = JSON.parse(configJson);
      
      if (config.imageGeneration?.provider === 'openai_dalle' && 
          config.imageGeneration?.apiKey) {
        return {
          apiKey: config.imageGeneration.apiKey,
          model: config.imageGeneration?.model || 'dall-e-3',
          baseUrl: config.imageGeneration?.customEndpoint || 'https://api.openai.com/v1'
        };
      }
    }
    return null;
  } catch (error) {
    console.error('获取OpenAI DALL-E API配置失败:', error);
    return null;
  }
};

/**
 * OpenAI DALL-E图像生成请求接口
 */
interface DalleImageRequest {
  model: string;
  prompt: string;
  n?: number;
  quality?: 'standard' | 'hd';
  response_format?: 'url' | 'b64_json';
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
  style?: 'vivid' | 'natural';
  user?: string;
}

/**
 * OpenAI DALL-E API响应接口
 */
interface DalleImageResponse {
  created: number;
  data: Array<{
    revised_prompt?: string;
    url?: string;
    b64_json?: string;
  }>;
}

/**
 * 使用OpenAI DALL-E生成图片
 */
export async function generateImageWithDallE(
  prompt: string,
  apiKey: string,
  options: {
    baseURL?: string;
    model?: string;
    size?: string;
    quality?: 'standard' | 'hd';
    style?: 'vivid' | 'natural';
    n?: number;
  } = {}
): Promise<string> {
  const requestBody: DalleImageRequest = {
    model: options.model || 'dall-e-3',
    prompt: prompt,
    n: options.n || 1,
    quality: options.quality || 'standard',
    response_format: 'b64_json',
    size: (options.size as any) || '1024x1024',
    style: options.style || 'vivid'
  };

  try {
    const response = await fetch(`${options.baseURL || 'https://api.openai.com/v1'}/images/generations`, {
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
      let errorMessage = `OpenAI DALL-E API调用失败 (${response.status})`;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error && errorData.error.message) {
          errorMessage += `: ${errorData.error.message}`;
        }
      } catch {
        errorMessage += `: ${errorText}`;
      }
      
      throw new Error(errorMessage);
    }

    const result: DalleImageResponse = await response.json();
    
    if (!result.data || result.data.length === 0) {
      throw new Error('OpenAI DALL-E API响应格式错误：没有生成的图像');
    }

    const imageData = result.data[0];
    if (!imageData.b64_json) {
      throw new Error('OpenAI DALL-E API响应格式错误：缺少图像数据');
    }

    // 返回base64格式的图像数据
    return `data:image/png;base64,${imageData.b64_json}`;
  } catch (error) {
    console.error('OpenAI DALL-E API调用失败:', error);
    throw error;
  }
}

/**
 * 测试OpenAI DALL-E连接
 */
export async function testOpenAIDalleConnection(
  apiKey?: string,
  options: {
    customEndpoint?: string;
  } = {}
): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    const testApiKey = apiKey || getOpenAIDalleConfig()?.apiKey;
    if (!testApiKey) {
      return {
        success: false,
        message: 'OpenAI DALL-E API密钥未配置',
        details: '请先配置有效的OpenAI API密钥'
      };
    }

    // 测试API连接（获取模型列表而不是生成图像）
    const response = await fetch(`${options.customEndpoint || 'https://api.openai.com/v1'}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${testApiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'travel-generator/1.0'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `OpenAI API连接失败 (${response.status})`;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error && errorData.error.message) {
          errorMessage = errorData.error.message;
        }
      } catch {
        // 如果无法解析错误信息，使用默认消息
      }
      
      if (response.status === 401) {
        errorMessage = 'API密钥无效或已过期';
      } else if (response.status === 429) {
        errorMessage = 'API请求频率过高，请稍后重试';
      }
      
      return {
        success: false,
        message: errorMessage,
        details: errorText
      };
    }

    const result = await response.json();
    
    // 检查是否有DALL-E模型可用
    const dalleModels = result.data?.filter((model: any) => 
      model.id && model.id.includes('dall-e')
    ) || [];

    return {
      success: true,
      message: 'OpenAI DALL-E API连接成功',
      details: {
        availableModels: dalleModels.length,
        models: dalleModels.map((m: any) => m.id).slice(0, 3)
      }
    };
  } catch (error: any) {
    let errorMessage = 'OpenAI DALL-E API连接失败';
    
    if (error.message.includes('Failed to fetch')) {
      errorMessage = '网络连接失败，请检查网络设置或VPN配置';
    } else if (error.message.includes('CORS')) {
      errorMessage = '跨域请求被阻止，请检查API端点配置';
    }
    
    return {
      success: false,
      message: errorMessage,
      details: error.message
    };
  }
}

/**
 * 检查是否有OpenAI DALL-E API密钥
 */
export function hasOpenAIDalleApiKey(): boolean {
  return !!getOpenAIDalleConfig()?.apiKey;
}

/**
 * 获取支持的模型列表
 */
export function getSupportedModels(): Array<{ name: string; value: string; description?: string }> {
  return [
    { name: 'DALL-E 3', value: 'dall-e-3', description: '最新DALL-E模型，高质量图像' },
    { name: 'DALL-E 2', value: 'dall-e-2', description: '经典DALL-E模型' }
  ];
}

/**
 * 获取支持的图像尺寸
 */
export function getSupportedSizes(model: string = 'dall-e-3'): string[] {
  if (model === 'dall-e-3') {
    return ['1024x1024', '1792x1024', '1024x1792'];
  } else {
    return ['256x256', '512x512', '1024x1024'];
  }
}

/**
 * 获取支持的质量选项
 */
export function getSupportedQualities(): Array<{ name: string; value: string }> {
  return [
    { name: '标准质量', value: 'standard' },
    { name: '高清质量', value: 'hd' }
  ];
}

/**
 * 获取支持的风格选项
 */
export function getSupportedStyles(): Array<{ name: string; value: string }> {
  return [
    { name: '生动风格', value: 'vivid' },
    { name: '自然风格', value: 'natural' }
  ];
} 