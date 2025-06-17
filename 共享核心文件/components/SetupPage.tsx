import React, { useState, useEffect } from 'react';
import { Settings, Key, CheckCircle, AlertTriangle, ExternalLink, ArrowRight, ArrowLeft, Sparkles, LogOut } from 'lucide-react';
import { hasGeminiApiKey, hasJimengApiKey, setGeminiApiKey, setJimengApiConfig, getGeminiApiKey, getJimengApiConfig } from '../services/apiKeyManager';

interface SetupPageProps {
  onComplete: () => void;
  onBack: () => void;
  onExit?: () => void;
}

/**
 * API配置页面组件
 * 指导用户配置必要的API密钥
 */
export const SetupPage: React.FC<SetupPageProps> = ({ onComplete, onBack, onExit }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [geminiKey, setGeminiKey] = useState('');
  const [jimengKey, setJimengKey] = useState('');
  const [geminiStatus, setGeminiStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [jimengStatus, setJimengStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 页面加载动画
    setTimeout(() => setIsVisible(true), 300);
    
    // 检查已有配置
    if (hasGeminiApiKey()) {
      setGeminiKey(getGeminiApiKey());
      setGeminiStatus('valid');
    }
    if (hasJimengApiKey()) {
      const config = getJimengApiConfig();
      if (config) {
        setJimengKey(config.apiKey);
        setJimengStatus('valid');
      }
    }
  }, []);

  const validateGeminiKey = (key: string) => {
    if (!key.trim()) {
      setGeminiStatus('idle');
      return;
    }
    
    setGeminiStatus('validating');
    
    // 简单验证Gemini密钥格式
    setTimeout(() => {
      if (key.startsWith('AIza') && key.length > 30) {
        setGeminiStatus('valid');
        setGeminiApiKey(key);
      } else {
        setGeminiStatus('invalid');
      }
    }, 1000);
  };

  const validateJimengKey = (key: string) => {
    if (!key.trim()) {
      setJimengStatus('idle');
      return;
    }
    
    setJimengStatus('validating');
    
    // 简单验证即梦密钥格式
    setTimeout(() => {
      if (key.length > 10) {
        setJimengStatus('valid');
        setJimengApiConfig('dmxapi', key); // 默认使用dmxapi提供商
      } else {
        setJimengStatus('invalid');
      }
    }, 1000);
  };

  const handleGeminiChange = (value: string) => {
    setGeminiKey(value);
    validateGeminiKey(value);
  };

  const handleJimengChange = (value: string) => {
    setJimengKey(value);
    validateJimengKey(value);
  };

  const canProceed = geminiStatus === 'valid';

  const handleComplete = () => {
    if (canProceed) {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 overflow-hidden">
      {/* 动态背景 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={`setup-particle-${i}`}
            className="absolute rounded-full bg-gradient-to-r from-cyan-400/20 to-blue-400/20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${1 + Math.random() * 4}px`,
              height: `${1 + Math.random() * 4}px`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${6 + Math.random() * 3}s`
            }}
          />
        ))}
        
        {/* 装饰图标 */}
        <div className="absolute top-20 right-20 opacity-10 animate-pulse">
          <Settings className="w-40 h-40 text-blue-400" />
        </div>
        <div className="absolute bottom-20 left-20 opacity-10 animate-spin-slow">
          <Key className="w-32 h-32 text-purple-400" />
        </div>
      </div>

      <div className={`relative z-10 flex flex-col min-h-screen p-8 transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'
      }`}>
        
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors duration-200 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>返回</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-white text-sm font-bold">2</span>
              </div>
              <span className="text-slate-300 font-medium">API 配置</span>
            </div>
            
            {/* 退出按钮 */}
            {onExit && (
              <button
                onClick={onExit}
                className="flex items-center space-x-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400/50 rounded-lg transition-all duration-200 group"
                title="退出应用"
              >
                <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                <span className="hidden sm:inline text-sm">退出</span>
              </button>
            )}
          </div>
        </div>

        {/* 主要内容 */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-4xl">
            
            {/* 标题区域 */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <Key className="w-10 h-10 text-blue-400" />
                <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
                <Settings className="w-10 h-10 text-cyan-400" />
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400">
                配置向导
              </h1>
              
              <p className="text-xl text-slate-300 mb-8">
                配置AI服务密钥，开启您的智能旅行体验
              </p>
            </div>

            {/* 配置卡片 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Gemini AI 配置 (必需) */}
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-xl rounded-2xl p-8 border border-slate-600/50 shadow-2xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <Key className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Gemini AI</h3>
                    <span className="text-red-400 text-sm font-medium">必需配置</span>
                  </div>
                </div>
                
                <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                  Gemini AI 提供文本生成和创意内容创作功能。这是应用的核心服务，必须配置才能使用。
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      API 密钥
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={geminiKey}
                        onChange={(e) => handleGeminiChange(e.target.value)}
                        placeholder="输入您的 Gemini API 密钥 (以 AIza 开头)"
                        className="w-full px-4 py-3 bg-slate-600/50 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {geminiStatus === 'validating' && (
                          <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                        )}
                        {geminiStatus === 'valid' && (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        )}
                        {geminiStatus === 'invalid' && (
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                    </div>
                    
                    {geminiStatus === 'invalid' && (
                      <p className="text-red-400 text-xs mt-2">
                        密钥格式不正确，请检查是否以 AIza 开头
                      </p>
                    )}
                    
                    {geminiStatus === 'valid' && (
                      <p className="text-green-400 text-xs mt-2 flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        密钥验证成功
                      </p>
                    )}
                  </div>

                  <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-400/30">
                    <h4 className="text-blue-300 font-medium mb-2 flex items-center">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      如何获取 API 密钥？
                    </h4>
                    <ol className="text-sm text-slate-300 space-y-1 list-decimal list-inside">
                      <li>访问 <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google AI Studio</a></li>
                      <li>使用Google账号登录</li>
                      <li>点击"Create API Key"创建密钥</li>
                      <li>复制密钥并粘贴到上方输入框</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* 即梦3.0 配置 (可选) */}
              <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-xl rounded-2xl p-8 border border-slate-600/30 shadow-2xl opacity-90">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">即梦3.0</h3>
                    <span className="text-slate-400 text-sm font-medium">可选配置</span>
                  </div>
                </div>
                
                <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                  即梦3.0 提供高质量的AI图像生成服务。不配置此项仍可使用基础功能。
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      API 密钥
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={jimengKey}
                        onChange={(e) => handleJimengChange(e.target.value)}
                        placeholder="输入您的即梦 API 密钥 (可选)"
                        className="w-full px-4 py-3 bg-slate-600/30 border border-slate-500/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {jimengStatus === 'validating' && (
                          <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                        )}
                        {jimengStatus === 'valid' && (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        )}
                        {jimengStatus === 'invalid' && (
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                    </div>
                    
                    {jimengStatus === 'valid' && (
                      <p className="text-green-400 text-xs mt-2 flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        密钥验证成功
                      </p>
                    )}
                  </div>

                  <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-400/30">
                    <h4 className="text-purple-300 font-medium mb-2">
                      💡 提示
                    </h4>
                    <p className="text-sm text-slate-300">
                      即梦API可以从多个服务商获取，推荐使用DMXAPI。如果暂时不配置，可以稍后在设置中添加。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 底部操作 */}
            <div className="flex justify-center mt-12">
              <button
                onClick={handleComplete}
                disabled={!canProceed}
                className={`group relative px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
                  canProceed
                    ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 text-white hover:scale-105 shadow-2xl hover:shadow-purple-500/25 focus:outline-none focus:ring-4 focus:ring-purple-500/50'
                    : 'bg-slate-600/50 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span className="flex items-center space-x-3">
                  <span>开始使用</span>
                  <ArrowRight className={`w-5 h-5 ${canProceed ? 'group-hover:translate-x-1' : ''} transition-transform`} />
                </span>
                
                {canProceed && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                )}
              </button>
            </div>

            {!canProceed && (
              <p className="text-center text-slate-400 text-sm mt-4">
                请至少配置 Gemini AI 密钥以继续
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 