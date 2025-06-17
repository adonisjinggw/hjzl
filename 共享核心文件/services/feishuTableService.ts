/**
 * 🚀 飞书多维表格集成服务
 * 为会员用户提供企业级分镜管理和图片生成流程
 */

import type { GeneratedVideoScript, VideoScriptScene } from '../types';

// 飞书API配置接口
interface FeishuConfig {
  appId: string;
  appSecret: string;
  tableId: string;
  viewId?: string;
}

// 飞书表格记录接口
interface FeishuTableRecord {
  record_id?: string;
  fields: {
    场景序号: number;
    分镜描述: string;
    视觉提示: string;
    音效说明: string;
    生成状态: string;
    图片URL?: string;
    图片Base64?: string;
    创建时间: string;
    项目ID: string;
  };
}

// 飞书API响应接口
interface FeishuApiResponse {
  code: number;
  msg: string;
  data?: any;
}

class FeishuTableService {
  private config: FeishuConfig | null = null;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  /**
   * 🔧 初始化飞书配置
   */
  initialize(config: FeishuConfig): void {
    this.config = config;
    console.log('✅ 飞书多维表格服务初始化完成');
  }

  /**
   * 🔑 获取访问令牌
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!this.config) {
      throw new Error('飞书配置未初始化');
    }

    try {
      const response = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_id: this.config.appId,
          app_secret: this.config.appSecret,
        }),
      });

      const result = await response.json();
      
      if (result.code === 0) {
        this.accessToken = result.tenant_access_token as string;
        this.tokenExpiry = Date.now() + (result.expire - 300) * 1000; // 提前5分钟刷新
        console.log('✅ 飞书访问令牌获取成功');
        return this.accessToken;
      } else {
        throw new Error(`获取飞书访问令牌失败: ${result.msg}`);
      }
    } catch (error: any) {
      console.error('❌ 飞书访问令牌获取失败:', error);
      throw new Error(`飞书认证失败: ${error.message}`);
    }
  }

  /**
   * 📤 自动导入分镜到飞书表格
   */
  async importVideoScriptToTable(
    videoScript: GeneratedVideoScript,
    projectId: string,
    progressCallback?: (progress: number, phase: string) => void
  ): Promise<string[]> {
    if (!this.config) {
      throw new Error('飞书配置未初始化，请先配置飞书应用信息');
    }

    console.log('🚀 开始导入分镜数据到飞书多维表格...');
    progressCallback?.(10, '获取飞书访问权限');

    const accessToken = await this.getAccessToken();
    const records: FeishuTableRecord[] = [];
    const recordIds: string[] = [];

    // 构建表格记录
    videoScript.scenes.forEach((scene, index) => {
      records.push({
        fields: {
          场景序号: index + 1,
          分镜描述: scene.shot || `场景${index + 1}`,
          视觉提示: scene.audio_visual_notes || '',
          音效说明: scene.audio_visual_notes || '',
          生成状态: '待生成',
          创建时间: new Date().toISOString(),
          项目ID: projectId,
        },
      });
    });

    progressCallback?.(30, '准备数据格式');

    // 批量创建记录
    try {
      for (let i = 0; i < records.length; i++) {
        progressCallback?.(30 + (i / records.length) * 40, `导入第${i + 1}个分镜`);

        const response = await fetch(
          `https://open.feishu.cn/open-apis/bitable/v1/apps/${this.config.tableId}/tables/tblfVFKZnk6bnD/records`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fields: records[i].fields,
            }),
          }
        );

        const result = await response.json();
        
