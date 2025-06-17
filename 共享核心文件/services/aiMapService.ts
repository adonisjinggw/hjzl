/**
 * AI幻想地图生成服务（零配置版）
 * 优先调用DeepAI官方测试Key，无需手动配置；失败时自动兜底Hugging Face Spaces公开API。
 * @module aiMapService
 */

/**
 * 调用AI文生图API生成幻想地图（零配置）
 * @param prompt 地图描述（建议英文）
 * @returns 图片URL
 * @throws 错误信息字符串，便于前端展示
 */
export async function generateFantasyMap(prompt: string): Promise<string> {
  // DeepAI官方测试Key，仅用于演示/体验
  const DEFAULT_DEEPAI_KEY = 'quickstart-QUdJIGlzIGNvbWluZy4uLi4K';
  const apiKey = import.meta.env.VITE_DEEPAI_API_KEY || DEFAULT_DEEPAI_KEY;
  try {
    const resp = await fetch('https://api.deepai.org/api/text2img', {
      method: 'POST',
      headers: {
        'Api-Key': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `text=${encodeURIComponent(prompt)}`,
    });
    const data = await resp.json();
    if (data.output_url) return data.output_url;
    // 输出详细错误日志
    console.error('DeepAI接口错误:', data);
    throw new Error(data.err || 'DeepAI生成失败');
  } catch (e: any) {
    // Hugging Face Spaces公开API兜底
    try {
      const resp = await fetch('https://api-inference.huggingface.co/models/prompthero/openjourney', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: prompt }),
      });
      // 兼容多种返回格式
      const contentType = resp.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await resp.json();
        console.error('Hugging Face接口JSON返回:', data);
        if (data && data[0]?.url) return data[0].url;
        if (data && data.generated_image) return data.generated_image;
        if (data.error) throw new Error(data.error);
        throw new Error('Hugging Face生成失败');
      } else if (contentType.startsWith('image/')) {
        // 直接返回图片二进制
        const blob = await resp.blob();
        return URL.createObjectURL(blob);
      } else {
        throw new Error('Hugging Face返回未知格式');
      }
    } catch (err: any) {
      console.error('Hugging Face Spaces接口错误:', err);
      throw new Error('AI地图生成失败（DeepAI和Hugging Face均不可用）：' + (err?.message || err));
    }
  }
} 