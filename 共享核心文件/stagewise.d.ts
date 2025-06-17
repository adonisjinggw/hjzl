/**
 * Stagewise开发工具栏类型声明
 * 用于为浏览器工具栏提供AI驱动的编辑功能
 */
declare module '@stagewise/toolbar-react' {
  import { FC } from 'react';
  
  export interface StagewiseConfig {
    plugins: any[];
  }
  
  export interface StagewiseToolbarProps {
    config: StagewiseConfig;
  }
  
  export const StagewiseToolbar: FC<StagewiseToolbarProps>;
} 