        if (result.code === 0) {
          recordIds.push(result.data.record.record_id);
          console.log(`✅ 分镜${i + 1}导入成功`);
        } else {
          console.error(`❌ 分镜${i + 1}导入失败:`, result.msg);
          throw new Error(`导入失败: ${result.msg}`);
        }
      }

      progressCallback?.(70, '分镜导入完成');
      console.log(`✅ 所有分镜已成功导入飞书表格，共${recordIds.length}条记录`);
      return recordIds;

    } catch (error: any) {
      console.error('❌ 飞书表格导入失败:', error);
      throw new Error(`分镜导入失败: ${error.message}`);
    }
  }

  /**
   * 🎨 在飞书表格中生成图片
   */
  async generateImagesInTable(
    recordIds: string[],
    progressCallback?: (progress: number, phase: string) => void
  ): Promise<FeishuTableRecord[]> {
    if (!this.config) {
      throw new Error('飞书配置未初始化');
    }

    console.log('🎨 开始在飞书表格中生成图片...');
    progressCallback?.(10, '初始化图片生成流程');

    const accessToken = await this.getAccessToken();
    const { generateImagesUltraFast } = await import('./ultimateImageOptimizer');
    const updatedRecords: FeishuTableRecord[] = [];

    try {
      // 1. 获取所有记录的详细信息
      progressCallback?.(20, '获取分镜数据');
      const records = await this.getRecordsByIds(recordIds, accessToken);

      // 2. 准备图片生成任务
      const imageTasks = records.map((record, index) => ({
        id: `feishu-scene-${index}`,
        prompt: `${record.fields.分镜描述}: ${record.fields.视觉提示}, no text, no words, no letters, pure visual content only`,
        filterStyle: '自然色彩',
        isRealistic: true,
        priority: 'high' as const,
      }));

      progressCallback?.(40, '启动超高速图片生成');

      // 3. 使用终极优化器生成图片
      const imageResults = await generateImagesUltraFast(imageTasks, (imgProgress, imgPhase) => {
        const overallProgress = 40 + (imgProgress / 100) * 40;
        progressCallback?.(overallProgress, `图片生成: ${imgPhase}`);
      });

      progressCallback?.(80, '上传图片到飞书');

      // 4. 更新飞书表格记录
      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const imageResult = imageResults[i];

        if (imageResult && imageResult.success) {
          // 更新记录状态和图片信息
          const updateResponse = await fetch(
            `https://open.feishu.cn/open-apis/bitable/v1/apps/${this.config.tableId}/tables/tblfVFKZnk6bnD/records/${recordIds[i]}`,
            {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                fields: {
                  生成状态: '已完成',
                  图片Base64: imageResult.imageBase64,
                  图片URL: `data:image/png;base64,${imageResult.imageBase64.split(',')[1]}`,
                },
              }),
            }
          );

          if (updateResponse.ok) {
            const updatedRecord: FeishuTableRecord = {
              ...record,
              record_id: recordIds[i],
              fields: {
                ...record.fields,
                生成状态: '已完成',
                图片Base64: imageResult.imageBase64,
                图片URL: `data:image/png;base64,${imageResult.imageBase64.split(',')[1]}`,
              },
            };
            updatedRecords.push(updatedRecord);
            console.log(`✅ 分镜${i + 1}图片生成并更新成功`);
          }
        } else {
          // 标记为失败
          await fetch(
            `https://open.feishu.cn/open-apis/bitable/v1/apps/${this.config.tableId}/tables/tblfVFKZnk6bnD/records/${recordIds[i]}`,
            {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                fields: { 生成状态: '生成失败' },
              }),
            }
          );
        }
      }

      progressCallback?.(100, '图片生成完成');
      console.log(`✅ 飞书表格图片生成完成，成功${updatedRecords.length}张`);
      return updatedRecords;

    } catch (error: any) {
      console.error('❌ 飞书表格图片生成失败:', error);
      throw new Error(`图片生成失败: ${error.message}`);
    }
  }

  /**
   * 🔄 同步飞书数据回项目
   */
  async syncDataBackToProject(
    updatedRecords: FeishuTableRecord[]
  ): Promise<{
    imageBase64: string;
    sceneName: string;
    sceneDescription: string;
    apiProvider: string;
    promptUsed: string;
  }[]> {
    console.log('🔄 开始同步飞书数据回项目...');

    const syncedImages = updatedRecords
      .filter(record => record.fields.图片Base64)
      .map(record => ({
        imageBase64: record.fields.图片Base64!,
        sceneName: record.fields.分镜描述,
        sceneDescription: record.fields.视觉提示,
        apiProvider: 'feishu_integrated' as const,
        promptUsed: `${record.fields.分镜描述}: ${record.fields.视觉提示}`,
      }));

    console.log(`✅ 已同步${syncedImages.length}张图片回项目`);
    return syncedImages;
  }

  /**
   * 📊 获取记录详细信息
   */
  private async getRecordsByIds(recordIds: string[], accessToken: string): Promise<FeishuTableRecord[]> {
    const records: FeishuTableRecord[] = [];

    for (const recordId of recordIds) {
      try {
        const response = await fetch(
          `https://open.feishu.cn/open-apis/bitable/v1/apps/${this.config!.tableId}/tables/tblfVFKZnk6bnD/records/${recordId}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );

        const result = await response.json();
        if (result.code === 0) {
          records.push(result.data.record);
        }
      } catch (error) {
        console.warn(`⚠️ 获取记录${recordId}失败:`, error);
      }
    }

    return records;
  }

  /**
   * 🧪 测试飞书连接
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.config) {
        return { success: false, message: '飞书配置未初始化' };
      }

      const accessToken = await this.getAccessToken();
      
      // 测试表格访问权限
      const response = await fetch(
        `https://open.feishu.cn/open-apis/bitable/v1/apps/${this.config.tableId}/tables`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const result = await response.json();
      
      if (result.code === 0) {
        return { success: true, message: '飞书多维表格连接测试成功' };
      } else {
        return { success: false, message: `连接失败: ${result.msg}` };
      }
    } catch (error: any) {
      return { success: false, message: `连接错误: ${error.message}` };
    }
  }
}

// 全局服务实例
const feishuTableService = new FeishuTableService();

export { feishuTableService, FeishuTableService };
export type { FeishuConfig, FeishuTableRecord };

/**
 * 🚀 一键完成飞书工作流
 * 为会员用户提供的完整自动化流程
 */
export async function executeFeishuWorkflow(
  videoScript: GeneratedVideoScript,
  feishuConfig: FeishuConfig,
  projectId: string,
  progressCallback?: (progress: number, phase: string) => void
): Promise<{
  imageBase64: string;
  sceneName: string;
  sceneDescription: string;
  apiProvider: string;
  promptUsed: string;
}[]> {
  console.log('🚀 启动飞书多维表格自动化工作流...');
  
  try {
    // 1. 初始化服务
    progressCallback?.(5, '初始化飞书服务');
    feishuTableService.initialize(feishuConfig);

    // 2. 导入分镜数据
    progressCallback?.(10, '导入分镜到飞书表格');
    const recordIds = await feishuTableService.importVideoScriptToTable(
      videoScript, 
      projectId,
      (progress, phase) => progressCallback?.(10 + progress * 0.3, phase)
    );

    // 3. 在表格中生成图片
    progressCallback?.(40, '在飞书表格中生成图片');
    const updatedRecords = await feishuTableService.generateImagesInTable(
      recordIds,
      (progress, phase) => progressCallback?.(40 + progress * 0.5, phase)
    );

    // 4. 同步数据回项目
    progressCallback?.(90, '同步数据回项目');
    const syncedImages = await feishuTableService.syncDataBackToProject(updatedRecords);

    progressCallback?.(100, '飞书工作流完成');
    console.log('✅ 飞书多维表格工作流执行完成');
    
    return syncedImages;

  } catch (error: any) {
    console.error('❌ 飞书工作流执行失败:', error);
    throw new Error(`飞书工作流失败: ${error.message}`);
  }
} 