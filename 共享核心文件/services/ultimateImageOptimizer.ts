/**
 * 🚀 终极图片生成优化器
 * 革命性性能提升系统
 */

import { generateImagesBatch, generateImageSuperFast } from './fastBatchImageService';

// 性能监控接口
interface UltimatePerformanceMetrics {
  totalRequests: number;
  averageGenerationTime: number;
  cacheHitRate: number;
  networkQuality: string;
}

class UltimateImageOptimizer {
  private predictiveCache: Map<string, any> = new Map();
  private metrics: UltimatePerformanceMetrics;
  private networkQuality: 'fast' | 'medium' | 'slow' = 'medium';

  constructor() {
    this.metrics = {
      totalRequests: 0,
      averageGenerationTime: 0,
      cacheHitRate: 0,
      networkQuality: this.networkQuality
    };
    this.initializeNetworkMonitoring();
  }

  /**
   * 🚀 终极超高速图片生成
   */
  async generateUltraFast(
    tasks: any[],
    progressCallback?: (progress: number, phase: string) => void
  ): Promise<any[]> {
    const startTime = Date.now();
    
    console.log('🚀 启动终极超高速图片生成引擎...');
    progressCallback?.(10, '引擎启动');

    // 预测性缓存检查
    const { cachedResults, pendingTasks } = this.checkPredictiveCache(tasks);
    progressCallback?.(30, `缓存命中${cachedResults.length}张`);

    let results = [...cachedResults];
    
    if (pendingTasks.length > 0) {
      progressCallback?.(50, '超高速生成中');
      const newResults = await generateImagesBatch(pendingTasks);
      results = [...results, ...newResults];
      
      // 存储到预测性缓存
      this.storeToPredictiveCache(pendingTasks, newResults);
    }

    progressCallback?.(90, '性能优化');
    this.updateMetrics(startTime, results.length, cachedResults.length);
    
    progressCallback?.(100, '完成');
    console.log(`✅ 终极生成完成！总耗时: ${(Date.now() - startTime) / 1000}秒`);
    
    return results;
  }

  private checkPredictiveCache(tasks: any[]): { cachedResults: any[], pendingTasks: any[] } {
    const cachedResults: any[] = [];
    const pendingTasks: any[] = [];

    tasks.forEach(task => {
      const cacheKey = this.generateCacheKey(task);
      const cached = this.predictiveCache.get(cacheKey);

      if (cached && this.isCacheValid(cached)) {
        cachedResults.push({
          id: task.id,
          success: true,
          imageBase64: cached.imageBase64,
          apiProvider: 'predictive_cache',
          promptUsed: cached.promptUsed,
          generateTime: 0
        });
      } else {
        pendingTasks.push(task);
      }
    });

    return { cachedResults, pendingTasks };
  }

  private storeToPredictiveCache(tasks: any[], results: any[]): void {
    results.forEach((result, index) => {
      if (result.success && tasks[index]) {
        const cacheKey = this.generateCacheKey(tasks[index]);
        this.predictiveCache.set(cacheKey, {
          imageBase64: result.imageBase64,
          promptUsed: result.promptUsed,
          timestamp: Date.now()
        });
      }
    });
  }

  private generateCacheKey(task: any): string {
    return btoa(encodeURIComponent(`${task.prompt}_${task.filterStyle}_${task.isRealistic}`));
  }

  private isCacheValid(cached: any): boolean {
    const maxAge = 60 * 60 * 1000; // 1小时
    return Date.now() - cached.timestamp < maxAge;
  }

  private initializeNetworkMonitoring(): void {
    try {
      const connection = (navigator as any).connection;
      if (connection) {
        const effectiveType = connection.effectiveType;
        this.networkQuality = effectiveType === '4g' ? 'fast' : 
                             effectiveType === '3g' ? 'medium' : 'slow';
      }
    } catch (error) {
      console.log('网络监控初始化失败，使用默认配置');
    }
  }

  private updateMetrics(startTime: number, totalCount: number, cachedCount: number): void {
    const duration = Date.now() - startTime;
    this.metrics.totalRequests += totalCount;
    this.metrics.averageGenerationTime = duration / totalCount;
    this.metrics.cacheHitRate = (cachedCount / totalCount) * 100;
    this.metrics.networkQuality = this.networkQuality;
  }

  getMetrics(): UltimatePerformanceMetrics {
    return { ...this.metrics };
  }
}

const ultimateOptimizer = new UltimateImageOptimizer();

export { ultimateOptimizer };
export async function generateImagesUltraFast(
  tasks: any[],
  progressCallback?: (progress: number, phase: string) => void
): Promise<any[]> {
  return await ultimateOptimizer.generateUltraFast(tasks, progressCallback);
} 