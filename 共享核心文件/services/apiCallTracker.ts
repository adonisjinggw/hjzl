/**
 * 🚀 API调用追踪装饰器服务
 * 自动记录所有API调用的统计信息到OneApiManager
 */

import { oneApiManager } from './oneApiManager';

/**
 * API调用追踪装饰器
 * 用于包装API调用函数，自动记录统计信息
 */
export function trackApiCall<T extends any[], R>(
  provider: string,
  service: 'text' | 'image',
  originalFunction: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async function trackedApiCall(...args: T): Promise<R> {
    const startTime = Date.now();
    
    try {
      console.log(`📊 API调用开始 - ${provider}[${service}]`);
      
      const result = await originalFunction(...args);
      const responseTime = Date.now() - startTime;
      
      // 尝试从结果中提取token和成本信息
      let tokens: number | undefined;
      let cost: number | undefined;
      
      if (typeof result === 'object' && result !== null) {
        const resultObj = result as any;
        tokens = resultObj.usage?.total_tokens || resultObj.tokens;
        cost = resultObj.cost || resultObj.estimatedCost;
      }
      
      // 记录成功的API调用
      oneApiManager.recordApiCall(provider, service, true, responseTime, {
        tokens,
        cost
      });
      
      console.log(`✅ API调用成功 - ${provider}[${service}] (${responseTime}ms)`);
      return result;
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      
      // 记录失败的API调用
      oneApiManager.recordApiCall(provider, service, false, responseTime, {
        errorMessage
      });
      
      console.error(`❌ API调用失败 - ${provider}[${service}] (${responseTime}ms):`, errorMessage);
      throw error;
    }
  };
}

/**
 * 创建带有追踪功能的API客户端
 */
export class TrackedApiClient {
  private provider: string;
  
  constructor(provider: string) {
    this.provider = provider;
  }
  
  /**
   * 追踪文本生成API调用
   */
  trackTextGeneration<T extends any[], R>(
    apiFunction: (...args: T) => Promise<R>
  ): (...args: T) => Promise<R> {
    return trackApiCall(this.provider, 'text', apiFunction);
  }
  
  /**
   * 追踪图像生成API调用
   */
  trackImageGeneration<T extends any[], R>(
    apiFunction: (...args: T) => Promise<R>
  ): (...args: T) => Promise<R> {
    return trackApiCall(this.provider, 'image', apiFunction);
  }
}

/**
 * 为现有的API服务创建追踪包装器
 */
export const createTrackedApiService = (provider: string) => {
  return new TrackedApiClient(provider);
};

/**
 * 批量API调用追踪器
 * 用于追踪批量操作中的多个API调用
 */
export class BatchApiTracker {
  private provider: string;
  private service: 'text' | 'image';
  private startTime: number;
  private callCount: number = 0;
  private successCount: number = 0;
  private failureCount: number = 0;
  private totalResponseTime: number = 0;
  
  constructor(provider: string, service: 'text' | 'image') {
    this.provider = provider;
    this.service = service;
    this.startTime = Date.now();
  }
  
  /**
   * 记录单次API调用结果
   */
  recordCall(success: boolean, responseTime: number, options?: {
    tokens?: number;
    cost?: number;
    errorMessage?: string;
  }) {
    this.callCount++;
    this.totalResponseTime += responseTime;
    
    if (success) {
      this.successCount++;
    } else {
      this.failureCount++;
    }
    
    // 记录到oneApiManager
    oneApiManager.recordApiCall(this.provider, this.service, success, responseTime, options);
  }
  
  /**
   * 完成批量调用追踪
   */
  finish() {
    const totalTime = Date.now() - this.startTime;
    const avgResponseTime = this.callCount > 0 ? this.totalResponseTime / this.callCount : 0;
    
    console.log(`📊 批量API调用完成 - ${this.provider}[${this.service}]:`, {
      总调用次数: this.callCount,
      成功次数: this.successCount,
      失败次数: this.failureCount,
      平均响应时间: Math.round(avgResponseTime) + 'ms',
      总耗时: totalTime + 'ms',
      成功率: this.callCount > 0 ? ((this.successCount / this.callCount) * 100).toFixed(1) + '%' : '0%'
    });
    
    return {
      totalCalls: this.callCount,
      successCalls: this.successCount,
      failureCalls: this.failureCount,
      avgResponseTime: Math.round(avgResponseTime),
      totalTime,
      successRate: this.callCount > 0 ? this.successCount / this.callCount : 0
    };
  }
} 