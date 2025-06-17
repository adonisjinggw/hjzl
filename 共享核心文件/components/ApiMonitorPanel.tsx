/**
 * 🚀 API监控面板组件
 * 参考 one-api 的监控界面，显示API调用统计和服务状态
 */

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Server, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Zap,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { oneApiManager } from '../services/oneApiManager';



interface ApiUsageRecord {
  id: string;
  provider: string;
  service: 'text' | 'image';
  timestamp: number;
  success: boolean;
  responseTime: number;
  errorMessage?: string;
}

/**
 * 获取真实API监控数据
 */
const getRealApiData = () => {
  try {
    // 从OneApiManager获取真实数据
    const stats = oneApiManager.getApiStats();
    const serviceStatus = oneApiManager.getServiceStatus();
    const usageHistory = oneApiManager.getUsageHistory(20);

    console.log('📊 获取真实API监控数据:', {
      statsCount: stats.length,
      serviceCount: serviceStatus.length,
      historyCount: usageHistory.length
    });

    return { stats, serviceStatus, usageHistory };
  } catch (error) {
    console.error('❌ 获取真实API数据失败，使用空数据:', error);
    
    // 如果无法获取真实数据，返回空数据而不是模拟数据
    return {
      stats: [],
      serviceStatus: [],
      usageHistory: []
    };
  }
};

/**
 * 生成占位数据（当没有真实调用记录时）
 */
const generatePlaceholderData = () => {
  const providers = ['openai', 'claude', 'gemini', 'hunyuan', 'deepseek', 'siliconflow'];
  
  return {
    stats: providers.map(provider => ({
      provider,
      totalCalls: 0,
      successCalls: 0,
      failedCalls: 0,
      avgResponseTime: 0,
      lastCallTime: 0,
      successRate: 0,
      totalTokens: 0,
      estimatedCost: 0
    })),
    serviceStatus: providers.map(provider => ({
      provider,
      status: 'disabled' as const,
      lastCheck: Date.now(),
      responseTime: 0,
      errorMessage: '暂无调用记录'
    })),
    usageHistory: []
  };
};

