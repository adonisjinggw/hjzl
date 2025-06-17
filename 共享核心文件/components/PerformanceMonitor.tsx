/**
 * 🚀 性能监控组件
 * 显示图片生成的实时性能指标和优化效果
 */

import React, { useState, useEffect } from 'react';
import { Zap, Clock, TrendingUp, Wifi, CheckCircle } from 'lucide-react';

interface PerformanceMetrics {
  totalGenerated: number;
  averageTime: number;
  cacheHitRate: number;
  networkQuality: string;
  currentStatus: string;
  speedImprovement: number; // 相比传统方式的速度提升倍数
  currentImageProvider?: string; // 当前图像生成服务商
  imageProviderType?: 'paid' | 'free'; // 服务商类型
}

interface PerformanceMonitorProps {
  isVisible: boolean;
  currentProgress: number;
  currentPhase: string;
  metrics?: PerformanceMetrics;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  isVisible,
  currentProgress,
  currentPhase,
  metrics
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    if (currentProgress > animatedProgress) {
      const timer = setTimeout(() => {
        setAnimatedProgress(animatedProgress + 1);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [currentProgress, animatedProgress]);

  if (!isVisible) return null;

  const getNetworkQualityColor = (quality: string) => {
    switch (quality) {
      case 'fast': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'slow': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  const getSpeedImprovementText = (improvement: number) => {
    if (improvement >= 10) return '🚀 极速模式';
    if (improvement >= 5) return '⚡ 超高速';
    if (improvement >= 3) return '🔥 高速';
    return '📈 优化中';
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900/95 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4 min-w-[300px] z-50">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-5 h-5 text-purple-400" />
        <h3 className="text-white font-semibold">终极图片生成引擎</h3>
      </div>

      {/* 进度条 */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-300 text-sm">{currentPhase}</span>
          <span className="text-purple-400 text-sm font-semibold">{animatedProgress}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${animatedProgress}%` }}
          />
        </div>
      </div>

      {/* 性能指标 */}
      {metrics && (
        <div className="space-y-3">
          {/* 速度提升 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-gray-300 text-sm">速度提升</span>
            </div>
            <div className="text-right">
              <div className="text-green-400 font-semibold text-sm">
                {metrics.speedImprovement.toFixed(1)}x
              </div>
              <div className="text-xs text-gray-400">
                {getSpeedImprovementText(metrics.speedImprovement)}
              </div>
            </div>
          </div>

          {/* 平均生成时间 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-gray-300 text-sm">平均时间</span>
            </div>
            <span className="text-blue-400 font-semibold text-sm">
              {metrics.averageTime.toFixed(1)}s/张
            </span>
          </div>

          {/* 缓存命中率 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-gray-300 text-sm">缓存命中</span>
            </div>
            <span className="text-green-400 font-semibold text-sm">
              {metrics.cacheHitRate.toFixed(1)}%
            </span>
          </div>

          {/* 网络质量 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300 text-sm">网络质量</span>
            </div>
            <span className={`font-semibold text-sm capitalize ${getNetworkQualityColor(metrics.networkQuality)}`}>
              {metrics.networkQuality}
            </span>
          </div>

          {/* 当前图像服务商 */}
          {metrics.currentImageProvider && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 text-blue-400">
                  {metrics.imageProviderType === 'paid' ? '💎' : '🆓'}
                </div>
                <span className="text-gray-300 text-sm">图像服务</span>
              </div>
              <div className="text-right">
                <div className={`font-semibold text-sm ${
                  metrics.imageProviderType === 'paid' ? 'text-purple-400' : 'text-blue-400'
                }`}>
                  {metrics.currentImageProvider}
                </div>
                <div className="text-xs text-gray-400">
                  {metrics.imageProviderType === 'paid' ? '付费服务' : '免费服务'}
                </div>
              </div>
            </div>
          )}

          {/* 总生成数 */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-700">
            <span className="text-gray-400 text-xs">总生成数</span>
            <span className="text-gray-300 text-xs font-semibold">
              {metrics.totalGenerated} 张
            </span>
          </div>
        </div>
      )}

      {/* 优化特性标签 */}
      <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-gray-700">
        <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
          🔥 8线程并发
        </span>
        <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
          🧠 智能缓存
        </span>
        <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
          🏁 API竞速
        </span>
      </div>
    </div>
  );
};

export default PerformanceMonitor; 