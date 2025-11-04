// JS Hunter Desktop - IPC Handlers

import { ipcMain, dialog, BrowserWindow } from 'electron';
import { DatabaseManager } from './database';
import { AIAnalyzerWrapper } from './ai-analyzer-wrapper';
import { FileManager } from './file-manager';
import { getAnalysisTemplates } from '../shared/analysis-templates';

export function setupIPCHandlers(
  dbManager: DatabaseManager,
  aiAnalyzer: AIAnalyzerWrapper,
  fileManager: FileManager,
  getMainWindow: () => BrowserWindow | null
) {
  // ==================== 文件操作 ====================

  // 导入单个文件
  ipcMain.handle('import-file', async () => {
    const mainWindow = getMainWindow();
    if (!mainWindow) return { success: false, error: 'No main window' };

    const result = await dialog.showOpenDialog(mainWindow, {
      title: '选择JS文件',
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'JavaScript Files', extensions: ['js', 'mjs', 'jsx', 'ts', 'tsx'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, error: 'Canceled' };
    }

    try {
      const files = await fileManager.importFiles(result.filePaths);
      return { success: true, data: files };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 导入文件夹
  ipcMain.handle('import-folder', async () => {
    const mainWindow = getMainWindow();
    if (!mainWindow) return { success: false, error: 'No main window' };

    const result = await dialog.showOpenDialog(mainWindow, {
      title: '选择文件夹',
      properties: ['openDirectory'],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, error: 'Canceled' };
    }

    try {
      const files = await fileManager.importFolder(result.filePaths[0]);
      return { success: true, data: files };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 获取所有文件
  ipcMain.handle('get-files', async () => {
    try {
      const files = dbManager.getAllJSFiles();
      return files;
    } catch (error: any) {
      console.error('Failed to get files:', error);
      return [];
    }
  });

  // 获取单个文件
  ipcMain.handle('get-file', async (event, fileId: string) => {
    try {
      const file = dbManager.getJSFile(fileId);
      return file;
    } catch (error: any) {
      console.error('Failed to get file:', error);
      return null;
    }
  });

  // 删除文件
  ipcMain.handle('delete-file', async (event, fileId: string) => {
    try {
      dbManager.deleteJSFile(fileId);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 保存代码到文件
  ipcMain.handle('save-code-to-file', async (event, payload: { code: string; filename: string }) => {
    const mainWindow = getMainWindow();
    if (!mainWindow) return { success: false, error: 'No main window' };

    const result = await dialog.showSaveDialog(mainWindow, {
      title: '保存文件',
      defaultPath: payload.filename,
      filters: [
        { name: 'JavaScript Files', extensions: ['js'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });

    if (result.canceled || !result.filePath) {
      return { success: false, error: 'Canceled' };
    }

    try {
      const fs = require('fs');
      fs.writeFileSync(result.filePath, payload.code, 'utf-8');
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // ==================== 分析操作 ====================

  // 获取分析模板
  ipcMain.handle('get-templates', async () => {
    try {
      const templates = getAnalysisTemplates();
      return templates;
    } catch (error: any) {
      console.error('Failed to get templates:', error);
      return [];
    }
  });

  // 分析文件
  ipcMain.handle('analyze-file', async (event, payload: { fileId: string; config: any }) => {
    try {
      const { fileId, config } = payload;
      const file = dbManager.getJSFile(fileId);
      
      if (!file) {
        throw new Error('File not found');
      }

      // 获取模板
      const template = getAnalysisTemplates().find(t => t.id === config.templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // 执行分析
      const result = await aiAnalyzer.analyzeCode(file.content, template.prompt, {
        fileName: file.url,
        fileSize: file.size,
        metadata: file.metadata,
      });

      // 保存结果
      const resultId = dbManager.saveAnalysisResult({
        fileId: file.id,
        fileName: file.url,
        templateId: template.id,
        templateName: template.name,
        result: JSON.stringify(result),
        analyzedAt: Date.now(),
      });

      return { success: true, data: { id: resultId, ...result } };
    } catch (error: any) {
      console.error('Analysis failed:', error);
      return { success: false, error: error.message };
    }
  });

  // 获取所有分析结果
  ipcMain.handle('get-results', async () => {
    try {
      const results = dbManager.getAllAnalysisResults();
      return results.map(r => ({
        ...r,
        findings: JSON.parse(r.result || '[]'),
        summary: JSON.parse(r.result || '{}').summary || '',
      }));
    } catch (error: any) {
      console.error('Failed to get results:', error);
      return [];
    }
  });

  // 删除分析结果
  ipcMain.handle('delete-result', async (event, resultId: string) => {
    try {
      dbManager.deleteAnalysisResult(resultId);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 导出分析结果
  ipcMain.handle('export-result', async (event, payload: { resultId: string; format: string }) => {
    const mainWindow = getMainWindow();
    if (!mainWindow) return { success: false, error: 'No main window' };

    const { resultId, format } = payload;

    const result = await dialog.showSaveDialog(mainWindow, {
      title: '导出结果',
      defaultPath: `analysis-result-${Date.now()}.${format}`,
      filters: [
        { name: 'JSON', extensions: ['json'] },
        { name: 'HTML', extensions: ['html'] },
        { name: 'Markdown', extensions: ['md'] },
      ],
    });

    if (result.canceled || !result.filePath) {
      return { success: false, error: 'Canceled' };
    }

    try {
      await fileManager.exportResult(resultId, result.filePath, format);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // ==================== 配置操作 ====================

  // 获取配置
  ipcMain.handle('get-config', async () => {
    try {
      const config = dbManager.getConfig();
      return config || {
        aiProvider: 'gemini',
        apiKey: '',
        apiUrl: '',
        maxTokens: 4096,
        temperature: 0.7,
        concurrency: 2,
        chunkSize: 8000,
      };
    } catch (error: any) {
      console.error('Failed to get config:', error);
      return null;
    }
  });

  // 保存配置
  ipcMain.handle('save-config', async (event, config: any) => {
    try {
      dbManager.saveConfig(config);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 测试AI连接
  ipcMain.handle('test-ai-connection', async (event, config: any) => {
    try {
      const testResult = await aiAnalyzer.testConnection(config);
      return testResult;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // ==================== 项目管理 ====================

  // 获取所有项目
  ipcMain.handle('get-projects', async () => {
    try {
      const projects = dbManager.getAllProjects();
      const currentProjectId = dbManager.getCurrentProjectId();
      return {
        projects: projects.map(p => ({
          ...p,
          fileCount: dbManager.getProjectFileCount(p.id),
          resultCount: dbManager.getProjectResultCount(p.id),
        })),
        currentProjectId,
      };
    } catch (error: any) {
      console.error('Failed to get projects:', error);
      return { projects: [], currentProjectId: null };
    }
  });

  // 创建项目
  ipcMain.handle('create-project', async (event, data: { name: string; description: string }) => {
    try {
      const projectId = dbManager.createProject(data.name, data.description);
      return { success: true, data: { id: projectId } };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 切换项目
  ipcMain.handle('switch-project', async (event, projectId: string) => {
    try {
      dbManager.switchProject(projectId);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 删除项目
  ipcMain.handle('delete-project', async (event, projectId: string) => {
    try {
      dbManager.deleteProject(projectId);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
}
