import React, { useState, useEffect } from 'react';
import { X, Key, Save, Eye, EyeOff, CheckCircle, AlertCircle, ExternalLink, Info, ImageIcon } from 'lucide-react';
import { 
  setGeminiApiKey,
  getGeminiApiKey,
  clearGeminiApiKey,
  setJimengApiConfig,
  getJimengApiConfig,
  clearJimengApiConfig
} from '../services/apiKeyManager';
import { getRecommendedProviders } from '../services/jimengApiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * API密钥设置模态框组件
 * 支持Gemini和即梦API的配置管理
 */
export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  // 状态管理
  const [activeTab, setActiveTab] = useState<'gemini' | 'jimeng'>('gemini');
  
  // Gemini API 状态
  const [geminiApiKey, setGeminiApiKeyState] = useState('');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [geminiSaveStatus, setGeminiSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  
  // 即梦API 状态
  const [jimengProvider, setJimengProvider] = useState('dmxapi');
  const [jimengApiKey, setJimengApiKeyState] = useState('');
  const [showJimengKey, setShowJimengKey] = useState(false);
  const [jimengSaveStatus, setJimengSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const recommendedProviders = getRecommendedProviders();

  // 加载现有配置
  useEffect(() => {
    if (isOpen) {
      // 加载 Gemini API Key
      try {
        const savedGeminiKey = getGeminiApiKey();
        setGeminiApiKeyState(savedGeminiKey || '');
      } catch {
        setGeminiApiKeyState('');
      }
      
      // 加载即梦API配置
      const jimengConfig = getJimengApiConfig();
      if (jimengConfig) {
        setJimengProvider(jimengConfig.provider);
        setJimengApiKeyState(jimengConfig.apiKey);
      } else {
        setJimengProvider('dmxapi');
        setJimengApiKeyState('');
      }
    }
  }, [isOpen]);

  const handleGeminiSave = async () => {
    setGeminiSaveStatus('saving');
    try {
      if (geminiApiKey.trim()) {
        const success = setGeminiApiKey(geminiApiKey.trim());
        if (success) {
          setGeminiSaveStatus('success');
          setTimeout(() => setGeminiSaveStatus('idle'), 2000);
        } else {
          throw new Error('保存失败');
        }
      } else {
        throw new Error('API密钥不能为空');
      }
    } catch (error) {
      setGeminiSaveStatus('error');
      setTimeout(() => setGeminiSaveStatus('idle'), 3000);
    }
  };

  const handleJimengSave = async () => {
    setJimengSaveStatus('saving');
    try {
      if (jimengApiKey.trim()) {
        const success = setJimengApiConfig(jimengProvider, jimengApiKey.trim());
        if (success) {
          setJimengSaveStatus('success');
          setTimeout(() => setJimengSaveStatus('idle'), 2000);
        } else {
          throw new Error('保存失败');
        }
      } else {
        throw new Error('API密钥不能为空');
      }
    } catch (error) {
      setJimengSaveStatus('error');
      setTimeout(() => setJimengSaveStatus('idle'), 3000);
    }
  };

  const handleGeminiClear = () => {
    clearGeminiApiKey();
    setGeminiApiKeyState('');
    setGeminiSaveStatus('idle');
  };

  const handleJimengClear = () => {
    clearJimengApiConfig();
    setJimengApiKeyState('');
    setJimengSaveStatus('idle');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Key className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">API配置设置</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 标签切换 */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('gemini')}
              className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'gemini'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Key className="w-4 h-4" />
                <span>Gemini AI</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('jimeng')}
              className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'jimeng'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <ImageIcon className="w-4 h-4" />
                <span>即梦3.0</span>
              </div>
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Gemini API 配置 */}
          {activeTab === 'gemini' && (
            <div className="space-y-6">
              {/* 状态提示 */}
              {geminiSaveStatus === 'success' && (
                <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-800">Gemini API密钥保存成功！</span>
                </div>
              )}
              
              {geminiSaveStatus === 'error' && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-800">保存失败，请重试</span>
                </div>
              )}

              {/* Gemini API密钥 */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <label htmlFor="geminiKey" className="block text-sm font-medium text-gray-700">
                    Google Gemini API密钥 <span className="text-red-500">*</span>
                  </label>
                  <a
                    href="https://makersuite.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-xs ml-1">获取密钥</span>
                  </a>
                </div>
                <div className="relative">
                  <input
                    id="geminiKey"
                    type={showGeminiKey ? "text" : "password"}
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKeyState(e.target.value)}
                    placeholder="请输入你的Gemini API密钥 (以AIza开头)"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 ${
                      geminiSaveStatus === 'error' ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  用于驱动旅行内容生成、社交媒体文案和视频脚本创作功能。
                </p>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={handleGeminiClear}
                  className="px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                >
                  清除API密钥
                </button>
                
                <button
                  onClick={handleGeminiSave}
                  disabled={geminiSaveStatus === 'saving' || !geminiApiKey.trim()}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{geminiSaveStatus === 'saving' ? '保存中...' : '保存配置'}</span>
                </button>
              </div>
            </div>
          )}

          {/* 即梦API 配置 */}
          {activeTab === 'jimeng' && (
            <div className="space-y-6">
              {/* 状态提示 */}
              {jimengSaveStatus === 'success' && (
                <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-800">即梦API配置保存成功！</span>
                </div>
              )}
              
              {jimengSaveStatus === 'error' && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-800">保存失败，请重试</span>
                </div>
              )}

              {/* API提供商选择 */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  选择API提供商 <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  {recommendedProviders.map((provider) => (
                    <div
                      key={provider.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        jimengProvider === provider.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setJimengProvider(provider.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <input
                          type="radio"
                          name="provider"
                          checked={jimengProvider === provider.id}
                          onChange={() => setJimengProvider(provider.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">{provider.name}</h4>
                            <a
                              href={provider.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{provider.description}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {provider.pros.map((pro, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                              >
                                {pro}
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">{provider.apiKeyHelp}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* API密钥输入 */}
              <div className="space-y-2">
                <label htmlFor="jimengKey" className="block text-sm font-medium text-gray-700">
                  API密钥 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="jimengKey"
                    type={showJimengKey ? "text" : "password"}
                    value={jimengApiKey}
                    onChange={(e) => setJimengApiKeyState(e.target.value)}
                    placeholder="请输入API密钥"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 ${
                      jimengSaveStatus === 'error' ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowJimengKey(!showJimengKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showJimengKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  用于调用即梦3.0图像生成功能，支持高质量的AI图片创作。
                </p>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={handleJimengClear}
                  className="px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                >
                  清除API配置
                </button>
                
                <button
                  onClick={handleJimengSave}
                  disabled={jimengSaveStatus === 'saving' || !jimengApiKey.trim()}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{jimengSaveStatus === 'saving' ? '保存中...' : '保存配置'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 底部 */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Info className="w-4 h-4" />
            <span>所有API密钥仅存储在您的浏览器本地</span>
          </div>
          
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}; 