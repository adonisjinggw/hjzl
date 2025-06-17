import React, { useState, useEffect } from 'react';
import { X, Settings, CheckCircle, AlertCircle, Info, TestTube, Save, Monitor, Palette, Globe, Key, Database } from 'lucide-react';
import type { ApiConfig, TextApiProvider, ImageApiProvider } from '../types';
import { TEXT_PROVIDER_MODELS, IMAGE_PROVIDER_MODELS } from '../types';

// 导入测试函数
import { testOpenAIConnection } from '../services/openaiService';
import { testClaudeConnection } from '../services/claudeService';
import { testTencentHunyuanConnection, testTencentHunyuanImageConnection } from '../services/tencentHunyuanService';
import { testDeepSeekConnection } from '../services/deepseekService';
import { testSiliconFlowConnection } from '../services/siliconflowService';
import { testOpenAIDalleConnection } from '../services/openaiDalleService';
import { testStabilityConnection } from '../services/stabilityService';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: ApiConfig;
  onSave: (config: ApiConfig) => void;
}

interface TestResults {
  [key: string]: 'success' | 'error' | 'testing';
}

/**
 * 获取服务商显示名称
 */
/**
 * 获取服务商的默认端点地址
 */
const getProviderDefaultEndpoint = (provider: string): string => {
  const defaultEndpoints: Record<string, string> = {
    // 文本生成服务
    'openai': 'https://api.openai.com/v1',
    'gemini': 'https://generativelanguage.googleapis.com/v1beta',
    'anthropic': 'https://api.anthropic.com/v1',
    'deepseek': 'https://api.deepseek.com/v1',
    'zhipu': 'https://open.bigmodel.cn/api/paas/v4',
    'moonshot': 'https://api.moonshot.cn/v1',
    'siliconflow': 'https://api.siliconflow.cn/v1',
    'groq': 'https://api.groq.com/openai/v1',
    'ollama': 'http://localhost:11434/v1',
    'one_api': 'https://your-oneapi-domain.com/v1',
    'hunyuan': 'https://api.hunyuan.cloud.tencent.com/v1',
    
    // 图像生成服务
    'openai_dalle': 'https://api.openai.com/v1',
    'stability': 'https://api.stability.ai/v1',
    'midjourney': 'https://api.midjourney.com/v1',
    'tencent_hunyuan': 'https://api.hunyuan.cloud.tencent.com/v1',
    'deepai': 'https://api.deepai.org/api',
    'replicate': 'https://api.replicate.com/v1',
    'runninghub': 'https://api.runninghub.ai/v1',
    'jiemeng': 'https://visual.volcengineapi.com',
    'pollinations': 'https://image.pollinations.ai',
    'huggingface': 'https://api-inference.huggingface.co'
  };
  
  return defaultEndpoints[provider] || 'https://api.example.com';
};

const getProviderDisplayName = (provider: TextApiProvider | ImageApiProvider): string => {
  const displayNames: Record<string, string> = {
    // 文本生成服务商
    'gemini': 'Google Gemini',
    'openai': 'OpenAI GPT',
    'claude': 'Anthropic Claude', 
    'deepseek': 'DeepSeek',
    'siliconflow': 'SiliconFlow',
    'azure_openai': 'Azure OpenAI',
    'wenxin': '百度文心一言',
    'tongyi': '阿里通义千问',
    'hunyuan': '腾讯混元',
    'doubao': '字节豆包',
    'qwen': '阿里千问',
    'yi': '零一万物',
    'moonshot': '月之暗面 Kimi',
    'zhipu': '智谱 GLM',
    'minimax': 'MiniMax',
    'baichuan': '百川智能',
    'builtin_free': '内置免费服务',
    
    // 图像生成服务商
    'openai_dalle': 'OpenAI DALL-E',
    'midjourney': 'Midjourney',
    'stability': 'Stability AI',
    'runninghub': 'RunningHub ComfyUI',
    'jiemeng': '火山引擎即梦',
    'wenxin_yige': '百度文心一格',
    'tongyi_wanxiang': '阿里通义万相',
    'doubao_image': '字节豆包图像',
    'zhipu_cogview': '智谱CogView',
    'tencent_hunyuan': '腾讯混元图像',
    'leonardo': 'Leonardo.Ai',
    'replicate': 'Replicate',
    'huggingface': 'HuggingFace',
    'pollinations': 'Pollinations AI',
    'deepai': 'DeepAI',
    'unsplash': 'Unsplash Photos',
    'picsum': 'Lorem Picsum'
  };
  
  return displayNames[provider] || provider;
};

