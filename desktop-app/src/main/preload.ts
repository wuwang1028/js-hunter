// JS Hunter Desktop - Preload Script

import { contextBridge, ipcRenderer } from 'electron';

// 暴露API到渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 文件操作
  importFile: () => ipcRenderer.invoke('import-file'),
  importFolder: () => ipcRenderer.invoke('import-folder'),
  getFiles: () => ipcRenderer.invoke('get-files'),
  getFile: (fileId: string) => ipcRenderer.invoke('get-file', fileId),
  deleteFile: (fileId: string) => ipcRenderer.invoke('delete-file', fileId),
  saveCodeToFile: (code: string, filename: string) => ipcRenderer.invoke('save-code-to-file', { code, filename }),

  // 分析操作
  getTemplates: () => ipcRenderer.invoke('get-templates'),
  analyzeFile: (fileId: string, config: any) => ipcRenderer.invoke('analyze-file', { fileId, config }),
  getResults: () => ipcRenderer.invoke('get-results'),
  deleteResult: (resultId: string) => ipcRenderer.invoke('delete-result', resultId),
  exportResult: (resultId: string, format: string) => ipcRenderer.invoke('export-result', { resultId, format }),

  // 配置操作
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config: any) => ipcRenderer.invoke('save-config', config),
  testAIConnection: (config: any) => ipcRenderer.invoke('test-ai-connection', config),

  // 项目管理
  getProjects: () => ipcRenderer.invoke('get-projects'),
  createProject: (data: any) => ipcRenderer.invoke('create-project', data),
  switchProject: (projectId: string) => ipcRenderer.invoke('switch-project', projectId),
  deleteProject: (projectId: string) => ipcRenderer.invoke('delete-project', projectId),

  // 事件监听
  on: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (event, ...args) => callback(...args));
  },

  // 移除监听
  off: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.removeListener(channel, callback);
  },
});

// 类型定义
export interface ElectronAPI {
  // 文件操作
  importFile: () => Promise<any>;
  importFolder: () => Promise<any>;
  getFiles: () => Promise<any>;
  getFile: (fileId: string) => Promise<any>;
  deleteFile: (fileId: string) => Promise<any>;
  saveCodeToFile: (code: string, filename: string) => Promise<any>;
  
  // 分析操作
  getTemplates: () => Promise<any>;
  analyzeFile: (fileId: string, config: any) => Promise<any>;
  getResults: () => Promise<any>;
  deleteResult: (resultId: string) => Promise<any>;
  exportResult: (resultId: string, format: string) => Promise<any>;
  
  // 配置操作
  getConfig: () => Promise<any>;
  saveConfig: (config: any) => Promise<any>;
  testAIConnection: (config: any) => Promise<any>;
  
  // 项目管理
  getProjects: () => Promise<any>;
  createProject: (data: any) => Promise<any>;
  switchProject: (projectId: string) => Promise<any>;
  deleteProject: (projectId: string) => Promise<any>;
  
  // 事件监听
  on: (channel: string, callback: (...args: any[]) => void) => void;
  off: (channel: string, callback: (...args: any[]) => void) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
