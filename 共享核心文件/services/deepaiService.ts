// services/deepaiService.ts

const DEEP_AI_API_URL = "https://api.deepai.org/api/text2img";

export const generatePhotoViaDeepAI_Real = async (prompt: string, apiKey: string): Promise<string> => {
  console.log("调用DeepAI API开始，提示词:", prompt.substring(0, 100) + "...");
  
  const formData = new FormData();
  formData.append('text', prompt);

  try {
    const response = await fetch(DEEP_AI_API_URL, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        // 'Content-Type': 'multipart/form-data' // Fetch API sets this automatically for FormData
      },
      body: formData,
    });

    if (!response.ok) {
      let errorBodyText = "未知错误";
      try {
        const errorBody = await response.json(); // DeepAI might return JSON error
        errorBodyText = errorBody.err || JSON.stringify(errorBody);
      } catch (e) {
        errorBodyText = await response.text(); // Fallback to text if not JSON
      }
      console.error(`DeepAI API 错误: ${response.status} ${response.statusText}`, errorBodyText);
      throw new Error(`DeepAI API 请求失败: ${response.status} - ${errorBodyText}`);
    }

    const data = await response.json();
    if (data.output_url) {
      console.log("DeepAI 图片生成成功:", data.output_url);
      return data.output_url;
    } else {
      console.error("DeepAI API 响应缺少 output_url:", data);
      throw new Error("DeepAI API 响应格式不正确，缺少 output_url。");
    }
  } catch (error) {
    console.error("调用DeepAI API时发生网络或解析错误:", error);
    if (error instanceof TypeError && error.message.toLowerCase().includes('failed to fetch')) {
         console.warn("DeepAI API Fetch失败，这可能是由于CORS（跨域资源共享）策略。如果是在本地开发环境，请考虑使用允许CORS的浏览器扩展进行测试。生产环境需要后端代理。");
         throw new Error(`无法连接到DeepAI API，可能是网络问题或CORS限制。请检查网络连接和浏览器控制台以获取更多信息。`);
    }
    throw error; // Re-throw other errors
  }
};
