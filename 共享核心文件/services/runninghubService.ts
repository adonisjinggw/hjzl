/**
 * RunningHub AI 图像生成服务
 * 基于ComfyUI工作流的专业AI图像生成平台
 * API文档: https://www.runninghub.cn/runninghub-api-doc/
 */

// RunningHub API配置接口
interface RunningHubConfig {
  apiKey: string;
  webappId: string;
  baseUrl?: string;
}

// 工作流节点信息
interface NodeInfo {
  nodeId: string;
  fieldName: string;
  fieldValue: string;
}

// API请求接口
interface RunningHubRequest {
  webappId: string;
  apiKey: string;
  nodeInfoList: NodeInfo[];
}

// API响应接口
interface RunningHubResponse {
  code: number;
  message: string;
  data: {
    taskId: string;
    status: string;
    outputs?: Array<{
      node_id: string;
      output_type: string;
      data: any[];
    }>;
  };
}

// 任务状态查询响应
interface TaskStatusResponse {
  code: number;
  message: string;
  data: {
    taskId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    outputs?: Array<{
      node_id: string;
      output_type: string;
      data: string[]; // 图片URL数组
    }>;
    error?: string;
  };
}

/**
 * RunningHub AI 服务类
 */
class RunningHubService {
  private config: RunningHubConfig | null = null;
  private readonly baseUrl = 'https://www.runninghub.cn';

  /**
   * 初始化配置
   */
  private initializeConfig(): boolean {
    try {
      // 从localStorage获取API配置
      const configJson = localStorage.getItem('travel-generator-api-config');
      if (configJson) {
        const apiConfig = JSON.parse(configJson);
        
        if (apiConfig.imageGeneration?.enablePaid && 
            apiConfig.imageGeneration?.provider === 'runninghub' && 
            apiConfig.imageGeneration?.apiKey) {
          
          // 支持多种格式:
          // 1. "apiKey:webappId" 
          // 2. 直接的API密钥（使用默认webappId）
          let apiKey = apiConfig.imageGeneration.apiKey;
          let webappId = '1912979214533099522'; // 默认使用用户提供的工作流ID
          
          if (apiKey.includes(':')) {
            const parts = apiKey.split(':');
            apiKey = parts[0].trim();
            webappId = parts[1].trim();
          }
          
          if (apiKey) {
            this.config = {
              apiKey: apiKey,
              webappId: webappId,
              baseUrl: this.baseUrl
            };
            
            console.log('✅ RunningHub配置初始化成功', {
              webappId: webappId,
              apiKeyLength: apiKey.length
            });
            return true;
          }
        }
      }

      // 兼容旧版配置格式
      const oldApiKey = localStorage.getItem('runninghub-api-key');
      const oldWebappId = localStorage.getItem('runninghub-webapp-id');
      
      if (oldApiKey && oldWebappId) {
        this.config = {
          apiKey: oldApiKey,
          webappId: oldWebappId,
          baseUrl: this.baseUrl
        };
        console.log('✅ RunningHub配置（兼容模式）初始化成功');
        return true;
      }

      console.warn('⚠️ RunningHub API配置未找到');
      return false;
    } catch (error) {
      console.error('❌ RunningHub配置初始化失败:', error);
      return false;
    }
  }

  /**
   * 构建工作流节点参数
   * 基于用户提供的工作流ID: 1912979214533099522
   */
  private buildNodeInfoList(prompt: string, options: any = {}): NodeInfo[] {
    const {
      negativePrompt = 'ah_qh',  // 根据用户示例设置
      width = 1024,
      height = 1024,
      steps = 20,
      scheduler = 'beta'
    } = options;

    return [
      {
        nodeId: "376", // 负面提示词节点
        fieldName: "text",
        fieldValue: negativePrompt
      },
      {
        nodeId: "398", // 主提示词节点
        fieldName: "text", 
        fieldValue: prompt
      },
      {
        nodeId: "7", // 采样器设置
        fieldName: "scheduler",
        fieldValue: scheduler
      },
      {
        nodeId: "7", // 采样步数
        fieldName: "steps",
        fieldValue: steps.toString()
      },
      {
        nodeId: "355", // 图片宽度
        fieldName: "width",
        fieldValue: width.toString()
      },
      {
        nodeId: "355", // 图片高度
        fieldName: "height",
        fieldValue: height.toString()
      }
    ];
  }