interface ApiMonitorPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiMonitorPanel: React.FC<ApiMonitorPanelProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState(() => {
    const realData = getRealApiData();
    return realData.stats.length > 0 ? realData : generatePlaceholderData();
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'status' | 'history'>('overview');

  useEffect(() => {
    if (isOpen) {
      // 立即获取最新数据
      const refreshData = () => {
        const realData = getRealApiData();
        setData(realData.stats.length > 0 ? realData : generatePlaceholderData());
      };
      
      refreshData(); // 立即刷新一次
      
      // 定期刷新真实数据
      const interval = setInterval(refreshData, 10000); // 10秒刷新一次（更频繁）

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const { stats, serviceStatus, usageHistory } = data;

  // 计算总览数据
  const totalCalls = stats.reduce((sum: number, s: any) => sum + s.totalCalls, 0);
  const totalSuccess = stats.reduce((sum: number, s: any) => sum + s.successCalls, 0);
  const totalFailed = stats.reduce((sum: number, s: any) => sum + s.failedCalls, 0);
  const avgResponseTime = stats.length > 0 ? stats.reduce((sum: number, s: any) => sum + s.avgResponseTime, 0) / stats.length : 0;
  const overallSuccessRate = totalSuccess / totalCalls;

  const activeServices = serviceStatus.filter(s => s.status === 'active').length;
  const errorServices = serviceStatus.filter(s => s.status === 'error').length;

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN');
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (hours > 0) return `${hours}小时前`;
    if (minutes > 0) return `${minutes}分钟前`;
    return '刚刚';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="w-8 h-8 text-white" />
              <div>
                <h2 className="text-2xl font-bold text-white">API监控中心</h2>
                <p className="text-blue-100">实时监控API调用状态和性能指标</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* 数据状态指示器 */}
              <div className="text-blue-200 text-sm">
                {stats.length > 0 ? `📊 ${stats.length}个服务` : '📭 暂无数据'}
              </div>
              
              {/* 生成测试数据按钮 */}
              <button
                onClick={() => {
                  // 生成一些测试调用数据
                  const providers = ['openai', 'claude', 'gemini', 'hunyuan', 'pollinations'];
                  providers.forEach(provider => {
                    // 模拟成功调用
                    for (let i = 0; i < Math.floor(Math.random() * 10) + 5; i++) {
                      oneApiManager.recordApiCall(
                        provider, 
                        Math.random() > 0.5 ? 'text' : 'image',
                        Math.random() > 0.1, // 90%成功率
                        Math.floor(Math.random() * 2000) + 500, // 500-2500ms响应时间
                        {
                          tokens: Math.floor(Math.random() * 1000) + 100,
                          cost: Math.random() * 0.05
                        }
                      );
                    }
                  });
                  
                  // 立即刷新数据
                  const realData = getRealApiData();
                  setData(realData.stats.length > 0 ? realData : generatePlaceholderData());
                  
                  console.log('🧪 已生成测试数据');
                }}
                className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors text-sm"
                title="生成测试数据"
              >
                🧪 测试数据
              </button>
              
              {/* 清除数据按钮 */}
              <button
                onClick={() => {
                  // 清除所有统计数据
                  oneApiManager.clearAllData();
                  
                  // 立即刷新数据
                  const realData = getRealApiData();
                  setData(realData.stats.length > 0 ? realData : generatePlaceholderData());
                  
                  console.log('🗑️ 已清除所有监控数据');
                }}
                className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors text-sm"
                title="清除所有数据"
              >
                🗑️ 清除
              </button>
              <button
                onClick={onClose}
                className="text-white hover:text-blue-200 p-2 rounded-lg hover:bg-blue-500/20 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* 导航标签 */}
        <div className="bg-slate-750 border-b border-slate-700">
          <div className="flex space-x-1 p-1">
            {[
              { id: 'overview', label: '总览', icon: BarChart3 },
              { id: 'stats', label: '统计', icon: TrendingUp },
              { id: 'status', label: '状态', icon: Server },
              { id: 'history', label: '历史', icon: Clock }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 关键指标卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Zap className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">总调用次数</p>
                      <p className="text-2xl font-bold text-white">{totalCalls.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">成功率</p>
                      <p className="text-2xl font-bold text-white">{(overallSuccessRate * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                      <Clock className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">平均响应时间</p>
                      <p className="text-2xl font-bold text-white">{Math.round(avgResponseTime)}ms</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Server className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">活跃服务</p>
                      <p className="text-2xl font-bold text-white">{activeServices}/{serviceStatus.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 服务商性能排行 */}
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">服务商性能排行</h3>
                <div className="space-y-3">
                  {stats.slice(0, 5).map((stat, index) => (
                    <div key={stat.provider} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-500 text-black' :
                          index === 1 ? 'bg-gray-400 text-black' :
                          index === 2 ? 'bg-orange-600 text-white' :
                          'bg-slate-600 text-white'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-white font-medium">{stat.provider}</p>
                          <p className="text-slate-400 text-sm">{stat.totalCalls} 次调用</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">{(stat.successRate * 100).toFixed(1)}%</p>
                        <p className="text-slate-400 text-sm">{Math.round(stat.avgResponseTime)}ms</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">服务商详细统计</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-600">
                        <th className="text-left text-slate-400 py-2">服务商</th>
                        <th className="text-right text-slate-400 py-2">总调用</th>
                        <th className="text-right text-slate-400 py-2">成功</th>
                        <th className="text-right text-slate-400 py-2">失败</th>
                        <th className="text-right text-slate-400 py-2">成功率</th>
                        <th className="text-right text-slate-400 py-2">平均响应</th>
                        <th className="text-right text-slate-400 py-2">最后调用</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.map((stat) => (
                        <tr key={stat.provider} className="border-b border-slate-700/50">
                          <td className="py-3 text-white font-medium">{stat.provider}</td>
                          <td className="py-3 text-right text-white">{stat.totalCalls}</td>
                          <td className="py-3 text-right text-green-400">{stat.successCalls}</td>
                          <td className="py-3 text-right text-red-400">{stat.failedCalls}</td>
                          <td className="py-3 text-right text-white">{(stat.successRate * 100).toFixed(1)}%</td>
                          <td className="py-3 text-right text-white">{Math.round(stat.avgResponseTime)}ms</td>
                          <td className="py-3 text-right text-slate-400">{formatTimeAgo(stat.lastCallTime)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'status' && (
            <div className="space-y-6">
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">服务状态监控</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {serviceStatus.map((status) => (
                    <div key={status.provider} className="bg-slate-700/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-medium">{status.provider}</h4>
                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                          status.status === 'active' 
                            ? 'bg-green-500/20 text-green-400' 
                            : status.status === 'testing'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {status.status === 'active' && <CheckCircle className="w-4 h-4" />}
                          {status.status === 'testing' && <RefreshCw className="w-4 h-4 animate-spin" />}
                          {status.status === 'error' && <AlertTriangle className="w-4 h-4" />}
                          <span>{
                            status.status === 'active' ? '正常' :
                            status.status === 'testing' ? '测试中' :
                            status.status === 'error' ? '错误' : '禁用'
                          }</span>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">响应时间</span>
                          <span className="text-white">{status.responseTime}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">最后检查</span>
                          <span className="text-white">{formatTimeAgo(status.lastCheck)}</span>
                        </div>
                        {status.errorMessage && (
                          <div className="text-red-400 text-xs">
                            错误: {status.errorMessage}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">调用历史记录</h3>
                <div className="space-y-2">
                  {usageHistory.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${record.success ? 'bg-green-400' : 'bg-red-400'}`} />
                        <div>
                          <span className="text-white font-medium">{record.provider}</span>
                          <span className="text-slate-400 ml-2">({record.service})</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-white">{record.responseTime}ms</span>
                        <span className="text-slate-400">{formatTime(record.timestamp)}</span>
                        {record.errorMessage && (
                          <span className="text-red-400 text-xs">错误</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 