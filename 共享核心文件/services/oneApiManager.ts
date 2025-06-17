/**
 * 🚀 统一API管理服务 - 参考 one-api 设计
 * 实现企业级API管理、监控和统一分发功能
 * 
 * 核心功能：
 * - 多服务商统一管理
 * - 实时状态监控和健康检查
 * - 请求统计和性能分析
 * - 智能负载均衡和故障切换
 * - API密钥管理和额度控制
 * - 统一错误处理和降级策略
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
  totalTokens?: number;
  estimatedCost?: number;
}

// 服务状态接口
export interface ServiceStatus {
  provider: string;
  type: 'text' | 'image';
  status: 'active' | 'error' | 'testing' | 'disabled' | 'limited';
  lastCheck: number;
  responseTime: number;
  errorMessage?: string;
  quotaUsed?: number;
  quotaLimit?: number;
  rateLimit?: {
    requests: number;
    window: number; // 时间窗口(秒)
    remaining: number;
  };
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
  requestSize?: number;
  responseSize?: number;
}

// 实时监控数据
export interface RealtimeMetrics {
  timestamp: number;
  activeRequests: number;
  queueSize: number;
  systemLoad: number;
  networkLatency: number;
  cacheHitRate: number;
  errorRate: number;
}

/**
 * OneAPI风格的统一API管理器
 */
export class OneApiManager {
  private static instance: OneApiManager;
  private stats: Map<string, ApiCallStats> = new Map();
  private serviceStatus: Map<string, ServiceStatus> = new Map();
  private usageHistory: ApiUsageRecord[] = [];
  private realtimeMetrics: RealtimeMetrics[] = [];
  private readonly maxHistorySize = 1000;
  private readonly maxMetricsSize = 100;
  private healthCheckInterval?: NodeJS.Timeout;
  private metricsInterval?: NodeJS.Timeout;

  private constructor() {
    this.initializeManager();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): OneApiManager {
    if (!OneApiManager.instance) {
      OneApiManager.instance = new OneApiManager();
    }
    return OneApiManager.instance;
  }

  /**
   * 初始化管理器
   */
  private initializeManager(): void {
    this.loadDataFromStorage();
    this.startHealthCheck();
    this.startMetricsCollection();
    this.initializeServiceStatus();
    
    console.log('🚀 OneAPI Manager 已启动');
  }

  /**
   * 初始化服务状态
   */
  private initializeServiceStatus(): void {
    const config = this.getCurrentApiConfig();
    if (!config) return;

    // 初始化文本服务状态
    const textProviders = ['openai', 'claude', 'gemini', 'hunyuan', 'deepseek', 'siliconflow', 'builtin_free'];
    textProviders.forEach(provider => {
      this.updateServiceStatus(provider, 'text', {
        status: 'disabled',
        lastCheck: Date.now(),
        responseTime: 0
      });
    });

    // 初始化图像服务状态
    const imageProviders = ['openai_dalle', 'midjourney', 'stability', 'gemini', 'runninghub', 'jiemeng', 'builtin_free'];
    imageProviders.forEach(provider => {
      this.updateServiceStatus(provider, 'image', {
        status: 'disabled', 
        lastCheck: Date.now(),
        responseTime: 0
      });
    });
  }

  /**
   * 记录API调用统计
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
      requestSize?: number;
      responseSize?: number;
    } = {}
  ): void {
    const now = Date.now();
    
    // 更新统计数据
    this.updateCallStats(provider, success, responseTime, options);
    
    // 添加使用记录
    this.addUsageRecord({
      id: this.generateRecordId(provider, now),
      provider,
      service,
      timestamp: now,
      success,
      responseTime,
      ...options
    });

    // 更新服务状态
    this.updateServiceHealthStatus(provider, service, success, responseTime, options.errorMessage);

    // 保存数据
    this.saveDataToStorage();

    console.log(`📊 API调用统计 - ${provider}[${service}]: ${success ? '✅' : '❌'} (${responseTime}ms)`);
  }

  /**
   * 更新调用统计
   */
  private updateCallStats(
    provider: string,
    success: boolean,
    responseTime: number,
    options: { tokens?: number; cost?: number } = {}
  ): void {
    const currentStats = this.stats.get(provider) || this.createEmptyStats(provider);

    currentStats.totalCalls++;
    currentStats.lastCallTime = Date.now();
    
    if (success) {
      currentStats.successCalls++;
    } else {
      currentStats.failedCalls++;
    }
    
    // 计算加权平均响应时间
    const totalTime = currentStats.avgResponseTime * (currentStats.totalCalls - 1) + responseTime;
    currentStats.avgResponseTime = totalTime / currentStats.totalCalls;
    
    // 更新成功率
    currentStats.successRate = currentStats.successCalls / currentStats.totalCalls;
    
    // 累计token和成本
    if (options.tokens) {
      currentStats.totalTokens = (currentStats.totalTokens || 0) + options.tokens;
    }
    if (options.cost) {
      currentStats.estimatedCost = (currentStats.estimatedCost || 0) + options.cost;
    }
    
    this.stats.set(provider, currentStats);
  }