  /**
   * 提交图像生成任务
   */
  async submitTask(prompt: string, options: any = {}): Promise<string> {
    if (!this.initializeConfig() || !this.config) {
      throw new Error('RunningHub API配置无效');
    }

    const requestData: RunningHubRequest = {
      webappId: this.config.webappId,
      apiKey: this.config.apiKey,
      nodeInfoList: this.buildNodeInfoList(prompt, options)
    };

    console.log('📤 提交RunningHub任务:', {
      webappId: this.config.webappId,
      prompt: prompt.substring(0, 50) + '...',
      nodeCount: requestData.nodeInfoList.length
    });

    try {
      const response = await fetch(`${this.baseUrl}/task/openapi/ai-app/run`, {
        method: 'POST',
        headers: {
          'Host': 'www.runninghub.cn',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: RunningHubResponse = await response.json();
      
      if (result.code !== 200) {
        throw new Error(`任务提交失败: ${result.message}`);
      }

      console.log('✅ 任务提交成功:', result.data.taskId);
      return result.data.taskId;

    } catch (error: any) {
      console.error('❌ 任务提交失败:', error);
      throw new Error(`任务提交失败: ${error.message}`);
    }
  }

  /**
   * 查询任务状态和结果
   */
  async getTaskResult(taskId: string): Promise<TaskStatusResponse['data']> {
    if (!this.config) {
      throw new Error('RunningHub API配置无效');
    }

    try {
      const response = await fetch(`${this.baseUrl}/task/openapi/task/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          taskId: taskId,
          apiKey: this.config.apiKey
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: TaskStatusResponse = await response.json();
      
      if (result.code !== 200) {
        throw new Error(`查询失败: ${result.message}`);
      }

      return result.data;

    } catch (error: any) {
      console.error('❌ 任务状态查询失败:', error);
      throw new Error(`任务状态查询失败: ${error.message}`);
    }
  }

  /**
   * 轮询等待任务完成
   */
  async waitForTaskCompletion(taskId: string, maxAttempts: number = 30): Promise<string[]> {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const taskData = await this.getTaskResult(taskId);
        
        console.log(`🔄 任务状态检查 (${attempts + 1}/${maxAttempts}):`, taskData.status);
        
        if (taskData.status === 'completed') {
          if (taskData.outputs && taskData.outputs.length > 0) {
            const imageUrls: string[] = [];
            
            for (const output of taskData.outputs) {
              if (output.output_type === 'image' && output.data) {
                imageUrls.push(...output.data);
              }
            }
            
            if (imageUrls.length > 0) {
              console.log('✅ 任务完成，获得图片数量:', imageUrls.length);
              return imageUrls;
            }
          }
          throw new Error('任务完成但未找到图片输出');
        }
        
        if (taskData.status === 'failed') {
          throw new Error(`任务失败: ${taskData.error || '未知错误'}`);
        }
        
        // 等待2秒后重试
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
        
      } catch (error: any) {
        console.error(`❌ 第${attempts + 1}次状态检查失败:`, error);
        
        if (attempts >= maxAttempts - 1) {
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        attempts++;
      }
    }
    
    throw new Error('任务执行超时，请稍后查看任务状态');
  }

  /**
   * 将图片URL转换为Base64
   */
  async convertImageUrlToBase64(imageUrl: string): Promise<string> {
    try {
      console.log('🔄 开始转换图片为Base64:', imageUrl);
      
      const response = await fetch(imageUrl, {
        method: 'GET',
        headers: {
          'Accept': 'image/*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      console.log('📡 图片请求响应状态:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`图片下载失败: ${response.status} ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      console.log('📄 图片内容类型:', contentType);
      
      const blob = await response.blob();
      console.log('📦 图片Blob大小:', Math.round(blob.size / 1024), 'KB');
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          console.log('✅ 图片转换成功，Base64大小:', Math.round(result.length / 1024), 'KB');
          resolve(result);
        };
        reader.onerror = (error) => {
          console.error('❌ FileReader错误:', error);
          reject(new Error('FileReader转换失败'));
        };
        reader.readAsDataURL(blob);
      });
      
    } catch (error: any) {
      console.error('❌ 图片转换失败:', error);
      console.error('🔍 错误详情:', {
        message: error.message,
        stack: error.stack,
        url: imageUrl
      });
      throw new Error(`图片转换失败: ${error.message}`);
    }
  }

  /**
   * 文生图 - 主要接口
   */
  async textToImage(prompt: string, options: any = {}): Promise<string> {
    console.log('🎨 RunningHub文生图开始:', prompt.substring(0, 50) + '...');
    
    const startTime = Date.now();
    
    try {
      // 1. 提交任务
      const taskId = await this.submitTask(prompt, options);
      
      // 2. 等待任务完成
      const imageUrls = await this.waitForTaskCompletion(taskId);
      
      // 3. 转换第一张图片为Base64
      if (imageUrls.length > 0) {
        const imageBase64 = await this.convertImageUrlToBase64(imageUrls[0]);
        
        const duration = (Date.now() - startTime) / 1000;
        console.log(`✅ RunningHub图片生成成功! 耗时: ${duration.toFixed(1)}秒`);
        
        return imageBase64;
      }
      
      throw new Error('未获得有效的图片输出');
      
    } catch (error: any) {
      const duration = (Date.now() - startTime) / 1000;
      console.error(`❌ RunningHub图片生成失败 (耗时: ${duration.toFixed(1)}秒):`, error);
      throw error;
    }
  }

  /**
   * 生成模拟图片（测试用）
   */
  private generateMockImage(prompt: string): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3'];
    const bgColor = colors[Math.floor(Math.random() * colors.length)];
    
    const svg = `<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0.8" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad1)"/>
      <circle cx="512" cy="400" r="150" fill="#ffffff" opacity="0.3"/>
      <text x="50%" y="55%" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="white">
        ${prompt.slice(0, 40)}${prompt.length > 40 ? '...' : ''}
      </text>
      <text x="50%" y="60%" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="rgba(255,255,255,0.9)">
        RunningHub AI (模拟模式)
      </text>
      <text x="50%" y="65%" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="rgba(255,255,255,0.8)">
        ComfyUI工作流生成
      </text>
    </svg>`;
    
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  }

