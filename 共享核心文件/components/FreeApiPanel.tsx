import React, { useState, useEffect } from 'react';
import { CheckCircle, Zap, RefreshCw, Star } from 'lucide-react';
import { getBuiltinFreeServiceStatus } from '../services/builtinFreeApiService';

interface FreeApiPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 免费API配置面板组件
 * 显示内置免费AI服务的状态和功能
 */
export const FreeApiPanel: React.FC<FreeApiPanelProps> = ({ isOpen, onClose }) => {
  const [serviceStatus, setServiceStatus] = useState<{
    isActive: boolean;
    limitations: string[];
    features: string[];
    message?: string;
  }>({
    isActive: true,
    limitations: [],
    features: [
      '虚拟场景生成',
      '真实行程规划',
      '社媒文案创作',
      '视频脚本生成',
      '智能图像生成',
      '多种滤镜效果'
    ],
    message: '所有服务正常运行'
  });
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkServices();
    }
  }, [isOpen]);

  const checkServices = async () => {
    setIsChecking(true);
    try {
      // 获取服务状态
      const status = await getBuiltinFreeServiceStatus();
      setServiceStatus({
        ...status,
        message: '所有服务正常运行'
      });
    } catch (error) {
      console.error('检查服务状态失败:', error);
      setServiceStatus({
        isActive: false,
        limitations: ['服务检查失败'],
        features: [],
        message: '服务状态检查失败'
      });
    } finally {
      setIsChecking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-600">
        
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">内置免费AI服务</h2>
              <p className="text-slate-400">完全免费，无需配置，即开即用</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={checkServices}
              disabled={isChecking}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
              <span>刷新状态</span>
            </button>
            
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors duration-200"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 服务状态概览 */}
        <div className="bg-green-900/30 border border-green-500/50 rounded-xl p-5 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <div>
              <h3 className="text-lg font-semibold text-green-300">服务正常运行</h3>
              <p className="text-green-200 text-sm">{serviceStatus.message}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {serviceStatus.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 text-green-200 text-sm">
                <span className="text-green-400">•</span>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 服务详情 */}
        <div className="space-y-6">
          
          {/* 内置AI文本生成 */}
          <div className="bg-slate-700/50 rounded-xl p-5 border border-slate-600/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  📝
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">智能文本生成</h3>
                  <p className="text-sm text-slate-400">专注中华文化的文本内容生成</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1 text-green-400 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>正常</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-3">
                <h4 className="text-white font-medium mb-2">虚拟场景生成</h4>
                <p className="text-slate-300 text-sm">生成基于中国神话传说的虚幻旅行场景</p>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-3">
                <h4 className="text-white font-medium mb-2">真实行程规划</h4>
                <p className="text-slate-300 text-sm">创建详细的真实旅行计划和攻略</p>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-3">
                <h4 className="text-white font-medium mb-2">社媒文案</h4>
                <p className="text-slate-300 text-sm">生成吸引人的社交媒体分享内容</p>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-3">
                <h4 className="text-white font-medium mb-2">视频脚本</h4>
                <p className="text-slate-300 text-sm">创作短视频和Vlog脚本</p>
              </div>
            </div>
          </div>

          {/* 内置AI图像生成 */}
          <div className="bg-slate-700/50 rounded-xl p-5 border border-slate-600/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-pink-500 to-red-500 flex items-center justify-center">
                  🎨
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">智能图像生成</h3>
                  <p className="text-sm text-slate-400">创建精美的旅行场景图片</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1 text-green-400 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>正常</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-3">
                <h4 className="text-white font-medium mb-2">中国风虚拟场景</h4>
                <p className="text-slate-300 text-sm">神话仙境、古典建筑</p>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-3">
                <h4 className="text-white font-medium mb-2">真实旅行照片</h4>
                <p className="text-slate-300 text-sm">风景名胜、文化景点</p>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-3">
                <h4 className="text-white font-medium mb-2">多种滤镜效果</h4>
                <p className="text-slate-300 text-sm">复古、现代、艺术风格</p>
              </div>
            </div>
          </div>

          {/* 特色功能 */}
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/50 rounded-xl p-5">
            <div className="flex items-center space-x-3 mb-4">
              <Star className="w-6 h-6 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">特色优势</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2"></div>
                  <div>
                    <h4 className="text-white font-medium">深度中华文化元素</h4>
                    <p className="text-slate-300 text-sm">基于山海经、传统神话的丰富内容库</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2"></div>
                  <div>
                    <h4 className="text-white font-medium">无需API密钥</h4>
                    <p className="text-slate-300 text-sm">完全免费，无使用限制</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2"></div>
                  <div>
                    <h4 className="text-white font-medium">离线算法</h4>
                    <p className="text-slate-300 text-sm">基于本地智能算法，响应迅速</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2"></div>
                  <div>
                    <h4 className="text-white font-medium">隐私保护</h4>
                    <p className="text-slate-300 text-sm">所有数据本地处理，保护用户隐私</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-center mt-6">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            开始使用免费服务
          </button>
        </div>
      </div>
    </div>
  );
};