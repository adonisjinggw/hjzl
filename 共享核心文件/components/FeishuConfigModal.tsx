/**
 * 🚀 飞书多维表格配置模态框
 * 为会员用户提供飞书应用配置界面
 */

import React, { useState, useEffect } from 'react';
import { X, Settings, TestTube, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import type { FeishuConfig } from '../services/feishuTableService';
import { feishuTableService } from '../services/feishuTableService';

interface FeishuConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSave: (config: FeishuConfig) => void;
  currentConfig?: FeishuConfig | null;
}

export const FeishuConfigModal: React.FC<FeishuConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSave,
  currentConfig
}) => {
  const [config, setConfig] = useState<FeishuConfig>({
    appId: '',
    appSecret: '',
    tableId: '',
    viewId: ''
  });

  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (currentConfig) {
      setConfig(currentConfig);
    }
  }, [currentConfig]);

  const handleInputChange = (field: keyof FeishuConfig, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
    setTestResult(null); // 清除之前的测试结果
  };

  const handleTestConnection = async () => {
    if (!config.appId || !config.appSecret || !config.tableId) {
      setTestResult({
        success: false,
        message: '请填写完整的应用ID、应用密钥和表格ID'
      });
      return;
    }

    setIsTestingConnection(true);
    setTestResult(null);

    try {
      // 临时初始化服务进行测试
      feishuTableService.initialize(config);
      const result = await feishuTableService.testConnection();
      setTestResult(result);
    } catch (error: any) {
      setTestResult({
        success: false,
        message: `连接测试失败: ${error.message}`
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSave = () => {
    if (!config.appId || !config.appSecret || !config.tableId) {
      setTestResult({
        success: false,
        message: '请填写完整的应用ID、应用密钥和表格ID'
      });
      return;
    }

    if (testResult && !testResult.success) {
      setTestResult({
        success: false,
        message: '请先测试连接成功后再保存配置'
      });
      return;
    }

    onConfigSave(config);
    onClose();
  };

  const handleClose = () => {
    setTestResult(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-600 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-slate-600">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">飞书多维表格配置</h2>
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded text-xs font-semibold">
              会员专享
            </span>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-6">
          {/* 功能介绍 */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h3 className="text-blue-300 font-semibold mb-2">🚀 企业级分镜管理工作流</h3>
            <p className="text-blue-200 text-sm mb-3">
              自动将生成的分镜导入飞书多维表格，在表格中生成图片，再同步回项目，实现企业级协作管理。
            </p>
            <div className="flex items-center gap-2 text-xs text-blue-300">
              <span>工作流程：</span>
              <span className="bg-blue-500/20 px-2 py-1 rounded">分镜生成</span>
              <span>→</span>
              <span className="bg-blue-500/20 px-2 py-1 rounded">导入飞书</span>
              <span>→</span>
              <span className="bg-blue-500/20 px-2 py-1 rounded">表格生图</span>
              <span>→</span>
              <span className="bg-blue-500/20 px-2 py-1 rounded">同步回项目</span>
            </div>
          </div>

          {/* 配置表单 */}
          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                应用 ID (App ID) *
              </label>
              <input
                type="text"
                value={config.appId}
                onChange={(e) => handleInputChange('appId', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                placeholder="cli_xxxxxxxxxxxxxxxxx"
              />
              <p className="text-xs text-slate-400 mt-1">
                在飞书开放平台创建应用后获得的应用ID
              </p>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                应用密钥 (App Secret) *
              </label>
              <input
                type="password"
                value={config.appSecret}
                onChange={(e) => handleInputChange('appSecret', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                placeholder="应用密钥（保密信息）"
              />
              <p className="text-xs text-slate-400 mt-1">
                应用密钥，用于获取访问令牌
              </p>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                多维表格 ID (Table ID) *
              </label>
              <input
                type="text"
                value={config.tableId}
                onChange={(e) => handleInputChange('tableId', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                placeholder="bascnxxxxxxxxxxxxxxxx"
              />
              <p className="text-xs text-slate-400 mt-1">
                多维表格的唯一标识符，可从表格URL中获取
              </p>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                视图 ID (View ID)
                <span className="text-slate-500 text-xs ml-1">(可选)</span>
              </label>
              <input
                type="text"
                value={config.viewId}
                onChange={(e) => handleInputChange('viewId', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                placeholder="vewxxxxxxxxxxxxxxxxx"
              />
              <p className="text-xs text-slate-400 mt-1">
                特定视图的ID，不填写则使用默认视图
              </p>
            </div>
          </div>

          {/* 帮助链接 */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h4 className="text-slate-300 font-medium mb-2">📖 配置帮助</h4>
            <div className="space-y-2 text-sm">
              <a
                href="https://open.feishu.cn/app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                飞书开放平台 - 创建应用
              </a>
              <a
                href="https://www.feishu.cn/hc/zh-CN/articles/004002825367"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                多维表格API文档
              </a>
            </div>
          </div>

          {/* 测试结果 */}
          {testResult && (
            <div className={`rounded-lg p-4 ${
              testResult.success 
                ? 'bg-green-500/10 border border-green-500/20' 
                : 'bg-red-500/10 border border-red-500/20'
            }`}>
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
                <span className={`font-medium ${
                  testResult.success ? 'text-green-300' : 'text-red-300'
                }`}>
                  {testResult.success ? '连接测试成功' : '连接测试失败'}
                </span>
              </div>
              <p className={`text-sm mt-1 ${
                testResult.success ? 'text-green-200' : 'text-red-200'
              }`}>
                {testResult.message}
              </p>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-between p-6 border-t border-slate-600">
          <button
            onClick={handleTestConnection}
            disabled={isTestingConnection}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors"
          >
            <TestTube className="w-4 h-4" />
            {isTestingConnection ? '测试中...' : '测试连接'}
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all duration-200"
            >
              保存配置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeishuConfigModal; 