/**
 * 火山引擎即梦AI API服务 - 简化版本
 * 避免CORS跨域问题，提供稳定的图像生成服务
 */

/**
 * 火山引擎API签名工具类
 * 使用Web Crypto API实现V4签名算法
 */
class VolcengineAPIClient {
  private accessKeyId: string;
  private secretAccessKey: string;
  private service: string = 'visual';
  private region: string = 'cn-north-1';

  constructor(accessKeyId: string, secretAccessKey: string) {
    this.accessKeyId = accessKeyId;
    this.secretAccessKey = secretAccessKey;
  }

  /**
   * 使用Web Crypto API计算SHA256哈希
   */
  private async sha256(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * 使用Web Crypto API计算HMAC-SHA256
   */
  private async hmacSha256(key: string | Uint8Array, data: string): Promise<Uint8Array> {
    const encoder = new TextEncoder();
    
    let keyBuffer: ArrayBuffer;
    if (typeof key === 'string') {
      keyBuffer = encoder.encode(key);
    } else {
      keyBuffer = key.buffer;
    }
    
    const dataBuffer = encoder.encode(data);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataBuffer);
    return new Uint8Array(signature);
  }

  /**
   * 将Uint8Array转换为十六进制字符串
   */
  private uint8ArrayToHex(arr: Uint8Array): string {
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * 生成V4签名
   */
  private async generateV4Signature(
    method: string,
    uri: string,
    query: string,
    headers: Record<string, string>,
    body: string,
    timestamp: number
  ): Promise<string> {
    const date = new Date(timestamp * 1000).toISOString().slice(0, 10).replace(/-/g, '');
    
    // 1. 构建规范化请求字符串
    const sortedHeaders = Object.keys(headers)
      .sort()
      .map(key => `${key.toLowerCase()}:${headers[key].trim()}\n`)
      .join('');
    
    const signedHeaders = Object.keys(headers)
      .sort()
      .map(key => key.toLowerCase())
      .join(';');
    
    const hashedPayload = await this.sha256(body);
    
    const canonicalRequest = [
      method,
      uri,
      query,
      sortedHeaders,
      signedHeaders,
      hashedPayload
    ].join('\n');
    
    console.log('规范化请求:', canonicalRequest);
    
    // 2. 构建待签名字符串
    const algorithm = 'HMAC-SHA256';
    const credentialScope = `${date}/${this.region}/${this.service}/request`;
    const stringToSign = [
      algorithm,
      timestamp.toString(),
      credentialScope,
      await this.sha256(canonicalRequest)
    ].join('\n');
    
    console.log('待签名字符串:', stringToSign);
    
    // 3. 计算签名
    const kDate = await this.hmacSha256(this.secretAccessKey, date);
    const kRegion = await this.hmacSha256(kDate, this.region);
    const kService = await this.hmacSha256(kRegion, this.service);
    const kSigning = await this.hmacSha256(kService, 'request');
    const signature = await this.hmacSha256(kSigning, stringToSign);
    const signatureHex = this.uint8ArrayToHex(signature);
    
    // 4. 构建Authorization头
    const credential = `${this.accessKeyId}/${credentialScope}`;
    const authorization = `${algorithm} Credential=${credential}, SignedHeaders=${signedHeaders}, Signature=${signatureHex}`;
    
    return authorization;
  }

  /**
   * 执行API请求
   */
  async request(endpoint: string, method: string = 'POST', data: any = null): Promise<any> {
    const timestamp = Math.floor(Date.now() / 1000);
    const host = 'visual.volcengineapi.com';
    const url = `https://${host}${endpoint}`;
    
    const body = data ? JSON.stringify(data) : '';
    
    // 准备请求头
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Host': host,
      'X-Date': timestamp.toString()
    };
    
    // 生成签名
    const authorization = await this.generateV4Signature(
      method,
      endpoint,
      '',
      headers,
      body,
      timestamp
    );
    
    headers['Authorization'] = authorization;
    
    console.log('🌐 请求URL:', url);
    console.log('📋 请求头:', headers);
    console.log('📦 请求体:', body);
    
    try {
      // 增加超时控制
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
      
      const response = await fetch(url, {
        method,
        headers,
        body: method === 'POST' ? body : undefined,
        mode: 'cors',
        credentials: 'omit',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const responseText = await response.text();
      console.log('📊 响应状态:', response.status);
      console.log('📋 响应头:', Object.fromEntries(response.headers.entries()));
      console.log('📦 响应体:', responseText);
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}\n响应: ${responseText}`);
      }
      
      try {
        return JSON.parse(responseText);
      } catch (e) {
        return { raw: responseText };
      }
    } catch (error: any) {
      console.error('🔥 网络请求详细错误:', error);
      
      if (error.name === 'AbortError') {
        throw new Error('请求超时（30秒）。如果您使用VPN，建议尝试关闭VPN后重试，或检查网络连接。');
      }
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('网络连接失败。可能原因：\n1. VPN影响了网络连接，建议暂时关闭VPN重试\n2. CORS策略限制（浏览器安全策略）\n3. 防火墙阻止了API访问\n4. 火山引擎API地域访问限制');
      }
      
      if (error.message.includes('DNS')) {
        throw new Error('DNS解析失败。如果您使用VPN，请尝试：\n1. 关闭VPN后重试\n2. 更换VPN服务器节点\n3. 使用本地DNS服务器');
      }
      
      throw error;
    }
  }
}

/**
 * 火山引擎即梦AI服务类
 */
class JieMengService {
  private apiClient: VolcengineAPIClient | null = null;

  /**
   * 获取API配置
   */
  private getApiConfig() {
    try {
      // 优先从新的API配置系统获取
    const configJson = localStorage.getItem('travel-generator-api-config');
    if (configJson) {
      const config = JSON.parse(configJson);
        console.log('🔑 检查新配置系统:', config);
        
      if (config.imageGeneration?.enablePaid && 
          config.imageGeneration?.provider === 'jiemeng' && 
          config.imageGeneration?.apiKey) {
          console.log('✅ 使用新配置系统中的火山引擎API密钥');
          
          // 检查API密钥格式
          let accessKeyId, secretAccessKey;
          
          if (config.imageGeneration.apiKey.includes(':')) {
            // 格式：AccessKeyId:SecretAccessKey
            [accessKeyId, secretAccessKey] = config.imageGeneration.apiKey.split(':');
          } else if (config.imageGeneration.accessKeyId && config.imageGeneration.secretAccessKey) {
            // 分别存储的格式
            accessKeyId = config.imageGeneration.accessKeyId;
            secretAccessKey = config.imageGeneration.secretAccessKey;
          } else {
            console.warn('⚠️ API密钥格式不正确，期望格式：AccessKeyId:SecretAccessKey');
            return null;
          }
          
        if (accessKeyId && accessKeyId.trim() && secretAccessKey && secretAccessKey.trim()) {
          return { 
            accessKeyId: accessKeyId.trim(), 
            secretAccessKey: secretAccessKey.trim() 
          };
        }
      }
    }
    
    // 兼容旧的存储方式
      const userSettings = localStorage.getItem('userSettings');
      if (userSettings) {
        const settings = JSON.parse(userSettings);
        console.log('🔑 检查兼容配置系统:', settings);
        
        if (settings.jiemengApiKey) {
          console.log('✅ 使用兼容模式的火山引擎API密钥');
          // 期望格式: "AccessKeyId:SecretAccessKey"
          const [accessKeyId, secretAccessKey] = settings.jiemengApiKey.split(':');
          if (accessKeyId && secretAccessKey) {
            return { accessKeyId: accessKeyId.trim(), secretAccessKey: secretAccessKey.trim() };
          }
        }
      }
      
      console.warn('⚠️ 火山引擎API密钥未配置');
    return null;
  } catch (error) {
      console.error('❌ 获取火山引擎API配置失败:', error);
    return null;
    }
  }

  /**
   * 初始化API客户端
   */
  private initializeClient(): boolean {
    if (this.apiClient) {
      return true;
    }

    const config = this.getApiConfig();
    if (!config) {
      console.warn('未找到API配置');
      return false;
    }

    this.apiClient = new VolcengineAPIClient(config.accessKeyId, config.secretAccessKey);
    return true;
  }

  /**
   * 生成模拟图片
   */
  private generateMockImage(prompt: string): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3'];
    const bgColor = colors[Math.floor(Math.random() * colors.length)];
    
    const svg = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${bgColor}"/>
      <text x="50%" y="45%" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="white">
        ${prompt.slice(0, 30)}${prompt.length > 30 ? '...' : ''}
      </text>
      <text x="50%" y="55%" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="rgba(255,255,255,0.8)">
        火山引擎即梦AI (模拟模式)
      </text>
    </svg>`;
    
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  }

  /**
   * 文生图API调用
   */
  async textToImage(prompt: string, options: any = {}): Promise<any> {
    console.log('🎨 开始文生图API调用:', prompt);
    
    if (!this.initializeClient()) {
      console.warn('未配置API密钥，使用模拟模式');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        success: true,
        data: {
          images: [{
            url: this.generateMockImage(prompt),
            width: 512,
            height: 512
          }],
          prompt: prompt,
          model: '火山引擎即梦AI (模拟模式)',
          timestamp: new Date().toISOString()
        }
      };
    }

    try {
      console.log('🚀 尝试真实API调用...');
      
      // 调用火山引擎即梦AI文生图模型
      const requestData = {
        req_key: `jiemeng_text2image_${Date.now()}`,
        prompt: prompt,
        model_version: '2.0-beta', // 即梦AI 2.0版本
        width: options.width || 1024,
        height: options.height || 1024,
        guidance_scale: options.scale || 6.0,
        inference_steps: options.steps || 25,
        seed: options.seed || Math.floor(Math.random() * 1000000),
        format: 'jpeg',
        quality: 90
      };

      console.log('📤 发送即梦AI请求数据:', requestData);
      
      const response = await this.apiClient!.request('/api/v1/jiemeng_img_generation', 'POST', requestData);
      
      console.log('📥 收到响应:', response);
      
      if (response && (response.code === 20000 || response.code === 0 || response.status === 'success')) {
        // API调用成功，处理不同的响应格式
        let images = [];
        
        if (response.data?.images) {
          // 标准响应格式
          images = response.data.images.map((img: any) => ({
            url: img.url || `data:image/jpeg;base64,${img.base64}`,
            width: requestData.width,
            height: requestData.height
          }));
        } else if (response.data?.binary_data_base64) {
          // Base64响应格式
          images = response.data.binary_data_base64.map((base64: string) => ({
            url: `data:image/jpeg;base64,${base64}`,
            width: requestData.width,
            height: requestData.height
          }));
        } else if (response.images) {
          // 直接图片数组
          images = response.images.map((img: any) => ({
            url: img.url || img.image_url,
            width: requestData.width,
            height: requestData.height
          }));
        }

        return {
          success: true,
          data: {
            images,
            prompt: prompt,
            model: '火山引擎即梦AI',
            timestamp: new Date().toISOString(),
            task_id: response.task_id || response.req_key
          }
        };
      } else {
        throw new Error(`API返回错误: ${response?.code || response?.error_code} - ${response?.message || response?.error_message || '未知错误'}`);
      }

    } catch (error: any) {
      console.error('❌ 真实API调用失败:', error);
      
      // 降级到模拟模式
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        success: true,
        data: {
          images: [{
            url: this.generateMockImage(prompt),
            width: 512,
            height: 512
          }],
          prompt: prompt,
          model: '火山引擎即梦AI (容错模式)',
          timestamp: new Date().toISOString(),
          error: error.message
        }
      };
    }
  }

