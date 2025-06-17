/**
 * API密钥管理服务
 * 提供本地存储、获取和验证API密钥的功能
 */

export interface ApiKeys {
  geminiApiKey: string;
  deepaiApiKey?: string;
}

const API_KEYS_STORAGE_KEY = 'huanjing_api_keys';

/**
 * 保存API密钥到本地存储
 * @param apiKeys API密钥对象
 */
export const saveApiKeys = (apiKeys: ApiKeys): void => {
  try {
    localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(apiKeys));
  } catch (error) {
    console.error('保存API密钥失败:', error);
    throw new Error('保存API密钥失败，请检查浏览器存储权限');
  }
};

/**
 * 从本地存储获取API密钥
 * @returns API密钥对象，如果不存在则返回null
 */
export const getApiKeys = (): ApiKeys | null => {
  try {
    const stored = localStorage.getItem(API_KEYS_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as ApiKeys;
  } catch (error) {
    console.error('读取API密钥失败:', error);
    return null;
  }
};

/**
 * 获取Gemini API密钥
 * 优先使用本地存储的密钥，否则使用环境变量
 * @returns Gemini API密钥
 */
export const getGeminiApiKey = (): string => {
  const localKeys = getApiKeys();
  if (localKeys?.geminiApiKey) {
    return localKeys.geminiApiKey;
  }
  
  // 回退到环境变量
  const envKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (envKey && envKey !== 'your_gemini_api_key_here') {
    return envKey;
  }
  
  throw new Error('未配置Gemini API密钥');
};

/**
 * 获取DeepAI API密钥
 * @returns DeepAI API密钥
 */
export const getDeepAiApiKey = (): string => {
  const localKeys = getApiKeys();
  if (localKeys?.deepaiApiKey) {
    return localKeys.deepaiApiKey;
  }
  
  throw new Error('未配置DeepAI API密钥');
};

/**
 * 检查API密钥是否已配置
 * @returns 是否已配置Gemini API密钥
 */
export const hasGeminiApiKey = (): boolean => {
  try {
    const key = getGeminiApiKey();
    return key.length > 0;
  } catch {
    return false;
  }
};

/**
 * 检查DeepAI API密钥是否已配置
 * @returns 是否已配置DeepAI API密钥
 */
export const hasDeepAiApiKey = (): boolean => {
  try {
    const key = getDeepAiApiKey();
    return key.length > 0;
  } catch {
    return false;
  }
};

/**
 * 清除所有API密钥
 */
export const clearApiKeys = (): void => {
  try {
    localStorage.removeItem(API_KEYS_STORAGE_KEY);
  } catch (error) {
    console.error('清除API密钥失败:', error);
  }
};

/**
 * 验证API密钥格式
 * @param key API密钥
 * @param type 密钥类型
 * @returns 是否有效
 */
export const validateApiKey = (key: string, type: 'gemini' | 'deepai'): boolean => {
  if (!key || key.trim().length === 0) return false;
  
  if (type === 'gemini') {
    // Gemini API密钥通常以AIza开头
    return key.startsWith('AIza') && key.length > 20;
  }
  
  if (type === 'deepai') {
    // DeepAI API密钥格式相对灵活
    return key.length > 10;
  }
  
  return false;
};

/**
 * 检查是否配置了即梦API密钥
 */
export const hasJimengApiKey = (): boolean => {
  try {
    const jimengProvider = localStorage.getItem('jimeng_api_provider');
    const jimengApiKey = localStorage.getItem('jimeng_api_key');
    return !!(jimengProvider && jimengApiKey && jimengApiKey.trim() !== '');
  } catch (error) {
    return false;
  }
};

/**
 * 设置即梦API配置
 */
export const setJimengApiConfig = (provider: string, apiKey: string): boolean => {
  try {
    if (!provider || !apiKey || apiKey.trim() === '') {
      throw new Error('即梦API提供商和密钥不能为空');
    }

    localStorage.setItem('jimeng_api_provider', provider);
    localStorage.setItem('jimeng_api_key', apiKey.trim());
    return true;
  } catch (error) {
    console.error('设置即梦API配置失败:', error);
    return false;
  }
};

/**
 * 获取即梦API配置
 */
export const getJimengApiConfig = (): { provider: string; apiKey: string } | null => {
  try {
    const provider = localStorage.getItem('jimeng_api_provider');
    const apiKey = localStorage.getItem('jimeng_api_key');
    
    if (provider && apiKey && apiKey.trim() !== '') {
      return { provider, apiKey: apiKey.trim() };
    }
    return null;
  } catch (error) {
    console.error('获取即梦API配置失败:', error);
    return null;
  }
};

/**
 * 清除即梦API配置
 */
export const clearJimengApiConfig = (): void => {
  try {
    localStorage.removeItem('jimeng_api_provider');
    localStorage.removeItem('jimeng_api_key');
  } catch (error) {
    console.error('清除即梦API配置失败:', error);
  }
};

/**
 * 设置Gemini API密钥
 */
export const setGeminiApiKey = (apiKey: string): boolean => {
  try {
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('Gemini API密钥不能为空');
    }

    const existingKeys = getApiKeys() || { geminiApiKey: '' };
    const newKeys: ApiKeys = {
      ...existingKeys,
      geminiApiKey: apiKey.trim()
    };
    
    saveApiKeys(newKeys);
    return true;
  } catch (error) {
    console.error('设置Gemini API密钥失败:', error);
    return false;
  }
};

/**
 * 清除Gemini API密钥
 */
export const clearGeminiApiKey = (): void => {
  try {
    const existingKeys = getApiKeys();
    if (existingKeys) {
      const newKeys: ApiKeys = {
        ...existingKeys,
        geminiApiKey: ''
      };
      saveApiKeys(newKeys);
    }
  } catch (error) {
    console.error('清除Gemini API密钥失败:', error);
  }
}; 