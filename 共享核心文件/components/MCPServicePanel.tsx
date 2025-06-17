/**
 * MCP服务管理面板
 * 提供用户友好的MCP服务交互界面
 */

import React, { useState, useEffect } from 'react';
import { mcpManager, MCPServiceConfig, MCPToolResult } from '../services/mcpManager';

interface MCPServicePanelProps {
  onClose: () => void;
  onServiceCall?: (result: MCPToolResult) => void;
}

const MCPServicePanel: React.FC<MCPServicePanelProps> = ({ onClose, onServiceCall }) => {
  const [services, setServices] = useState<MCPServiceConfig[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [toolParameters, setToolParameters] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<MCPToolResult | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadServices();
    loadStats();
  }, []);

  const loadServices = () => {
    const availableServices = mcpManager.getAvailableServices();
    setServices(availableServices);
    if (availableServices.length > 0 && !selectedService) {
      setSelectedService(availableServices[0].id);
    }
  };

  const loadStats = () => {
    const serviceStats = mcpManager.getServiceStats();
    setStats(serviceStats);
  };

  const getCurrentService = (): MCPServiceConfig | null => {
    return services.find(s => s.id === selectedService) || null;
  };

  const getAvailableTools = (): string[] => {
    const service = getCurrentService();
    return service?.capabilities.tools || [];
  };

  const handleServiceChange = (serviceId: string) => {
    setSelectedService(serviceId);
    setSelectedTool('');
    setToolParameters({});
  };

  const handleToolChange = (toolName: string) => {
    setSelectedTool(toolName);
    setToolParameters({});
  };

  const handleParameterChange = (paramName: string, value: any) => {
    setToolParameters(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const handleCallTool = async () => {
    if (!selectedService || !selectedTool) {
      return;
    }

    setLoading(true);
    try {
      const result = await mcpManager.callTool(selectedService, selectedTool, toolParameters);
      setLastResult(result);
      onServiceCall?.(result);
    } catch (error) {
      const errorResult: MCPToolResult = {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
      setLastResult(errorResult);
      onServiceCall?.(errorResult);
    } finally {
      setLoading(false);
    }
  };

  const renderParameterInput = (paramName: string) => {
    const value = toolParameters[paramName] || '';
    
    return (
      <div key={paramName} className="mb-3">
        <label className="block text-sm font-medium text-purple-300 mb-1 capitalize">
          {paramName.replace(/([A-Z])/g, ' $1').toLowerCase()}
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => handleParameterChange(paramName, e.target.value)}
          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
          placeholder={`输入 ${paramName}`}
        />
      </div>
    );
  };

  const getParametersForTool = (toolName: string): string[] => {
    // 根据工具名称返回所需参数
    const parameterMap: Record<string, string[]> = {
      'getLocation': ['query'],
      'searchPOI': ['location', 'category'],
      'getRoute': ['from', 'to'],
      'getWeather': ['location'],
      'enhanceImage': ['imageUrl', 'enhancement'],
      'styleTransfer': ['imageUrl', 'stylePreset'],
      'upscaleImage': ['imageUrl', 'scale'],
      'generateVariations': ['imageUrl', 'count'],
      'getCurrentWeather': ['location'],
      'getForecast': ['location', 'days'],
      'getAirQuality': ['location'],
      'searchKnowledge': ['query'],
      'getRecommendations': ['location', 'interests'],
      'getCulturalInfo': ['location']
    };
    
    return parameterMap[toolName] || [];
  };

  const renderServiceIcon = (serviceId: string): string => {
    const iconMap: Record<string, string> = {
      'map-service': '🗺️',
      'jimeng-enhanced': '🎨',
      'weather-service': '🌤️',
      'knowledge-base': '📚'
    };
    return iconMap[serviceId] || '🔧';
  };

  const renderToolIcon = (toolName: string): string => {
    const iconMap: Record<string, string> = {
      'getLocation': '📍',
      'searchPOI': '🔍',
      'getRoute': '🛣️',
      'getWeather': '🌡️',
      'enhanceImage': '✨',
      'styleTransfer': '🎭',
      'upscaleImage': '🔍',
      'generateVariations': '🎲',
      'getCurrentWeather': '☀️',
      'getForecast': '📅',
      'getAirQuality': '💨',
      'searchKnowledge': '📖',
      'getRecommendations': '💡',
      'getCulturalInfo': '🏛️'
    };
    return iconMap[toolName] || '⚙️';
  };

  const renderQuickExamples = () => {
    const examples = [
      { service: 'map-service', tool: 'getLocation', params: { query: '北京天安门' }, label: '查询北京天安门位置' },
      { service: 'weather-service', tool: 'getCurrentWeather', params: { location: '上海' }, label: '获取上海天气' },
      { service: 'jimeng-enhanced', tool: 'enhanceImage', params: { imageUrl: 'example.jpg', enhancement: 'brightness' }, label: '图像增强示例' }
    ];

    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-300 mb-2">快捷示例:</h4>
        <div className="flex flex-wrap gap-2">
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedService(example.service);
                setSelectedTool(example.tool);
                setToolParameters(example.params);
              }}
              className="px-3 py-1 text-xs bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/50 rounded-full text-blue-300 transition-colors duration-200"
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 backdrop-blur-sm border border-purple-500/30 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-auto">
        {/* 头部 */}
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-purple-500/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
                🤖 MCP服务中心
                <span className="ml-2 text-sm font-normal text-purple-300">
                  (Model Context Protocol)
                </span>
              </h2>
              
              {stats && (
                <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                  <span>📦 {stats.enabledServices} 个服务</span>
                  <span>🔧 {stats.totalTools} 个工具</span>
                  <span>📋 {stats.totalResources} 个资源</span>
                  <span>💬 {stats.totalPrompts} 个提示</span>
                </div>
              )}
            </div>
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors duration-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* 主要内容 */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左侧：服务选择和工具配置 */}
            <div className="space-y-4">
              {/* 服务选择 */}
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  选择MCP服务
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="">请选择服务...</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {renderServiceIcon(service.id)} {service.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 工具选择 */}
              {selectedService && (
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    选择工具
                  </label>
                  <select
                    value={selectedTool}
                    onChange={(e) => handleToolChange(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">请选择工具...</option>
                    {getAvailableTools().map(tool => (
                      <option key={tool} value={tool}>
                        {renderToolIcon(tool)} {tool}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 参数配置 */}
              {selectedTool && (
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    工具参数
                  </label>
                  <div className="space-y-2">
                    {getParametersForTool(selectedTool).map(param => renderParameterInput(param))}
                  </div>
                </div>
              )}

              {/* 执行按钮 */}
              {selectedService && selectedTool && (
                <button
                  onClick={handleCallTool}
                  disabled={loading}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    loading
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      执行中...
                    </div>
                  ) : (
                    `执行 ${selectedTool}`
                  )}
                </button>
              )}

              {/* 快捷示例 */}
              {renderQuickExamples()}
            </div>

            {/* 右侧：执行结果 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  执行结果
                </label>
                <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4 min-h-[400px]">
                  {loading && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
                        <p className="text-gray-400">正在执行工具...</p>
                      </div>
                    </div>
                  )}

                  {lastResult && !loading && (
                    <div>
                      <div className={`flex items-center mb-3 ${lastResult.success ? 'text-green-400' : 'text-red-400'}`}>
                        <span className="mr-2">{lastResult.success ? '✅' : '❌'}</span>
                        <span className="font-medium">
                          {lastResult.success ? '执行成功' : '执行失败'}
                        </span>
                      </div>

                      {lastResult.error && (
                        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 mb-3">
                          <p className="text-red-300">{lastResult.error}</p>
                        </div>
                      )}

                      {lastResult.data && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-300 mb-2">返回数据:</h4>
                          <pre className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-sm text-gray-300 overflow-auto">
                            {JSON.stringify(lastResult.data, null, 2)}
                          </pre>
                        </div>
                      )}

                      {lastResult.metadata && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-gray-300 mb-2">元数据:</h4>
                          <div className="text-xs text-gray-400 space-y-1">
                            <p>执行时间: {lastResult.metadata.timestamp}</p>
                            <p>执行耗时: {lastResult.metadata.executionTime}ms</p>
                            {lastResult.metadata.requestId && (
                              <p>请求ID: {lastResult.metadata.requestId}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {!lastResult && !loading && (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>选择服务和工具后，点击执行按钮查看结果</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCPServicePanel; 