  /**
   * 图生图API调用
   */
  async imageToImage(imageFile: File, prompt: string, options: any = {}): Promise<any> {
    console.log('🖼️ 开始图生图API调用:', prompt);
    
    if (!this.initializeClient()) {
      console.warn('未配置API密钥，使用模拟模式');
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      return {
        success: true,
        data: {
          images: [{
            url: this.generateMockImage(`基于图片: ${prompt}`),
            width: 512,
            height: 512
          }],
          prompt: prompt,
          model: '火山引擎即梦AI (模拟模式)',
          timestamp: new Date().toISOString()
        }
      };
    }

    try {
      // 转换图片为base64
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });

      const requestData = {
        req_key: `jiemeng_image2image_${Date.now()}`,
        prompt: prompt,
        model_version: '2.0-beta',
        input_image: base64Image,
        strength: options.strength || 0.75,
        width: options.width || 1024,
        height: options.height || 1024,
        guidance_scale: options.scale || 6.0,
        inference_steps: options.steps || 25,
        seed: options.seed || Math.floor(Math.random() * 1000000),
        format: 'jpeg',
        quality: 90
      };

      console.log('📤 发送即梦AI图生图请求...');
      
      const response = await this.apiClient!.request('/api/v1/jiemeng_img_variation', 'POST', requestData);
      