// 完整的文本生成服务商列表（排除内置免费服务，因为它不需要配置）
const ALL_TEXT_PROVIDERS: TextApiProvider[] = [
  'openai', 'claude', 'gemini', 'hunyuan', 'deepseek', 'siliconflow', 
  'azure_openai', 'wenxin', 'tongyi', 'doubao', 'qwen', 'yi', 
  'moonshot', 'zhipu', 'minimax', 'baichuan'
];

// 完整的图像生成服务商列表（排除内置免费服务和兼容性服务商）
const ALL_IMAGE_PROVIDERS: ImageApiProvider[] = [
  'gemini', 'openai_dalle', 'midjourney', 'stability', 'runninghub', 'jiemeng',
  'wenxin_yige', 'tongyi_wanxiang', 'doubao_image', 'zhipu_cogview', 
  'tencent_hunyuan', 'leonardo', 'replicate', 'huggingface', 
  'pollinations', 'deepai', 'unsplash', 'picsum'
];

// 导航菜单项
const navigationItems = [
  {
    id: 'text',
    label: '文本生成',
    icon: Monitor,
    description: '配置文本生成API服务'
  },
  {
    id: 'image', 
    label: '图像生成',
    icon: Palette,
    description: '配置图像生成API服务'
  },
  {
    id: 'global',
    label: '全局设置',
    icon: Globe,
    description: '通用配置和高级选项'
  }
];

/**
 * 现代化API配置模态框组件
 * 采用左侧导航+右侧内容的布局设计
 */