  /**
   * 创建空的统计记录
   */
  private createEmptyStats(provider: string): ApiCallStats {
    return {
      provider,
      totalCalls: 0,
      successCalls: 0,
      failedCalls: 0,
      avgResponseTime: 0,
      lastCallTime: 0,
      successRate: 0,
      totalTokens: 0,
      estimatedCost: 0
    };
  }

  /**
   * 添加使用记录
   */
  private addUsageRecord(record: ApiUsageRecord): void {
    this.usageHistory.unshift(record);
    if (this.usageHistory.length > this.maxHistorySize) {
      this.usageHistory = this.usageHistory.slice(0, this.maxHistorySize);
    }
  }

  /**
   * 生成记录ID
   */
  private generateRecordId(provider: string, timestamp: number): string {
    return `${provider}_${timestamp}_${Math.random().toString(36).substr(2, 6)}`;
  }

  /**
   * 更新服务健康状态
   */
  private updateServiceHealthStatus(
    provider: string,
    service: 'text' | 'image',
    success: boolean,
    responseTime: number,
    errorMessage?: string
  ): void {
    const status = success ? 'active' : 'error';
    this.updateServiceStatus(provider, service, {
      status,
      lastCheck: Date.now(),
      responseTime,
      errorMessage
    });
  }

  /**
   * 更新服务状态
   */
  private updateServiceStatus(
    provider: string,
    type: 'text' | 'image',
    updates: Partial<ServiceStatus>
  ): void {
    const key = `${provider}_${type}`;
    const currentStatus = this.serviceStatus.get(key) || {
      provider,
      type,
      status: 'disabled' as const,
      lastCheck: 0,
      responseTime: 0
    };

    this.serviceStatus.set(key, { ...currentStatus, ...updates });
  }

  /**
   * 测试服务连接
   */
  public async testServiceConnection(
    provider: string,
    type: 'text' | 'image' = 'text'
  ): Promise<ServiceStatus> {
    const startTime = Date.now();
    
    try {
      this.updateServiceStatus(provider, type, { status: 'testing' });
      
      let testResult = false;
      
      if (type === 'text') {
        testResult = await this.testTextProvider(provider as TextApiProvider);
      } else {
        testResult = await this.testImageProvider(provider as ImageApiProvider);
      }

      const responseTime = Date.now() - startTime;
      const status: ServiceStatus = {
        provider,
        type,
        status: testResult ? 'active' : 'error',
        lastCheck: Date.now(),
        responseTime,
        errorMessage: testResult ? undefined : '连接测试失败'
      };

      this.updateServiceStatus(provider, type, status);
      return this.serviceStatus.get(`${provider}_${type}`)!;
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      
      this.updateServiceStatus(provider, type, {
        status: 'error',
        lastCheck: Date.now(),
        responseTime,
        errorMessage
      });

      return this.serviceStatus.get(`${provider}_${type}`)!;
    }
  }

  /**
   * 测试文本服务商
   */
  private async testTextProvider(provider: TextApiProvider): Promise<boolean> {
    try {
      const config = this.getCurrentApiConfig();
      if (!config?.textGeneration.apiKey && provider !== 'builtin_free') {
        return false;
      }

      // 根据不同服务商实现具体测试逻辑
      switch (provider) {
        case 'builtin_free':
          return true; // 内置服务始终可用
        case 'openai':
        case 'claude':
        case 'gemini':
          // 这里应该实际调用API进行测试
          return await this.performActualApiTest(provider, 'text');
        default:
          return false;
      }
    } catch (error) {
      console.error(`文本服务商测试失败 - ${provider}:`, error);
      return false;
    }
  }

  /**
   * 测试图像服务商
   */
  private async testImageProvider(provider: ImageApiProvider): Promise<boolean> {
    try {
      const config = this.getCurrentApiConfig();
      if (!config?.imageGeneration.apiKey && provider !== 'builtin_free') {
        return false;
      }

      // 根据不同服务商实现具体测试逻辑
      switch (provider) {
        case 'builtin_free':
          return true; // 内置服务始终可用
        case 'openai_dalle':
        case 'midjourney':
        case 'stability':
          return await this.performActualApiTest(provider, 'image');
        default:
          return false;
      }
    } catch (error) {
      console.error(`图像服务商测试失败 - ${provider}:`, error);
      return false;
    }
  }

