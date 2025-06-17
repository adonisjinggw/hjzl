import React from 'react';
import { AlertTriangle, Key, Settings } from 'lucide-react';
import { hasGeminiApiKey } from '../services/apiKeyManager';

interface ApiKeyStatusProps {
  onOpenSettings: () => void;
}

/**
 * API密钥状态提醒组件
 * 在未配置API密钥时显示提醒
 */
export const ApiKeyStatus: React.FC<ApiKeyStatusProps> = ({ onOpenSettings }) => {
  const hasApiKey = hasGeminiApiKey();

  if (hasApiKey) {
    return null; // 如果已配置API密钥，不显示任何内容
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-800 mb-1">
            需要配置API密钥
          </h3>
          <p className="text-sm text-yellow-700 mb-3">
            要使用幻境之旅生成器，你需要先配置Gemini API密钥。点击下方按钮进行配置。
          </p>
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenSettings}
              className="inline-flex items-center space-x-2 px-3 py-2 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>配置API密钥</span>
            </button>
            <a
              href="https://makersuite.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-3 py-2 border border-yellow-300 text-yellow-700 text-sm rounded-md hover:bg-yellow-100 transition-colors"
            >
              <Key className="w-4 h-4" />
              <span>获取API密钥</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}; 