  /**
   * 测试API连接
   */
  async testConnection(): Promise<{
    success: boolean;
    message: string;
    responseTime?: number;
    details?: any;
  }> {
    const startTime = Date.now();
    
    try {
      if (!this.initializeConfig() || !this.config) {
        return {
          success: false,
          message: 'API配置无效，请检查API密钥和工作流ID配置'
        };
      }

      // 使用简单的测试提示词
      const testPrompt = "simple test image, minimal style";
      const taskId = await this.submitTask(testPrompt, {
        width: 512,
        height: 512,
        steps: 10
      });

      const responseTime = Date.now() - startTime;
      
      return {
        success: true,
        message: '连接成功，任务已提交',
        responseTime,
        details: { taskId }
      };

    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      return {
        success: false,
        message: `连接失败: ${error.message}`,
        responseTime,
        details: { error: error.message }
      };
    }
  }
}

// 创建服务实例
const runningHubService = new RunningHubService();

/**
 * 检查是否有RunningHub API配置
 */
export function hasRunningHubApiKey(): boolean {
  try {
    const configJson = localStorage.getItem('travel-generator-api-config');
    if (configJson) {
      const config = JSON.parse(configJson);
      if (config.imageGeneration?.enablePaid && 
          config.imageGeneration?.provider === 'runninghub' && 
          config.imageGeneration?.apiKey) {
        // 支持两种格式：单独的API密钥 或 "密钥:工作流ID"
        const apiKey = config.imageGeneration.apiKey.trim();
        return apiKey.length > 0;
      }
    }

    // 检查旧版配置
    const oldApiKey = localStorage.getItem('runninghub-api-key');
    const oldWebappId = localStorage.getItem('runninghub-webapp-id');
    return !!(oldApiKey && oldWebappId);
  } catch {
    return false;
  }
}

/**
 * 生成RunningHub图片 - 主要导出接口
 */
export async function generateRunningHubPhoto(
  prompt: string,
  filterStyle: string = '自然色彩',
  isRealistic: boolean = false,
  uploadedImageBase64?: string,
  uploadedImageMimeType?: string
): Promise<string> {
  console.log('🚀 开始RunningHub AI图片生成...');
  
  // 构建增强提示词
  let enhancedPrompt = prompt;
  
  if (filterStyle && filterStyle !== "无滤镜 (真实色彩)") {
    enhancedPrompt += `, ${filterStyle}风格`;
  }
  
  if (isRealistic) {
    enhancedPrompt += ", photorealistic, high quality photography, detailed";
  } else {
    enhancedPrompt += ", artistic style, creative composition";
  }

  // 添加无文字限制
  enhancedPrompt += ", no text, no words, no letters, no captions, pure visual content";

  const options = {
    width: 1024,
    height: 1024,
    steps: 20,
    scheduler: 'beta'
  };

  if (!hasRunningHubApiKey()) {
    console.warn('⚠️ RunningHub API未配置，使用模拟模式');
    await new Promise(resolve => setTimeout(resolve, 3000));
    return runningHubService['generateMockImage'](enhancedPrompt);
  }

  // 直接调用API，不自动切换到模拟模式
  console.log('📝 使用提示词:', enhancedPrompt);
  console.log('⚙️ 生成参数:', options);
  
  return await runningHubService.textToImage(enhancedPrompt, options);
}

/**
 * 测试RunningHub API连接
 */
export async function testRunningHubApiConnection(): Promise<{
  success: boolean;
  message: string;
  responseTime?: number;
  details?: any;
}> {
  return await runningHubService.testConnection();
}

export default runningHubService; 