export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onSave
}) => {
  const [localConfig, setLocalConfig] = useState<ApiConfig>(currentConfig);
  const [testResults, setTestResults] = useState<TestResults>({});
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'global'>('text');
  const [isConfigSaved, setIsConfigSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLocalConfig(currentConfig);
      setTestResults({});
      setIsConfigSaved(false);
    }
  }, [isOpen, currentConfig]);

  const handleSave = () => {
    console.log('🔧 保存API配置:', localConfig);
    onSave(localConfig);
    setIsConfigSaved(true);
    
    // 3秒后清除保存状态
    setTimeout(() => {
      setIsConfigSaved(false);
    }, 3000);
  };

  const handleConfirm = () => {
    // 如果有未保存的更改，先保存
    if (JSON.stringify(localConfig) !== JSON.stringify(currentConfig)) {
      handleSave();
    }
    onClose();
  };

  const handleCancel = () => {
    // 恢复到上次保存的配置
    setLocalConfig(currentConfig);
    onClose();
  };

  const handleReset = () => {
    const defaultConfig: ApiConfig = {
      textGeneration: {
        enablePaid: false,
        provider: 'gemini',
        apiKey: '',
        customEndpoint: '',
        model: 'gemini-1.5-pro-latest'
      },
      imageGeneration: {
        enablePaid: false,
        provider: 'openai_dalle',
        apiKey: '',
        customEndpoint: '',
        model: 'dall-e-3'
      },
      global: {
        preferPaidServices: true,
        fallbackToFree: true
      }
    };
    setLocalConfig(defaultConfig);
  };

  // 测试API连接
  const testApiConnection = async (provider: string, config: any) => {
    setTestResults(prev => ({ ...prev, [provider]: 'testing' }));
    
    try {
      let result: any = false;
      
      switch (provider) {
        case 'openai':
          result = await testOpenAIConnection(config.apiKey);
          break;
        case 'claude':
          result = await testClaudeConnection(config.apiKey);
          break;
        case 'hunyuan':
          result = await testTencentHunyuanConnection();
          break;
        case 'deepseek':
          result = await testDeepSeekConnection(config.apiKey, config.model);
          break;
        case 'siliconflow':
          result = await testSiliconFlowConnection(config.apiKey, config.model);
          break;
        case 'openai_dalle':
          result = await testOpenAIDalleConnection(config.apiKey);
          break;
        case 'stability':
          result = await testStabilityConnection(config.apiKey);
          break;
        case 'tencent_hunyuan':
          result = await testTencentHunyuanImageConnection();
          break;
        default:
          result = false;
      }
      
      // 处理不同的返回类型
      const success = typeof result === 'boolean' ? result : (result?.success || false);
      
      setTestResults(prev => ({ 
        ...prev, 
        [provider]: success ? 'success' : 'error' 
      }));
    } catch (error) {
      console.error(`测试${provider}连接失败:`, error);
      setTestResults(prev => ({ ...prev, [provider]: 'error' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-[90vw] h-[85vh] max-w-6xl flex overflow-hidden">
        
        {/* 左侧导航 */}
        <div className="w-64 bg-slate-900/50 border-r border-slate-700/50 flex flex-col">
          {/* 标题区域 */}
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center space-x-3">
              <Settings className="w-6 h-6 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">API 服务配置</h2>
            </div>
            {isConfigSaved && (
              <div className="mt-3 flex items-center space-x-2 px-3 py-2 bg-green-900/30 border border-green-600/50 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-300">配置已保存</span>
              </div>
            )}
          </div>

          {/* 导航菜单 */}
          <div className="flex-1 p-4">
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'bg-blue-600/20 border border-blue-500/30 text-blue-300' 
                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{item.description}</div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* 底部操作按钮 */}
          <div className="p-4 space-y-3 border-t border-slate-700/50">
            <button
              onClick={handleSave}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                isConfigSaved 
                  ? 'bg-green-600 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isConfigSaved ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>已保存</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>保存配置</span>
                </>
              )}
            </button>
            
            <div className="flex space-x-2">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>

        {/* 右侧内容区域 */}
        <div className="flex-1 flex flex-col">
          {/* 关闭按钮 */}
          <div className="flex justify-end p-4">
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* 内容区域 */}
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {activeTab === 'text' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">文本生成服务配置</h3>
                  <p className="text-slate-400">配置AI文本生成服务，支持多种主流服务商</p>
                </div>

                {/* 启用付费服务 */}
                <div className="bg-slate-700/30 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-white">启用付费服务</h4>
                      <p className="text-sm text-slate-400 mt-1">开启后将使用您配置的API密钥调用付费服务</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localConfig.textGeneration.enablePaid}
                        onChange={(e) => setLocalConfig(prev => ({
                          ...prev,
                          textGeneration: {
                            ...prev.textGeneration,
                            enablePaid: e.target.checked
                          }
                        }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                {localConfig.textGeneration.enablePaid && (
                  <>
                    {/* 服务商选择 */}
                    <div className="bg-slate-700/30 rounded-lg p-6">
                      <h4 className="text-lg font-medium text-white mb-4">选择服务商</h4>
                      <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                        {ALL_TEXT_PROVIDERS.map((provider) => (
                          <label key={provider} className="flex items-center space-x-3 p-3 bg-slate-600/30 rounded-lg cursor-pointer hover:bg-slate-600/50 transition-colors">
                            <input
                              type="radio"
                              name="textProvider"
                              value={provider}
                              checked={localConfig.textGeneration.provider === provider}
                              onChange={(e) => setLocalConfig(prev => ({
                                ...prev,
                                textGeneration: {
                                  ...prev.textGeneration,
                                  provider: e.target.value as TextApiProvider
                                }
                              }))}
                              className="text-blue-600"
                            />
                            <span className="text-white text-sm">{getProviderDisplayName(provider)}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* API配置 */}
                    <div className="bg-slate-700/30 rounded-lg p-6 space-y-4">
                      <h4 className="text-lg font-medium text-white">API 配置</h4>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          API 密钥
                        </label>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="password"
                            value={localConfig.textGeneration.apiKey || ''}
                            onChange={(e) => setLocalConfig(prev => ({
                              ...prev,
                              textGeneration: {
                                ...prev.textGeneration,
                                apiKey: e.target.value
                              }
                            }))}
                            className="w-full pl-10 pr-4 py-3 bg-slate-600/50 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="请输入API密钥"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          自定义端点 (可选)
                        </label>
                        <input
                          type="url"
                          value={localConfig.textGeneration.customEndpoint || ''}
                          onChange={(e) => setLocalConfig(prev => ({
                            ...prev,
                            textGeneration: {
                              ...prev.textGeneration,
                              customEndpoint: e.target.value
                            }
                          }))}
                          className="w-full px-4 py-3 bg-slate-600/50 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={getProviderDefaultEndpoint(localConfig.imageGeneration.provider)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          模型选择
                        </label>
                        <select
                          value={localConfig.textGeneration.model || ''}
                          onChange={(e) => setLocalConfig(prev => ({
                            ...prev,
                            textGeneration: {
                              ...prev.textGeneration,
                              model: e.target.value
                            }
                          }))}
                          className="w-full px-4 py-3 bg-slate-600/50 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {TEXT_PROVIDER_MODELS[localConfig.textGeneration.provider]?.map((model) => (
                            <option key={model.value} value={model.value}>
                              {model.name} {model.description && `- ${model.description}`}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 测试连接 */}
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => testApiConnection(localConfig.textGeneration.provider, localConfig.textGeneration)}
                          disabled={!localConfig.textGeneration.apiKey || testResults[localConfig.textGeneration.provider] === 'testing'}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                        >
                          <TestTube className="w-4 h-4" />
                          <span>
                            {testResults[localConfig.textGeneration.provider] === 'testing' ? '测试中...' : '测试连接'}
                          </span>
                        </button>
                        
                        {testResults[localConfig.textGeneration.provider] && (
                          <div className={`flex items-center space-x-2 ${
                            testResults[localConfig.textGeneration.provider] === 'success' 
                              ? 'text-green-400' 
                              : 'text-red-400'
                          }`}>
                            {testResults[localConfig.textGeneration.provider] === 'success' ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <AlertCircle className="w-4 h-4" />
                            )}
                            <span className="text-sm">
                              {testResults[localConfig.textGeneration.provider] === 'success' ? '连接成功' : '连接失败'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'image' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">图像生成服务配置</h3>
                  <p className="text-slate-400">配置AI图像生成服务，支持多种主流服务商</p>
                </div>

                {/* 启用付费服务 */}
                <div className="bg-slate-700/30 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-white">启用付费服务</h4>
                      <p className="text-sm text-slate-400 mt-1">开启后将使用您配置的API密钥调用付费服务</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localConfig.imageGeneration.enablePaid}
                        onChange={(e) => setLocalConfig(prev => ({
                          ...prev,
                          imageGeneration: {
                            ...prev.imageGeneration,
                            enablePaid: e.target.checked
                          }
                        }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                {localConfig.imageGeneration.enablePaid && (
                  <>
                    {/* 服务商选择 */}
                    <div className="bg-slate-700/30 rounded-lg p-6">
                      <h4 className="text-lg font-medium text-white mb-4">选择服务商</h4>
                      <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                        {ALL_IMAGE_PROVIDERS.map((provider) => (
                          <label key={provider} className="flex items-center space-x-3 p-3 bg-slate-600/30 rounded-lg cursor-pointer hover:bg-slate-600/50 transition-colors">
                            <input
                              type="radio"
                              name="imageProvider"
                              value={provider}
                              checked={localConfig.imageGeneration.provider === provider}
                              onChange={(e) => setLocalConfig(prev => ({
                                ...prev,
                                imageGeneration: {
                                  ...prev.imageGeneration,
                                  provider: e.target.value as ImageApiProvider
                                }
                              }))}
                              className="text-blue-600"
                            />
                            <span className="text-white text-sm">{getProviderDisplayName(provider)}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* API配置 */}
                    <div className="bg-slate-700/30 rounded-lg p-6 space-y-4">
                      <h4 className="text-lg font-medium text-white">API 配置</h4>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          API 密钥
                        </label>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="password"
                            value={localConfig.imageGeneration.apiKey || ''}
                            onChange={(e) => setLocalConfig(prev => ({
                              ...prev,
                              imageGeneration: {
                                ...prev.imageGeneration,
                                apiKey: e.target.value
                              }
                            }))}
                            className="w-full pl-10 pr-4 py-3 bg-slate-600/50 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="请输入API密钥"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          自定义端点 (可选)
                        </label>
                        <input
                          type="url"
                          value={localConfig.imageGeneration.customEndpoint || ''}
                          onChange={(e) => setLocalConfig(prev => ({
                            ...prev,
                            imageGeneration: {
                              ...prev.imageGeneration,
                              customEndpoint: e.target.value
                            }
                          }))}
                          className="w-full px-4 py-3 bg-slate-600/50 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={getProviderDefaultEndpoint(localConfig.imageGeneration.provider)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          模型选择
                        </label>
                        <select
                          value={localConfig.imageGeneration.model || ''}
                          onChange={(e) => setLocalConfig(prev => ({
                            ...prev,
                            imageGeneration: {
                              ...prev.imageGeneration,
                              model: e.target.value
                            }
                          }))}
                          className="w-full px-4 py-3 bg-slate-600/50 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {IMAGE_PROVIDER_MODELS[localConfig.imageGeneration.provider]?.map((model) => (
                            <option key={model.value} value={model.value}>
                              {model.name} {model.description && `- ${model.description}`}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 测试连接 */}
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => testApiConnection(localConfig.imageGeneration.provider, localConfig.imageGeneration)}
                          disabled={!localConfig.imageGeneration.apiKey || testResults[localConfig.imageGeneration.provider] === 'testing'}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                        >
                          <TestTube className="w-4 h-4" />
                          <span>
                            {testResults[localConfig.imageGeneration.provider] === 'testing' ? '测试中...' : '测试连接'}
                          </span>
                        </button>
                        
                        {testResults[localConfig.imageGeneration.provider] && (
                          <div className={`flex flex-col space-y-2 ${
                            testResults[localConfig.imageGeneration.provider] === 'success' 
                              ? 'text-green-400' 
                              : 'text-red-400'
                          }`}>
                            <div className="flex items-center space-x-2">
                              {testResults[localConfig.imageGeneration.provider] === 'success' ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <AlertCircle className="w-4 h-4" />
                              )}
                              <span className="text-sm">
                                {testResults[localConfig.imageGeneration.provider] === 'success' ? '连接成功' : '连接失败'}
                              </span>
                            </div>
                            
                            {/* 连接成功时显示鼓励信息 */}
                            {testResults[localConfig.imageGeneration.provider] === 'success' && (
                              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-sm">
                                <p className="text-green-300 flex items-center space-x-2">
                                  <span>🎉</span>
                                  <span className="font-medium">配置成功！</span>
                                </p>
                                <p className="text-green-200 text-xs mt-1">
                                  {localConfig.imageGeneration.provider === 'tencent_hunyuan' 
                                    ? '腾讯混元API连接正常，您现在可以享受高质量的AI图像生成服务！' 
                                    : 'API连接正常，您现在可以使用付费服务进行高质量内容生成！'}
                                </p>
                              </div>
                            )}
                            
                            {/* 连接失败时显示智能修复建议 */}
                            {testResults[localConfig.imageGeneration.provider] === 'error' && (
                              <div className="bg-slate-600/30 rounded-lg p-3 text-sm">
                                <p className="text-slate-300 mb-2 flex items-center space-x-2">
                                  <span>🔧</span>
                                  <span className="font-medium">智能诊断与修复</span>
                                </p>
                                
                                {/* 腾讯混元专用建议 */}
                                {localConfig.imageGeneration.provider === 'tencent_hunyuan' && (
                                  <div className="bg-blue-500/10 border border-blue-500/20 rounded p-2 mb-3">
                                    <p className="text-blue-300 text-xs font-medium mb-1">🌈 腾讯混元图像生成说明：</p>
                                    <ul className="text-blue-200 space-y-1 text-xs">
                                      <li>• 图像生成支持OpenAI兼容格式（与文生文不同）</li>
                                      <li>• API密钥格式通常以 sk- 开头</li>
                                      <li>• 确认账户已开通图像生成服务</li>
                                      <li>• 如连接失败，建议使用Pollinations AI（免费）</li>
                                    </ul>
                                  </div>
                                )}
                                
                                <ul className="text-slate-400 space-y-1 text-xs mb-3">
                                  <li>• 检查API密钥是否正确（不应包含额外空格）</li>
                                  <li>• 确认API密钥有图像生成权限和余额</li>
                                  <li>• 验证自定义端点地址（点击下方"修复端点"）</li>
                                  <li>• 尝试切换到其他模型或重新获取API密钥</li>
                                </ul>
                                
                                                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => {
                                        const defaultEndpoint = getProviderDefaultEndpoint(localConfig.imageGeneration.provider);
                                        if (defaultEndpoint !== 'https://api.example.com') {
                                          setLocalConfig(prev => ({
                                            ...prev,
                                            imageGeneration: {
                                              ...prev.imageGeneration,
                                              customEndpoint: defaultEndpoint
                                            }
                                          }));
                                        }
                                      }}
                                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                                    >
                                      🔧 修复端点
                                    </button>
                                    
                                    <button
                                      onClick={() => testApiConnection(localConfig.imageGeneration.provider, localConfig.imageGeneration)}
                                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                                    >
                                      🔄 重新测试
                                    </button>
                                    
                                    {localConfig.imageGeneration.provider === 'tencent_hunyuan' ? (
                                      <a
                                        href="https://cloud.tencent.com/document/product/1729/110428"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors"
                                      >
                                        📚 官方文档
                                      </a>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          // 推荐用户使用Pollinations.AI作为替代
                                          setLocalConfig(prev => ({
                                            ...prev,
                                            imageGeneration: {
                                              ...prev.imageGeneration,
                                              provider: 'pollinations',
                                              enablePaid: false
                                            }
                                          }));
                                        }}
                                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                                      >
                                        🆓 使用免费服务
                                      </button>
                                    )}
                                  </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'global' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">全局设置</h3>
                  <p className="text-slate-400">通用配置和高级选项</p>
                </div>

                {/* 服务策略设置 */}
                <div className="bg-slate-700/30 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-white mb-4">服务策略</h4>
                  <div className="space-y-4">
                    {/* 优先使用付费服务 */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-base font-medium text-white">优先使用付费服务</h5>
                        <p className="text-sm text-slate-400 mt-1">当同时配置了多个服务时，优先选择付费服务</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localConfig.global.preferPaidServices}
                          onChange={(e) => setLocalConfig(prev => ({
                            ...prev,
                            global: {
                              ...prev.global,
                              preferPaidServices: e.target.checked
                            }
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* 自动降级到免费服务 */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-base font-medium text-white">自动降级到免费服务</h5>
                        <p className="text-sm text-slate-400 mt-1">当付费服务不可用时，系统会自动降级到免费服务</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localConfig.global.fallbackToFree}
                          onChange={(e) => setLocalConfig(prev => ({
                            ...prev,
                            global: {
                              ...prev.global,
                              fallbackToFree: e.target.checked
                            }
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* 降级策略说明 */}
                    <div className="mt-4 p-4 bg-slate-600/30 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-slate-300">
                          <p className="font-medium mb-2">降级策略说明：</p>
                          <ul className="space-y-1 text-slate-400">
                            <li>• 开启降级：付费API失败时自动使用免费服务，确保功能可用</li>
                            <li>• 关闭降级：付费API失败时直接报错，不使用免费服务</li>
                            <li>• 建议保持开启，以获得更好的用户体验</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-white mb-4">数据管理</h4>
                  <div className="space-y-4">
                    <button
                      onClick={handleReset}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      <Database className="w-4 h-4" />
                      <span>重置为默认配置</span>
                    </button>
                    <p className="text-sm text-slate-400">
                      这将清除所有API配置并恢复到默认设置
                    </p>
                  </div>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-white mb-4">使用说明</h4>
                  <div className="space-y-3 text-sm text-slate-300">
                    <div className="flex items-start space-x-3">
                      <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">API密钥安全</p>
                        <p className="text-slate-400">您的API密钥仅存储在本地浏览器中，不会上传到服务器</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">服务降级</p>
                        <p className="text-slate-400">可在上方手动控制是否启用自动降级功能</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">配置保存</p>
                        <p className="text-slate-400">点击"保存配置"后设置立即生效，无需重启应用</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 