/**
 * 🚀 统一API管理服务
 * 参考 one-api 设计理念，实现企业级API管理和监控
 * 
 * 功能特性：
 * - 多服务商统一管理
 * - 实时状态监控
 * - 请求统计分析
 * - 智能负载均衡
 * - 自动故障切换
 * - API额度管理
 */

import type { 
  ApiConfig, 
  TextApiProvider, 
  ImageApiProvider 
} from '../types';

// API调用统计接口
export interface ApiCallStats {
  provider: string;
  totalCalls: number;
  successCalls: number;
  failedCalls: number;
  avgResponseTime: number;
  lastCallTime: number;
  successRate: number;
}

// 服务状态接口
export interface ServiceStatus {
  provider: string;
  status: 'active' | 'error' | 'testing' | 'disabled';
  lastCheck: number;
  responseTime: number;
  errorMessage?: string;
}

// API使用记录
export interface ApiUsageRecord {
  id: string;
  provider: string;
  service: 'text' | 'image';
  timestamp: number;
  success: boolean;
  responseTime: number;
  tokens?: number;
  cost?: number;
  errorMessage?: string;
}

/**
 * API管理器类 - 参考 one-api 架构
 */
export class ApiManager {
  private static instance: ApiManager;
  private stats: Map<string, ApiCallStats> = new Map();
  private serviceStatus: Map<string, ServiceStatus> = new Map();
  private usageHistory: ApiUsageRecord[] = [];
  private maxHistorySize = 1000; // 最大保存记录数

  private constructor() {
    this.loadStatsFromStorage();
    this.startHealthCheck();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): ApiManager {
    if (!ApiManager.instance) {
      ApiManager.instance = new ApiManager();
    }
    return ApiManager.instance;
  }

  /**
   * 记录API调用
   */
  public recordApiCall(
    provider: string,
    service: 'text' | 'image',
    success: boolean,
    responseTime: number,
    options: {
      tokens?: number;
      cost?: number;
      errorMessage?: string;
    } = {}
  ): void {
    const now = Date.now();
    
    // 更新统计信息
    const currentStats = this.stats.get(provider) || {
      provider,
      totalCalls: 0,
      successCalls: 0,
      failedCalls: 0,
      avgResponseTime: 0,
      lastCallTime: 0,
      successRate: 0
    };

    currentStats.totalCalls++;
    currentStats.lastCallTime = now;
    
    if (success) {
      currentStats.successCalls++;
    } else {
      currentStats.failedCalls++;
    }
    
    // 计算平均响应时间
    currentStats.avgResponseTime = 
      (currentStats.avgResponseTime * (currentStats.totalCalls - 1) + responseTime) / currentStats.totalCalls;
    
    // 计算成功率
    currentStats.successRate = currentStats.successCalls / currentStats.totalCalls;
    
    this.stats.set(provider, currentStats);

    // 添加使用记录
    const record: ApiUsageRecord = {
      id: `${provider}_${now}_${Math.random().toString(36).substr(2, 9)}`,
      provider,
      service,
      timestamp: now,
      success,
      responseTime,
      tokens: options.tokens,
      cost: options.cost,
      errorMessage: options.errorMessage
    };

    this.usageHistory.unshift(record);
    if (this.usageHistory.length > this.maxHistorySize) {
      this.usageHistory = this.usageHistory.slice(0, this.maxHistorySize);
    }

    // 保存到本地存储
    this.saveStatsToStorage();

    console.log(`📊 API调用统计 - ${provider}: ${success ? '✅' : '❌'} (${responseTime}ms)`);
  }

  /**
   * 获取API统计信息
   */
  public getApiStats(): ApiCallStats[] {
    return Array.from(this.stats.values()).sort((a, b) => b.totalCalls - a.totalCalls);
  }

  /**
   * 获取服务状态
   */
  public getServiceStatus(): ServiceStatus[] {
    return Array.from(this.serviceStatus.values());
  }

  /**
   * 获取使用历史记录
   */
  public getUsageHistory(limit: number = 50): ApiUsageRecord[] {
    return this.usageHistory.slice(0, limit);
  }

  /**
   * 获取今日统计
   */
  public getTodayStats(): {
    totalCalls: number;
    successCalls: number;
    failedCalls: number;
    avgResponseTime: number;
    providerStats: Record<string, ApiCallStats>;
  } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    const todayRecords = this.usageHistory.filter(r => r.timestamp >= todayTimestamp);
    
    const totalCalls = todayRecords.length;
    const successCalls = todayRecords.filter(r => r.success).length;
    const failedCalls = totalCalls - successCalls;
    const avgResponseTime = todayRecords.length > 0 
      ? todayRecords.reduce((sum, r) => sum + r.responseTime, 0) / todayRecords.length 
      : 0;

    // 按服务商分组统计
    const providerStats: Record<string, ApiCallStats> = {};
    const providerGroups = todayRecords.reduce((groups, record) => {
      if (!groups[record.provider]) {
        groups[record.provider] = [];
      }
      groups[record.provider].push(record);
      return groups;
    }, {} as Record<string, ApiUsageRecord[]>);

