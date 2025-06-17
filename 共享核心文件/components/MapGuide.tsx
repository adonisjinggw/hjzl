import React, { useState } from 'react';
import { 
  Map, 
  MapPin, 
  Navigation, 
  Play, 
  Settings, 
  Key, 
  Globe, 
  Zap,
  CheckCircle,
  AlertTriangle,
  Info,
  ExternalLink,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';

interface MapGuideProps {
  onClose: () => void;
}

/**
 * 地图功能使用指南组件
 * 帮助用户了解和配置真实地图功能
 */
export const MapGuide: React.FC<MapGuideProps> = ({ onClose }) => {
  const [currentTab, setCurrentTab] = useState<'overview' | 'setup' | 'usage' | 'troubleshooting'>('overview');
  const [showApiKey, setShowApiKey] = useState(false);

  // 复制到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // 可以添加成功提示
  };

  // 检查API密钥配置状态
  const checkApiKeyStatus = () => {
    const amapKey = import.meta.env.VITE_AMAP_API_KEY;
    const googleKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    return {
      amap: amapKey && amapKey !== '您的高德地图API密钥',
      google: googleKey && googleKey !== '您的Google Maps API密钥'
    };
  };

  const apiStatus = checkApiKeyStatus();

  // 渲染概览标签页
  const renderOverview = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Map className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">🗺️ 真实地图功能</h3>
        <p className="text-slate-300">
          体验真实的地图显示和沉浸式路线动画演示
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/50 rounded-lg p-4 border border-blue-500/30">
          <div className="flex items-center space-x-3 mb-3">
            <Globe className="w-6 h-6 text-blue-400" />
            <h4 className="font-semibold text-white">真实地图</h4>
          </div>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>• 高德地图/谷歌地图支持</li>
            <li>• 真实地理坐标定位</li>
            <li>• 交互式地图操作</li>
            <li>• 智能路线规划</li>
          </ul>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/30">
          <div className="flex items-center space-x-3 mb-3">
            <Play className="w-6 h-6 text-purple-400" />
            <h4 className="font-semibold text-white">动画演示</h4>
          </div>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>• 卡通角色路线动画</li>
            <li>• 可调节播放速度</li>
            <li>• 暂停/重置控制</li>
            <li>• 流畅的路径移动</li>
          </ul>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg p-4 border border-blue-500/30">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-semibold text-white mb-2">✨ 特色功能</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-300">
              <div>
                <span className="font-medium text-blue-300">智能降级：</span>
                API不可用时自动使用备用地图
              </div>
              <div>
                <span className="font-medium text-purple-300">双模式支持：</span>
                虚拟幻境和真实旅行都有专属样式
              </div>
              <div>
                <span className="font-medium text-green-300">交互体验：</span>
                点击标记查看详细景点信息
              </div>
              <div>
                <span className="font-medium text-yellow-300">路线优化：</span>
                自动排序显示最优游览顺序
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 渲染设置标签页
  const renderSetup = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Key className="w-5 h-5 mr-2" />
          API密钥配置
        </h3>
        
        <div className="space-y-4">
          {/* 高德地图配置 */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-blue-500/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${apiStatus.amap ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <h4 className="font-semibold text-white">高德地图 (推荐中国用户)</h4>
              </div>
              {apiStatus.amap ? <CheckCircle className="w-5 h-5 text-green-400" /> : <AlertTriangle className="w-5 h-5 text-red-400" />}
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">申请地址:</label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 px-3 py-2 bg-slate-700 rounded text-sm text-blue-300">
                    https://console.amap.com/
                  </code>
                  <button
                    onClick={() => window.open('https://console.amap.com/', '_blank')}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                    title="打开申请页面"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">环境变量配置:</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 px-3 py-2 bg-slate-700 rounded text-sm text-green-300">
                      VITE_AMAP_API_KEY=your_api_key_here
                    </code>
                    <button
                      onClick={() => copyToClipboard('VITE_AMAP_API_KEY=your_api_key_here')}
                      className="p-2 bg-slate-600 hover:bg-slate-700 text-white rounded transition-colors"
                      title="复制配置"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 px-3 py-2 bg-slate-700 rounded text-sm text-green-300">
                      VITE_AMAP_SECURITY_CODE=your_security_code
                    </code>
                    <button
                      onClick={() => copyToClipboard('VITE_AMAP_SECURITY_CODE=your_security_code')}
                      className="p-2 bg-slate-600 hover:bg-slate-700 text-white rounded transition-colors"
                      title="复制配置"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 谷歌地图配置 */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-green-500/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${apiStatus.google ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <h4 className="font-semibold text-white">谷歌地图 (国际用户)</h4>
              </div>
              {apiStatus.google ? <CheckCircle className="w-5 h-5 text-green-400" /> : <AlertTriangle className="w-5 h-5 text-red-400" />}
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">申请地址:</label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 px-3 py-2 bg-slate-700 rounded text-sm text-blue-300">
                    https://console.cloud.google.com/
                  </code>
                  <button
                    onClick={() => window.open('https://console.cloud.google.com/', '_blank')}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                    title="打开申请页面"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">环境变量配置:</label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 px-3 py-2 bg-slate-700 rounded text-sm text-green-300">
                    VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
                  </code>
                  <button
                    onClick={() => copyToClipboard('VITE_GOOGLE_MAPS_API_KEY=your_api_key_here')}
                    className="p-2 bg-slate-600 hover:bg-slate-700 text-white rounded transition-colors"
                    title="复制配置"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 配置步骤 */}
      <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-500/30">
        <h4 className="font-semibold text-white mb-3 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          配置步骤
        </h4>
        <ol className="text-sm text-slate-300 space-y-2">
          <li className="flex items-start space-x-2">
            <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">1</span>
            <span>在项目根目录创建 <code className="bg-slate-700 px-1 rounded">.env</code> 文件</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">2</span>
            <span>在 .env 文件中添加您的API密钥</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">3</span>
            <span>重启开发服务器 <code className="bg-slate-700 px-1 rounded">npm run dev</code></span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">4</span>
            <span>刷新页面即可看到真实地图</span>
          </li>
        </ol>
      </div>
    </div>
  );

  // 渲染使用说明标签页
  const renderUsage = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Navigation className="w-5 h-5 mr-2" />
          使用说明
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 地图操作 */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-blue-500/30">
            <h4 className="font-semibold text-white mb-3">🗺️ 地图操作</h4>
            <ul className="text-sm text-slate-300 space-y-2">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-blue-400 mt-0.5" />
                <span>点击地图标记查看详细景点信息</span>
              </li>
              <li className="flex items-start space-x-2">
                <Navigation className="w-4 h-4 text-blue-400 mt-0.5" />
                <span>拖拽地图移动到不同区域</span>
              </li>
              <li className="flex items-start space-x-2">
                <Zap className="w-4 h-4 text-blue-400 mt-0.5" />
                <span>滚轮缩放调整地图比例</span>
              </li>
              <li className="flex items-start space-x-2">
                <Settings className="w-4 h-4 text-blue-400 mt-0.5" />
                <span>底部切换地图提供商</span>
              </li>
            </ul>
          </div>

          {/* 动画控制 */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/30">
            <h4 className="font-semibold text-white mb-3">🎬 动画控制</h4>
            <ul className="text-sm text-slate-300 space-y-2">
              <li className="flex items-start space-x-2">
                <Play className="w-4 h-4 text-purple-400 mt-0.5" />
                <span>点击播放按钮开始路线演示</span>
              </li>
              <li className="flex items-start space-x-2">
                <Settings className="w-4 h-4 text-purple-400 mt-0.5" />
                <span>调整播放速度 (0.5x - 2x)</span>
              </li>
              <li className="flex items-start space-x-2">
                <Navigation className="w-4 h-4 text-purple-400 mt-0.5" />
                <span>角色沿着最优路线舒缓移动</span>
              </li>
              <li className="flex items-start space-x-2">
                <Zap className="w-4 h-4 text-purple-400 mt-0.5" />
                <span>暂停和重置控制动画状态</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 功能演示 */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-lg p-4 border border-purple-500/30">
        <h4 className="font-semibold text-white mb-3 flex items-center">
          <Eye className="w-5 h-5 mr-2" />
          演示效果
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-white font-bold">1</span>
            </div>
            <h5 className="font-medium text-white mb-1">真实地图</h5>
            <p className="text-slate-300">显示真实的街道、建筑和地形</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-white font-bold">2</span>
            </div>
            <h5 className="font-medium text-white mb-1">标记路线</h5>
            <p className="text-slate-300">清晰显示各个景点位置和连接</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-white font-bold">3</span>
            </div>
            <h5 className="font-medium text-white mb-1">动画演示</h5>
            <p className="text-slate-300">卡通角色沿路线流畅移动</p>
          </div>
        </div>
      </div>
    </div>
  );

  // 渲染故障排除标签页
  const renderTroubleshooting = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          故障排除
        </h3>

        <div className="space-y-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-yellow-500/30">
            <h4 className="font-semibold text-yellow-300 mb-2">❓ 地图无法加载</h4>
            <div className="text-sm text-slate-300 space-y-2">
              <p><strong>可能原因：</strong></p>
              <ul className="ml-4 space-y-1">
                <li>• API密钥未配置或无效</li>
                <li>• 网络连接问题</li>
                <li>• API配额已用完</li>
                <li>• 地图服务暂时不可用</li>
              </ul>
              <p><strong>解决方案：</strong></p>
              <ul className="ml-4 space-y-1">
                <li>• 检查 .env 文件中的API密钥配置</li>
                <li>• 确认API密钥在对应平台有效</li>
                <li>• 尝试切换到备用地图提供商</li>
                <li>• 检查网络连接和防火墙设置</li>
              </ul>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4 border border-red-500/30">
            <h4 className="font-semibold text-red-300 mb-2">❌ 动画不工作</h4>
            <div className="text-sm text-slate-300 space-y-2">
              <p><strong>可能原因：</strong></p>
              <ul className="ml-4 space-y-1">
                <li>• 地图未完全加载</li>
                <li>• 路线数据不完整</li>
                <li>• 浏览器性能问题</li>
              </ul>
              <p><strong>解决方案：</strong></p>
              <ul className="ml-4 space-y-1">
                <li>• 等待地图完全加载后再开始动画</li>
                <li>• 尝试重新生成旅程内容</li>
                <li>• 降低动画播放速度</li>
                <li>• 刷新页面重新尝试</li>
              </ul>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4 border border-blue-500/30">
            <h4 className="font-semibold text-blue-300 mb-2">🔄 备用方案</h4>
            <div className="text-sm text-slate-300 space-y-2">
              <p>如果真实地图无法使用，系统会自动启用备用显示模式：</p>
              <ul className="ml-4 space-y-1">
                <li>• SVG绘制的简化地图</li>
                <li>• 保留所有交互功能</li>
                <li>• 支持动画演示</li>
                <li>• 无需API密钥配置</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 联系支持 */}
      <div className="bg-gradient-to-r from-blue-900/50 to-green-900/50 rounded-lg p-4 border border-blue-500/30">
        <h4 className="font-semibold text-white mb-2 flex items-center">
          <Info className="w-5 h-5 mr-2" />
          技术支持
        </h4>
        <p className="text-sm text-slate-300 mb-3">
          如果问题仍然存在，请检查浏览器控制台的错误信息，或尝试以下解决步骤：
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="font-medium text-blue-300">开发者模式：</span>
            按F12打开控制台查看详细错误
          </div>
          <div>
            <span className="font-medium text-green-300">清除缓存：</span>
            Ctrl+F5强制刷新页面
          </div>
          <div>
            <span className="font-medium text-purple-300">检查配置：</span>
            确认环境变量文件格式正确
          </div>
          <div>
            <span className="font-medium text-yellow-300">重启服务：</span>
            重新启动开发服务器
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-600 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Map className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">真实地图功能指南</h2>
              <p className="text-sm text-slate-400">配置和使用真实地图与路线动画</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 标签页导航 */}
        <div className="flex border-b border-slate-700">
          {[
            { id: 'overview', label: '功能概览', icon: Eye },
            { id: 'setup', label: '配置设置', icon: Settings },
            { id: 'usage', label: '使用说明', icon: Navigation },
            { id: 'troubleshooting', label: '故障排除', icon: AlertTriangle }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-3 font-medium transition-colors ${
                currentTab === tab.id
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 内容区域 */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {currentTab === 'overview' && renderOverview()}
          {currentTab === 'setup' && renderSetup()}
          {currentTab === 'usage' && renderUsage()}
          {currentTab === 'troubleshooting' && renderTroubleshooting()}
        </div>

        {/* 底部操作栏 */}
        <div className="flex items-center justify-between p-6 border-t border-slate-700 bg-slate-800/30">
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <Info className="w-4 h-4" />
            <span>配置完成后重启开发服务器生效</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            开始使用
          </button>
        </div>
      </div>
    </div>
  );
}; 