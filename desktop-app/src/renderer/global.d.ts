// Global type definitions for Electron API
interface ElectronAPI {
  // File operations
  getFiles: () => Promise<any[]>;
  getFile: (id: string) => Promise<any>;
  importFile: () => Promise<{ success: boolean }>;
  importFolder: () => Promise<{ success: boolean }>;
  deleteFile: (id: string) => Promise<void>;
  saveCodeToFile: (code: string, filename: string) => Promise<void>;

  // Analysis operations
  getTemplates: () => Promise<any[]>;
  analyzeFile: (fileId: string, config: any) => Promise<void>;
  getResults: () => Promise<any[]>;
  deleteResult: (id: string) => Promise<void>;
  exportResult: (id: string, format: 'json' | 'html' | 'md') => Promise<void>;

  // Configuration
  getConfig: () => Promise<any>;
  saveConfig: (config: any) => Promise<void>;
  testAIConnection: (config: any) => Promise<{ success: boolean; error?: string }>;

  // Projects
  getProjects: () => Promise<{ projects: any[]; currentProjectId: string }>;
  createProject: (data: { name: string; description: string }) => Promise<void>;
  switchProject: (id: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

interface Window {
  electronAPI: ElectronAPI;
}