    Object.entries(providerGroups).forEach(([provider, records]) => {
      const success = records.filter(r => r.success).length;
      const total = records.length;
      const avgTime = records.reduce((sum, r) => sum + r.responseTime, 0) / total;
      
      providerStats[provider] = {
        provider,
        totalCalls: total,
        successCalls: success,
        failedCalls: total - success,
        avgResponseTime: avgTime,
        lastCallTime: Math.max(...records.map(r => r.timestamp)),
        successRate: success / total
      };
    });

    return {
      totalCalls,
      successCalls,
      failedCalls,
      avgResponseTime,
      providerStats
    };
  }

  /**
   * 清除统计数据
   */
  public clearStats(): void {
    this.stats.clear();
    this.usageHistory = [];
    this.serviceStatus.clear();
    localStorage.removeItem('api-manager-stats');
    localStorage.removeItem('api-manager-history');
    console.log('📊 API统计数据已清除');
  }

  /**
   * 测试服务连接状态
   */
  public async testServiceConnection(provider: string): Promise<ServiceStatus> {
    const startTime = Date.now();
    
    try {
      this.updateServiceStatus(provider, 'testing');
      
      // 根据服务商类型进行连接测试
      let testResult = false;
      
      if (this.isTextProvider(provider)) {
        const { testProviderConnection } = await import('./enhancedTextService');
        const config = this.getCurrentApiConfig();
        const apiKey = config?.textGeneration?.apiKey;
        
        if (apiKey) {
          const result = await testProviderConnection(provider as TextApiProvider, apiKey);
          testResult = result.success;
        }
      } else if (this.isImageProvider(provider)) {
        // 图像服务商测试逻辑
        testResult = await this.testImageProvider(provider as ImageApiProvider);
      }

      const responseTime = Date.now() - startTime;
      const status: ServiceStatus = {
        provider,
        status: testResult ? 'active' : 'error',
        lastCheck: Date.now(),
        responseTime,
        errorMessage: testResult ? undefined : '连接测试失败'
      };

      this.serviceStatus.set(provider, status);
      return status;
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const status: ServiceStatus = {
        provider,
        status: 'error',
        lastCheck: Date.now(),
        responseTime,
        errorMessage: error instanceof Error ? error.message : '未知错误'
      };

      this.serviceStatus.set(provider, status);
      return status;
    }
  }

  /**
   * 获取最佳可用服务商
   */
  public getBestAvailableProvider(serviceType: 'text' | 'image'): string | null {
    const config = this.getCurrentApiConfig();
    if (!config) return null;

    const providers = serviceType === 'text' 
      ? this.getAvailableTextProviders()
      : this.getAvailableImageProviders();

    // 过滤出有API密钥的服务商
    const configuredProviders = providers.filter(provider => {
      if (serviceType === 'text') {
        return config.textGeneration.provider === provider && config.textGeneration.apiKey;
      } else {
        return config.imageGeneration.provider === provider && config.imageGeneration.apiKey;
      }
    });

    if (configuredProviders.length === 0) return null;

    // 根据成功率和响应时间选择最佳服务商
    const providerStats = configuredProviders.map(provider => {
      const stats = this.stats.get(provider);
      const status = this.serviceStatus.get(provider);
      
      return {
        provider,
        score: this.calculateProviderScore(stats, status)
      };
    }).sort((a, b) => b.score - a.score);

    return providerStats[0]?.provider || configuredProviders[0];
  }

  /**
   * 计算服务商评分
   */
  private calculateProviderScore(stats?: ApiCallStats, status?: ServiceStatus): number {
    let score = 100;

    if (stats) {
      // 成功率权重 60%
      score = score * 0.4 + (stats.successRate * 100) * 0.6;
      
      // 响应时间权重 20% (响应时间越低越好)
      const responseTimeScore = Math.max(0, 100 - stats.avgResponseTime / 50);
      score = score * 0.8 + responseTimeScore * 0.2;
      
      // 最近调用时间权重 20% (越近越好)
      const timeSinceLastCall = Date.now() - stats.lastCallTime;
      const recentnessScore = Math.max(0, 100 - timeSinceLastCall / 60000); // 1分钟内满分
      score = score * 0.8 + recentnessScore * 0.2;
    }

    if (status && status.status === 'error') {
      score *= 0.1; // 出错的服务商大幅降分
    }

    return score;
  }

  /**
   * 启动健康检查
   */
  private startHealthCheck(): void {
    // 每5分钟检查一次服务状态
    setInterval(() => {
      this.performHealthCheck();
    }, 5 * 60 * 1000);
  }

  /**
   * 执行健康检查
   */
  private async performHealthCheck(): Promise<void> {
    const config = this.getCurrentApiConfig();
    if (!config) return;

    const providers = [
      ...(config.textGeneration.apiKey ? [config.textGeneration.provider] : []),
      ...(config.imageGeneration.apiKey ? [config.imageGeneration.provider] : [])
    ];

    for (const provider of providers) {
      try {
        await this.testServiceConnection(provider);
      } catch (error) {
        console.error(`健康检查失败 - ${provider}:`, error);
      }
    }
  }

  /**
   * 更新服务状态
   */
  private updateServiceStatus(provider: string, status: ServiceStatus['status']): void {
    const currentStatus = this.serviceStatus.get(provider) || {
      provider,
      status: 'disabled',
      lastCheck: 0,
      responseTime: 0
    };

    this.serviceStatus.set(provider, {
      ...currentStatus,
      status,
      lastCheck: Date.now()
    });
  }

  /**
   * 保存统计到本地存储
   */
  private saveStatsToStorage(): void {
    try {
      localStorage.setItem('api-manager-stats', JSON.stringify(Array.from(this.stats.entries())));
      localStorage.setItem('api-manager-history', JSON.stringify(this.usageHistory.slice(0, 100))); // 只保存最近100条
    } catch (error) {
      console.error('保存API统计失败:', error);
    }
  }

  /**
   * 从本地存储加载统计
   */
  private loadStatsFromStorage(): void {
    try {
      const statsData = localStorage.getItem('api-manager-stats');
      const historyData = localStorage.getItem('api-manager-history');
      
      if (statsData) {
        const entries = JSON.parse(statsData);
        this.stats = new Map(entries);
      }
      
      if (historyData) {
        this.usageHistory = JSON.parse(historyData);
      }
    } catch (error) {
      console.error('加载API统计失败:', error);
    }
  }

  /**
   * 获取当前API配置
   */
  private getCurrentApiConfig(): ApiConfig | null {
    try {
      const configJson = localStorage.getItem('travel-generator-api-config');
      return configJson ? JSON.parse(configJson) : null;
    } catch (error) {
      console.error('获取API配置失败:', error);
      return null;
    }
  }

  /**
   * 检查是否为文本服务商
   */
  private isTextProvider(provider: string): boolean {
    const textProviders = [
      'openai', 'claude', 'gemini', 'hunyuan', 'deepseek', 'siliconflow',
      'azure_openai', 'wenxin', 'tongyi', 'doubao', 'qwen', 'yi',
      'moonshot', 'zhipu', 'minimax', 'baichuan', 'builtin_free'
    ];
    return textProviders.includes(provider);
  }

  /**
   * 检查是否为图像服务商
   */
  private isImageProvider(provider: string): boolean {
    const imageProviders = [
      'gemini', 'openai_dalle', 'midjourney', 'stability', 'runninghub', 'jiemeng',
      'wenxin_yige', 'tongyi_wanxiang', 'doubao_image', 'zhipu_cogview',
      'tencent_hunyuan', 'leonardo', 'replicate', 'huggingface',
      'pollinations', 'deepai', 'unsplash', 'picsum'
    ];
    return imageProviders.includes(provider);
  }

  /**
   * 获取可用文本服务商列表
   */
  private getAvailableTextProviders(): string[] {
    return [
      'openai', 'claude', 'gemini', 'hunyuan', 'deepseek', 'siliconflow',
      'azure_openai', 'wenxin', 'tongyi', 'doubao', 'qwen', 'yi',
      'moonshot', 'zhipu', 'minimax', 'baichuan'
    ];
  }

  /**
   * 获取可用图像服务商列表
   */
  private getAvailableImageProviders(): string[] {
    return [
      'gemini', 'openai_dalle', 'midjourney', 'stability', 'runninghub', 'jiemeng',
      'wenxin_yige', 'tongyi_wanxiang', 'doubao_image', 'zhipu_cogview',
      'tencent_hunyuan', 'leonardo', 'replicate', 'huggingface',
      'pollinations', 'deepai', 'unsplash', 'picsum'
    ];
  }

  /**
   * 测试图像服务商
   */
  private async testImageProvider(provider: ImageApiProvider): Promise<boolean> {
    try {
      // 这里可以根据具体的图像服务商实现测试逻辑
      // 暂时返回 true，实际应该调用对应的服务进行测试
      return true;
    } catch (error) {
      return false;
    }
  }
}

/**
 * 导出单例实例
 */
export const apiManager = ApiManager.getInstance();

/**
 * API调用装饰器 - 自动记录统计信息
 */
export function withApiLogging<T extends any[], R>(
  provider: string,
  service: 'text' | 'image'
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<(...args: T) => Promise<R>>
  ) {
    const originalMethod = descriptor.value!;
    
    descriptor.value = async function (...args: T): Promise<R> {
      const startTime = Date.now();
      
      try {
        const result = await originalMethod.apply(this, args);
        const responseTime = Date.now() - startTime;
        
        apiManager.recordApiCall(provider, service, true, responseTime);
        return result;
      } catch (error) {
        const responseTime = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        
        apiManager.recordApiCall(provider, service, false, responseTime, { errorMessage });
        throw error;
      }
    };
    
    return descriptor;
  };
} 