/**
 * weatherService.ts
 * Open-Meteo天气API集成服务
 * 文档：https://open-meteo.com/en/docs
 */

/**
 * 获取指定经纬度的实时天气（Open-Meteo）
 * @param lat 纬度
 * @param lon 经度
 */
export async function fetchWeather(lat: number, lon: number) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('天气数据获取失败');
  const data = await res.json();
  return data.current_weather;
} 