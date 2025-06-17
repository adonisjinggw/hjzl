import React, { useState } from 'react';
import { ExternalLink, Copy, CheckCircle, AlertCircle, Key, Gift } from 'lucide-react';

interface ApiProvider {
  id: string;
  name: string;
  description: string;
  freeQuota: string;
  signupUrl: string;
  apiUrl: string;
  features: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'text' | 'image' | 'both';
}

interface FreeApiKeyHelperProps {
  isOpen: boolean;
  onClose: () => void;
  onApiKeyObtained?: (provider: string, apiKey: string) => void;
}

/**
 * 免费API密钥获取助手组件
 * 帮助用户轻松获取各种免费AI服务的API密钥
 */
export const FreeApiKeyHelper: React.FC<FreeApiKeyHelperProps> = ({ 
  isOpen, 
  onClose, 
  onApiKeyObtained 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'text' | 'image' | 'both'>('all');
  const [copiedUrl, setCopiedUrl] = useState<string>('');

  // 推荐的免费API服务提供商
  const apiProviders: ApiProvider[] = [
    {
      id: 'pollinations',
      name: 'Pollinations.AI',
      description: '完全免费的图像生成API，无需注册',
      freeQuota: '无限制',
      signupUrl: 'https://pollinations.ai/',
      apiUrl: 'https://image.pollinations.ai/prompt',
      features: ['无需API密钥', 'Flux模型', '高质量图像', '多种风格'],
      difficulty: 'easy',
      category: 'image'
    },
    {
      id: 'deepseek',
      name: 'DeepSeek API',
      description: '每月500万token免费额度',
      freeQuota: '500万token/月',
      signupUrl: 'https://platform.deepseek.com/',
      apiUrl: 'https://api.deepseek.com/v1',
      features: ['超大免费额度', '中文优化', 'GPT兼容', '代码生成'],
      difficulty: 'easy',
      category: 'text'
    },
    {
      id: 'siliconflow',
      name: '硅基流动',
      description: '新用户赠送5元免费额度',
      freeQuota: '5元（约1000次调用）',
      signupUrl: 'https://cloud.siliconflow.cn/',
      apiUrl: 'https://api.siliconflow.cn/v1',
      features: ['多模型支持', '国内访问快', 'OpenAI兼容', '图文生成'],
      difficulty: 'easy',
      category: 'both'
    },
    {
      id: 'zhipu',
      name: '智谱AI (ChatGLM)',
      description: '新用户赠送18元免费额度',
      freeQuota: '18元（约1800次调用）',
      signupUrl: 'https://open.bigmodel.cn/',
      apiUrl: 'https://open.bigmodel.cn/api/paas/v4',
      features: ['GLM-4模型', '多模态支持', '中文优化', '图像理解'],
      difficulty: 'easy',
      category: 'both'
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      description: '每天1500次免费请求',
      freeQuota: '1500次/天',
      signupUrl: 'https://makersuite.google.com/app/apikey',
      apiUrl: 'https://generativelanguage.googleapis.com/v1beta',
      features: ['多模态AI', '长上下文', '图像分析', '代码生成'],
      difficulty: 'medium',
      category: 'both'
    },
    {
      id: 'huggingface',
      name: 'Hugging Face',
      description: '免费推理API，限制较多',
      freeQuota: '有限免费',
      signupUrl: 'https://huggingface.co/',
      apiUrl: 'https://api-inference.huggingface.co',
      features: ['开源模型', '社区驱动', '多种任务', '研究友好'],
      difficulty: 'medium',
      category: 'both'
    }
  ];

  // 根据分类筛选服务商
  const filteredProviders = apiProviders.filter(provider => 
    selectedCategory === 'all' || provider.category === selectedCategory
  );

  // 复制URL到剪贴板
  const copyToClipboard = async (text: string, providerId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUrl(providerId);
      setTimeout(() => setCopiedUrl(''), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 获取难度颜色
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // 获取分类图标
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'text': return '📝';
      case 'image': return '🎨';
      case 'both': return '🚀';
      default: return '⚡';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Key className="w-6 h-6" />
                免费API密钥获取助手
              </h2>
              <p className="text-blue-100 mt-1">
                一站式获取各种免费AI服务API密钥，告别配置烦恼！
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
        </div>

        {/* 分类筛选 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-3">
            {[
              { key: 'all', label: '全部服务', icon: '🌟' },
              { key: 'text', label: '文本生成', icon: '📝' },
              { key: 'image', label: '图像生成', icon: '🎨' },
              { key: 'both', label: '多模态', icon: '🚀' }
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key as any)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  selectedCategory === key
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 服务商列表 */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProviders.map((provider) => (
              <div
                key={provider.id}
                className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-blue-300 transition-all hover:shadow-lg"
              >
                {/* 服务商头部 */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <span className="text-xl">{getCategoryIcon(provider.category)}</span>
                      {provider.name}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">{provider.description}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(provider.difficulty)}`}>
                    {provider.difficulty === 'easy' ? '简单' : provider.difficulty === 'medium' ? '中等' : '困难'}
                  </div>
                </div>

                {/* 免费额度 */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <Gift className="w-4 h-4" />
                    <span className="font-medium">免费额度：{provider.freeQuota}</span>
                  </div>
                </div>

                {/* 特性列表 */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {provider.features.map((feature, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* API信息 */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between bg-white rounded-lg p-3">
                    <div>
                      <span className="text-sm text-gray-500">注册地址</span>
                      <p className="text-xs text-gray-800 font-mono">{provider.signupUrl}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(provider.signupUrl, provider.id + '-signup')}
                        className="text-gray-400 hover:text-gray-600"
                        title="复制注册地址"
                      >
                        {copiedUrl === provider.id + '-signup' ? 
                          <CheckCircle className="w-4 h-4 text-green-500" /> : 
                          <Copy className="w-4 h-4" />
                        }
                      </button>
                      <a
                        href={provider.signupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700"
                        title="打开注册页面"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-white rounded-lg p-3">
                    <div>
                      <span className="text-sm text-gray-500">API地址</span>
                      <p className="text-xs text-gray-800 font-mono">{provider.apiUrl}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(provider.apiUrl, provider.id + '-api')}
                      className="text-gray-400 hover:text-gray-600"
                      title="复制API地址"
                    >
                      {copiedUrl === provider.id + '-api' ? 
                        <CheckCircle className="w-4 h-4 text-green-500" /> : 
                        <Copy className="w-4 h-4" />
                      }
                    </button>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-2">
                  <a
                    href={provider.signupUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-500 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                  >
                    立即注册获取
                  </a>
                  {provider.id === 'pollinations' && (
                    <button
                      onClick={() => onApiKeyObtained?.(provider.id, 'free-no-key-required')}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                      title="无需API密钥，直接使用"
                    >
                      直接使用
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 底部说明 */}
        <div className="bg-gray-50 p-6 border-t border-gray-200">
          <div className="flex items-start gap-3 text-sm text-gray-600">
            <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">使用说明：</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>推荐优先选择"简单"难度的服务商，注册配置更容易</li>
                <li>Pollinations.AI 无需API密钥，可直接使用</li>
                <li>注册时请使用真实信息，避免账户被封</li>
                <li>免费额度有限，建议配置多个服务商作为备用</li>
                <li>获取API密钥后，请回到API配置界面进行设置</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreeApiKeyHelper; 