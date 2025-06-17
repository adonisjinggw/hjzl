import React, { useState, useEffect } from 'react';
import { Settings, Shield, CheckCircle, AlertCircle, Key, Map, Activity } from 'lucide-react';
import { hasGeminiApiKey, hasJimengApiKey } from '../services/apiKeyManager';

interface HeaderProps {
  onOpenSettings?: () => void;
  onApiKeysChange?: () => void;
  onOpenFreeApi?: () => void;
  onOpenApiConfig?: () => void;
  onOpenApiMonitor?: () => void;
  onOpenMapGuide?: () => void;
  onOpenFreeApiHelper?: () => void;
}

/**
 * 应用头部组件
 * 显示品牌信息和主要导航
 */
export const Header: React.FC<HeaderProps> = ({ 
  onOpenSettings,
  onApiKeysChange,
  onOpenFreeApi,
  onOpenApiConfig,
  onOpenApiMonitor,
  onOpenMapGuide,
  onOpenFreeApiHelper
}) => {
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [hasJimengKey, setHasJimengKey] = useState(false);
  const [showApiKeyStatus, setShowApiKeyStatus] = useState(false);

  // 检查API密钥状态
  useEffect(() => {
    const updateApiStatus = () => {
      setHasGeminiKey(hasGeminiApiKey());
      setHasJimengKey(hasJimengApiKey());
    };

    updateApiStatus();
    
    // 监听存储变化
    const handleStorageChange = () => updateApiStatus();
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // API状态指示器
  const getApiStatusIndicator = () => {
    const status = [];
    
    if (hasGeminiKey) {
      status.push(
        <div key="gemini" className="flex items-center space-x-1 text-green-400">
          <CheckCircle className="w-3 h-3" />
          <span className="text-xs">Gemini</span>
        </div>
      );
    } else {
      status.push(
        <div key="gemini-missing" className="flex items-center space-x-1 text-amber-400">
          <AlertCircle className="w-3 h-3" />
          <span className="text-xs">Gemini</span>
        </div>
      );
    }
    
    if (hasJimengKey) {
      status.push(
        <div key="jimeng" className="flex items-center space-x-1 text-green-400">
          <CheckCircle className="w-3 h-3" />
          <span className="text-xs">即梦</span>
        </div>
      );
    }

    return status.length > 0 ? (
      <div className="flex flex-col space-y-1">
        {status}
      </div>
    ) : (
      <div className="flex items-center space-x-1 text-red-400">
        <AlertCircle className="w-3 h-3" />
        <span className="text-xs">无API</span>
      </div>
    );
  };

  return (
    <header className="relative z-50 border-b border-slate-600/50 backdrop-blur-xl bg-slate-900/70">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          
          {/* 品牌Logo和标题 */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-600 to-cyan-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">🌟</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                幻境之旅生成器
              </h1>
              <p className="text-xs text-slate-400">AI驱动的智能旅行体验</p>
            </div>
          </div>

          {/* 导航按钮 */}
          <div className="flex items-center space-x-2">
            
            {/* API配置按钮 */}
            {onOpenApiConfig && (
              <button
                onClick={onOpenApiConfig}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                title="配置API服务"
              >
                <Key className="w-4 h-4" />
                <span className="hidden md:inline text-sm">API配置</span>
              </button>
            )}

            {/* API监控按钮 */}
            {onOpenApiMonitor && (
              <button
                onClick={onOpenApiMonitor}
                className="flex items-center space-x-2 px-3 py-2 bg-cyan-600/80 hover:bg-cyan-600 text-white rounded-lg transition-colors duration-200"
                title="API监控面板"
              >
                <Activity className="w-4 h-4" />
                <span className="hidden md:inline text-sm">API监控</span>
              </button>
            )}
            
            {/* 地图指南按钮 */}
            {onOpenMapGuide && (
              <button
                onClick={onOpenMapGuide}
                className="flex items-center space-x-2 px-3 py-2 bg-purple-600/80 hover:bg-purple-600 text-white rounded-lg transition-colors duration-200"
                title="查看地图功能指南"
              >
                <Map className="w-4 h-4" />
                <span className="hidden md:inline text-sm">地图指南</span>
              </button>
            )}
            
            {/* 免费API获取助手按钮 */}
            {onOpenFreeApiHelper && (
              <button
                onClick={onOpenFreeApiHelper}
                className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-lg transition-all duration-200 shadow-lg"
                title="免费API密钥获取助手"
              >
                <span className="text-sm">🔑</span>
                <span className="hidden md:inline text-sm font-medium">获取API</span>
              </button>
            )}
            
            {/* 免费API配置按钮 */}
            {onOpenFreeApi && (
              <button
                onClick={onOpenFreeApi}
                className="flex items-center space-x-2 px-3 py-2 bg-green-600/80 hover:bg-green-600 text-white rounded-lg transition-colors duration-200"
                title="配置免费AI服务"
              >
                <span className="text-sm">🆓</span>
                <span className="hidden md:inline text-sm">免费服务</span>
              </button>
            )}
            
            {/* API状态指示器 */}
            <button
              onClick={() => setShowApiKeyStatus(!showApiKeyStatus)}
              className="flex items-center space-x-2 px-3 py-2 bg-slate-700/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors duration-200"
              title="查看API状态"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden md:inline text-sm">API状态</span>
            </button>

            {/* 设置按钮 */}
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="flex items-center space-x-2 px-3 py-2 bg-slate-700/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors duration-200"
                title="应用设置"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden md:inline text-sm">设置</span>
              </button>
            )}
          </div>
        </div>

        {/* API状态展开面板 */}
        {showApiKeyStatus && (
          <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-slate-600/50">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-white mb-2">API服务状态</h3>
              <button
                onClick={() => setShowApiKeyStatus(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              {getApiStatusIndicator()}
              <div className="text-xs text-slate-400 mt-2">
                {hasGeminiKey || hasJimengKey ? 
                  '✅ 您已配置API密钥，可以使用完整功能' : 
                  '⚠️ 建议配置API密钥以获得最佳体验，或使用免费服务'
                }
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