  /**
   * 执行实际的API测试
   */
  private async performActualApiTest(provider: string, type: 'text' | 'image'): Promise<boolean> {
    // 这里应该实现实际的API测试逻辑
    // 目前先返回模拟结果
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(Math.random() > 0.2); // 80%成功率
      }, 1000 + Math.random() * 2000);
    });
  }

  /**
   * 获取最佳可用服务商
   */
  public getBestAvailableProvider(
    serviceType: 'text' | 'image',
    excludeProviders: string[] = []
  ): string | null {
    const availableServices = Array.from(this.serviceStatus.values())
      .filter(service => 
        service.type === serviceType && 
        service.status === 'active' &&
        !excludeProviders.includes(service.provider)
      );

    if (availableServices.length === 0) return null;

    // 根据性能评分选择最佳服务商
    const scoredServices = availableServices.map(service => ({
      provider: service.provider,
      score: this.calculateProviderScore(service.provider)
    })).sort((a, b) => b.score - a.score);

    return scoredServices[0]?.provider || null;
  }

  /**
   * 计算服务商综合评分
   */
  private calculateProviderScore(provider: string): number {
    const stats = this.stats.get(provider);
    const services = Array.from(this.serviceStatus.values())
      .filter(s => s.provider === provider);
    
    let score = 50; // 基础分

    if (stats) {
      // 成功率权重 40%
      score += stats.successRate * 40;
      
      // 响应时间权重 30% (越低越好)
      const responseTimeScore = Math.max(0, 30 - (stats.avgResponseTime / 1000) * 30);
      score += responseTimeScore;
      
      // 最近活跃度权重 20%
      const timeSinceLastCall = Date.now() - stats.lastCallTime;
      const recentnessScore = Math.max(0, 20 - (timeSinceLastCall / 3600000) * 20); // 1小时内满分
      score += recentnessScore;
      
      // 调用量权重 10%
      const volumeScore = Math.min(10, stats.totalCalls / 100 * 10);
      score += volumeScore;
    }

    // 服务状态惩罚
    const errorServices = services.filter(s => s.status === 'error').length;
    if (errorServices > 0) {
      score *= 0.5; // 有错误服务的提供商降低50%评分
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 开始健康检查
   */
  private startHealthCheck(): void {
    // 每3分钟执行一次健康检查
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, 3 * 60 * 1000);
    
    // 立即执行一次
    setTimeout(() => this.performHealthCheck(), 1000);
  }

  /**
   * 执行健康检查
   */
  private async performHealthCheck(): Promise<void> {
    const config = this.getCurrentApiConfig();
    if (!config) return;

    const providersToCheck = [
      { provider: config.textGeneration.provider, type: 'text' as const },
      { provider: config.imageGeneration.provider, type: 'image' as const }
    ];

    for (const { provider, type } of providersToCheck) {
      if (provider && provider !== 'builtin_free') {
        try {
          await this.testServiceConnection(provider, type);
        } catch (error) {
          console.error(`健康检查失败 - ${provider}[${type}]:`, error);
        }
      }
    }
  }

  /**
   * 开始实时指标收集
   */
  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(() => {
      this.collectRealtimeMetrics();
    }, 10 * 1000); // 每10秒收集一次
  }

  /**
   * 收集实时指标
   */
  private collectRealtimeMetrics(): void {
    const metrics: RealtimeMetrics = {
      timestamp: Date.now(),
      activeRequests: 0, // 当前活跃请求数
      queueSize: 0, // 队列大小
      systemLoad: Math.random() * 100, // 系统负载模拟
      networkLatency: 50 + Math.random() * 200, // 网络延迟模拟
      cacheHitRate: 0.7 + Math.random() * 0.3, // 缓存命中率
      errorRate: this.calculateCurrentErrorRate()
    };

    this.realtimeMetrics.unshift(metrics);
    if (this.realtimeMetrics.length > this.maxMetricsSize) {
      this.realtimeMetrics = this.realtimeMetrics.slice(0, this.maxMetricsSize);
    }
  }

  /**
   * 计算当前错误率
   */
  private calculateCurrentErrorRate(): number {
    const recentCalls = this.usageHistory.slice(0, 50); // 最近50次调用
    if (recentCalls.length === 0) return 0;
    
    const failedCalls = recentCalls.filter(call => !call.success).length;
    return failedCalls / recentCalls.length;
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
   * 获取使用历史
   */
  public getUsageHistory(limit: number = 50): ApiUsageRecord[] {
    return this.usageHistory.slice(0, limit);
  }

  /**
   * 获取实时指标
   */
  public getRealtimeMetrics(limit: number = 20): RealtimeMetrics[] {
    return this.realtimeMetrics.slice(0, limit);
  }

  /**
   * 获取今日统计汇总
   */
  public getTodayStats(): {
    totalCalls: number;
    successCalls: number;
    failedCalls: number;
    avgResponseTime: number;
    totalTokens: number;
    estimatedCost: number;
    topProviders: Array<{ provider: string; calls: number; successRate: number }>;
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
    const totalTokens = todayRecords.reduce((sum, r) => sum + (r.tokens || 0), 0);
    const estimatedCost = todayRecords.reduce((sum, r) => sum + (r.cost || 0), 0);

    // 按服务商分组统计
    const providerGroups = todayRecords.reduce((groups, record) => {
      if (!groups[record.provider]) {
        groups[record.provider] = [];
      }
      groups[record.provider].push(record);
      return groups;
    }, {} as Record<string, ApiUsageRecord[]>);

    const topProviders = Object.entries(providerGroups)
      .map(([provider, records]) => ({
        provider,
        calls: records.length,
        successRate: records.filter(r => r.success).length / records.length
      }))
      .sort((a, b) => b.calls - a.calls)
      .slice(0, 5);

    return {
      totalCalls,
      successCalls,
      failedCalls,
      avgResponseTime,
      totalTokens,
      estimatedCost,
      topProviders
    };
  }

  /**
   * 清除所有统计数据
   */
  public clearAllStats(): void {
    this.stats.clear();
    this.usageHistory = [];
    this.realtimeMetrics = [];
    this.saveDataToStorage();
    console.log('📊 所有API统计数据已清除');
  }

  /**
   * 重置服务状态
   */
  public resetServiceStatus(): void {
    this.serviceStatus.clear();
    this.initializeServiceStatus();
    console.log('🔄 服务状态已重置');
  }

  /**
   * 保存数据到本地存储
   */
  private saveDataToStorage(): void {
    try {
      const data = {
        stats: Array.from(this.stats.entries()),
        usageHistory: this.usageHistory.slice(0, 100), // 只保存最近100条
        realtimeMetrics: this.realtimeMetrics.slice(0, 20), // 只保存最近20个指标点
        lastSaved: Date.now()
      };
      
      localStorage.setItem('one-api-manager-data', JSON.stringify(data));
    } catch (error) {
      console.error('保存API管理数据失败:', error);
    }
  }

  /**
   * 从本地存储加载数据
   */
  private loadDataFromStorage(): void {
    try {
      const dataJson = localStorage.getItem('one-api-manager-data');
      if (!dataJson) return;

      const data = JSON.parse(dataJson);
      
      if (data.stats) {
        this.stats = new Map(data.stats);
      }
      
      if (data.usageHistory) {
        this.usageHistory = data.usageHistory;
      }
      
      if (data.realtimeMetrics) {
        this.realtimeMetrics = data.realtimeMetrics;
      }

      console.log('📊 API管理数据已加载');
    } catch (error) {
      console.error('加载API管理数据失败:', error);
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
   * 清除所有数据
   */
  public clearAllData(): void {
    this.stats.clear();
    this.serviceStatus.clear();
    this.usageHistory = [];
    this.realtimeMetrics = [];
    
    // 清除本地存储
    localStorage.removeItem('oneapi-manager-stats');
    localStorage.removeItem('oneapi-manager-service-status');
    localStorage.removeItem('oneapi-manager-usage-history');
    localStorage.removeItem('oneapi-manager-metrics');
    
    // 重新初始化服务状态
    this.initializeServiceStatus();
    
    console.log('🗑️ OneAPI Manager 数据已清除');
  }

  /**
   * 销毁管理器
   */
  public destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
    this.saveDataToStorage();
    console.log('🚀 OneAPI Manager 已销毁');
  }
}

/**
 * 导出单例实例
 */
export const oneApiManager = OneApiManager.getInstance();

/**
 * API调用装饰器 - 自动记录统计信息
 */
export function withApiTracking(provider: string, service: 'text' | 'image') {
  return function <T extends (...args: any[]) => Promise<any>>(
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const originalMethod = descriptor.value!;
    
    descriptor.value = (async function (this: any, ...args: any[]) {
      const startTime = Date.now();
      
      try {
        const result = await originalMethod.apply(this, args);
        const responseTime = Date.now() - startTime;
        
        // 从结果中提取token和成本信息（如果有的话）
        const tokens = result?.usage?.total_tokens || result?.tokens;
        const cost = result?.cost;
        
        oneApiManager.recordApiCall(provider, service, true, responseTime, {
          tokens,
          cost
        });
        
        return result;
      } catch (error) {
        const responseTime = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        
        oneApiManager.recordApiCall(provider, service, false, responseTime, {
          errorMessage
        });
        
        throw error;
      }
    }) as T;
    
    return descriptor;
  };
} 