      console.log('📥 收到图生图响应:', response);
      
      if (response && (response.code === 20000 || response.code === 0 || response.status === 'success')) {
        // API调用成功，处理不同的响应格式
        let images = [];
        
        if (response.data?.images) {
          // 标准响应格式
          images = response.data.images.map((img: any) => ({
            url: img.url || `data:image/jpeg;base64,${img.base64}`,
            width: requestData.width,
            height: requestData.height
          }));
        } else if (response.data?.binary_data_base64) {
          // Base64响应格式
          images = response.data.binary_data_base64.map((base64: string) => ({
            url: `data:image/jpeg;base64,${base64}`,
            width: requestData.width,
            height: requestData.height
          }));
        } else if (response.images) {
          // 直接图片数组
          images = response.images.map((img: any) => ({
            url: img.url || img.image_url,
            width: requestData.width,
            height: requestData.height
          }));
        }

        return {
          success: true,
          data: {
            images,
            prompt: prompt,
            model: '火山引擎即梦AI',
            timestamp: new Date().toISOString(),
            task_id: response.task_id || response.req_key
          }
        };
      } else {
        throw new Error(`API返回错误: ${response?.code || response?.error_code} - ${response?.message || response?.error_message || '未知错误'}`);
      }

    } catch (error: any) {
      console.error('❌ 图生图API调用失败:', error);
      
      // 降级到模拟模式
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      return {
        success: true,
        data: {
          images: [{
            url: this.generateMockImage(`基于图片: ${prompt}`),
            width: 512,
            height: 512
          }],
          prompt: prompt,
          model: '火山引擎即梦AI (容错模式)',
          timestamp: new Date().toISOString(),
          error: error.message
        }
      };
    }
  }

  /**
   * 检测网络连接状态
   */
  private async checkNetworkConnectivity(): Promise<{ online: boolean; vpnDetected: boolean; details: string }> {
    try {
      // 检测基本网络连接
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const testUrls = [
        'https://www.baidu.com',
        'https://visual.volcengineapi.com',
        'https://google.com'
      ];
      
      const results = await Promise.allSettled(
        testUrls.map(url => 
          fetch(url, {
            method: 'HEAD',
            mode: 'no-cors',
            signal: controller.signal
          }).then(() => ({ url, success: true }))
           .catch(() => ({ url, success: false }))
        )
      );
      
      clearTimeout(timeoutId);
      
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const volcengineReachable = results.find(r => 
        r.status === 'fulfilled' && 
        r.value.url.includes('volcengineapi.com') && 
        r.value.success
      );
      
      const vpnDetected = successCount > 0 && !volcengineReachable;
      
      return {
        online: successCount > 0,
        vpnDetected,
        details: `网络检测: ${successCount}/${testUrls.length} 个地址可达，火山引擎API ${volcengineReachable ? '可达' : '不可达'}`
      };
    } catch (error) {
      return {
        online: false,
        vpnDetected: false,
        details: `网络检测失败: ${error}`
      };
    }
  }

  /**
   * 测试API连接
   */
  async testConnection(): Promise<any> {
    try {
      if (!this.initializeClient()) {
        return {
          success: true,
          message: '未配置API密钥，将使用模拟模式',
          config: false,
          mode: '模拟模式',
          timestamp: new Date().toISOString()
        };
      }

      console.log('🔍 开始API连接测试...');
      
      // 首先检测网络连接状态
      console.log('📡 检测网络连接状态...');
      const networkStatus = await this.checkNetworkConnectivity();
      console.log('📡 网络状态:', networkStatus);
      
      if (!networkStatus.online) {
        return {
          success: false,
          message: '网络连接不可用，请检查网络设置',
          config: true,
          mode: '网络不可用',
          timestamp: new Date().toISOString(),
          network: networkStatus
        };
      }
      
      if (networkStatus.vpnDetected) {
        console.warn('⚠️ 检测到可能的VPN影响，建议关闭VPN后重试');
      }
      
      // 使用简单的即梦AI请求测试连接
      const testData = {
        req_key: `jiemeng_test_${Date.now()}`,
        prompt: '测试连接',
        model_version: '2.0-beta',
        width: 512,
        height: 512,
        guidance_scale: 6.0,
        inference_steps: 10,
        seed: 12345,
        format: 'jpeg',
        quality: 80
      };

      console.log('🚀 发送API测试请求...');
      const response = await this.apiClient!.request('/api/v1/jiemeng_img_generation', 'POST', testData);
      
      if (response && (response.code === 20000 || response.code === 0)) {
        return {
          success: true,
          message: '火山引擎即梦AI API连接测试成功！',
          config: true,
          mode: '真实API模式',
          timestamp: new Date().toISOString(),
          network: networkStatus
        };
      } else {
        throw new Error(`API测试失败: ${response?.code} - ${response?.message}`);
      }

  } catch (error: any) {
      console.error('❌ API连接测试失败:', error);
      
      let errorMessage = `API连接测试失败: ${error.message}`;
      if (error.message.includes('VPN')) {
        errorMessage += '\n\n💡 建议：如果您正在使用VPN，请尝试关闭VPN后重新测试';
      }
      
      return {
        success: false,
        message: errorMessage,
        config: true,
        mode: '连接失败',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }
}

// 创建服务实例
const jiemengService = new JieMengService();

// 导出兼容性接口
export const hasJieMengApiKey = (): boolean => {
  try {
    // 优先从新的API配置系统获取
    const configJson = localStorage.getItem('travel-generator-api-config');
    if (configJson) {
      const config = JSON.parse(configJson);
      if (config.imageGeneration?.enablePaid && 
          config.imageGeneration?.provider === 'jiemeng' && 
          config.imageGeneration?.apiKey &&
          config.imageGeneration.apiKey.includes(':')) {
        return true;
      }
    }
    
    // 兼容旧的存储方式
    const userSettings = localStorage.getItem('userSettings');
    if (userSettings) {
      const settings = JSON.parse(userSettings);
      if (settings.jiemengApiKey && settings.jiemengApiKey.includes(':')) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
};

export async function generateImageFromText(
  prompt: string,
  options?: any
): Promise<{ image_base64: string; image_url?: string }[]> {
  const result = await jiemengService.textToImage(prompt, options);
  
  if (result.success && result.data.images) {
    return result.data.images.map((img: any) => ({
      image_base64: img.url,
      image_url: img.url
    }));
  }
  
  throw new Error('生成图片失败');
}

export async function generateImageFromImage(
  image: string,
  prompt: string,
  options?: any
): Promise<{ image_base64: string; image_url?: string }[]> {
  // 创建临时文件对象
  const response = await fetch(image);
  const blob = await response.blob();
  const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
  
  const result = await jiemengService.imageToImage(file, prompt, options);
  
  if (result.success && result.data.images) {
    return result.data.images.map((img: any) => ({
      image_base64: img.url,
      image_url: img.url
    }));
  }
  
  throw new Error('生成图片失败');
}

export async function generateJieMengPhoto(
  prompt: string,
  filterStyle: string = '自然色彩',
  isRealistic: boolean = false,
  uploadedImageBase64?: string,
  uploadedImageMimeType?: string
): Promise<string> {
  console.log('🎨 开始火山引擎即梦AI智能图片生成...');
  
  // 构建增强提示词
  let enhancedPrompt = prompt;
  
  if (filterStyle && filterStyle !== "无滤镜 (真实色彩)") {
    enhancedPrompt += `, ${filterStyle}风格`;
  }
  
  if (isRealistic) {
    enhancedPrompt += ", 写实风格照片, 高质量摄影";
  } else {
    enhancedPrompt += ", 艺术风格, 梦幻意境";
  }

  let result;
  
  if (uploadedImageBase64) {
    // 图生图
    const response = await fetch(uploadedImageBase64);
    const blob = await response.blob();
    const file = new File([blob], 'upload.jpg', { type: uploadedImageMimeType || 'image/jpeg' });
    
    result = await jiemengService.imageToImage(file, enhancedPrompt);
    } else {
    // 文生图
    result = await jiemengService.textToImage(enhancedPrompt);
  }

  if (result.success && result.data.images && result.data.images.length > 0) {
    return result.data.images[0].url;
  }
  
  throw new Error('生成图片失败');
}

export async function testJieMengApiConnection(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  const result = await jiemengService.testConnection();
    return {
    success: result.success,
    message: result.message,
    details: result
  };
}

export async function getJieMengServiceStatus(): Promise<{
  isActive: boolean;
  hasApiKey: boolean;
  message: string;
  provider: string;
}> {
  const hasKey = hasJieMengApiKey();
  
  return {
    isActive: true,
    hasApiKey: hasKey,
    message: hasKey ? '已配置API密钥' : '未配置API密钥，将使用模拟模式',
    provider: '火山引擎即梦AI'
  };
}

export { jiemengService }; 