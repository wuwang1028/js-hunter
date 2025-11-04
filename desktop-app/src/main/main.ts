// JS Hunter Desktop - Main Process

import { app, BrowserWindow, dialog, Menu } from 'electron';
import * as path from 'path';
import { DatabaseManager } from './database';
import { AIAnalyzerWrapper } from './ai-analyzer-wrapper';
import { FileManager } from './file-manager';
import { setupIPCHandlers } from './ipc-handlers';

// 数据库管理器
let dbManager: DatabaseManager;
let aiAnalyzer: AIAnalyzerWrapper;
let fileManager: FileManager;

// 主窗口
let mainWindow: BrowserWindow | null = null;

/**
 * 创建主窗口
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    title: 'JS Hunter',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, '../../public/icon.png'),
  });

  // 加载应用
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // 创建菜单
  createMenu();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * 创建应用菜单
 */
function createMenu() {
  const template: any = [
    {
      label: '文件',
      submenu: [
        {
          label: '导入JS文件',
          accelerator: 'CmdOrCtrl+O',
          click: () => handleImportFiles(),
        },
        {
          label: '导入文件夹',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: () => handleImportFolder(),
        },
        { type: 'separator' },
        {
          label: '导出报告',
          accelerator: 'CmdOrCtrl+E',
          click: () => handleExportReport(),
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit(),
        },
      ],
    },
    {
      label: '编辑',
      submenu: [
        { label: '撤销', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: '重做', accelerator: 'CmdOrCtrl+Shift+Z', role: 'redo' },
        { type: 'separator' },
        { label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: '粘贴', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: '全选', accelerator: 'CmdOrCtrl+A', role: 'selectAll' },
      ],
    },
    {
      label: '分析',
      submenu: [
        {
          label: '开始分析',
          accelerator: 'CmdOrCtrl+R',
          click: () => sendToRenderer('start-analysis'),
        },
        {
          label: '停止分析',
          accelerator: 'CmdOrCtrl+.',
          click: () => sendToRenderer('stop-analysis'),
        },
        { type: 'separator' },
        {
          label: '批量分析',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => sendToRenderer('batch-analysis'),
        },
      ],
    },
    {
      label: '视图',
      submenu: [
        { label: '重新加载', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: '强制重新加载', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
        { label: '切换开发者工具', accelerator: 'CmdOrCtrl+Shift+I', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: '实际大小', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { label: '放大', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: '缩小', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { type: 'separator' },
        { label: '全屏', accelerator: 'F11', role: 'togglefullscreen' },
      ],
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '使用文档',
          click: () => {
            // TODO: 打开文档
          },
        },
        {
          label: '关于',
          click: () => {
            dialog.showMessageBox({
              type: 'info',
              title: '关于 JS Hunter',
              message: 'JS Hunter Desktop v1.0.0',
              detail: 'JavaScript Analysis Tool for Penetration Testing\n\n© 2024 JS Hunter Team',
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

/**
 * 发送消息到渲染进程
 */
function sendToRenderer(channel: string, ...args: any[]) {
  if (mainWindow) {
    mainWindow.webContents.send(channel, ...args);
  }
}

/**
 * 处理导入文件
 */
async function handleImportFiles() {
  const result = await dialog.showOpenDialog(mainWindow!, {
    title: '选择JS文件',
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'JavaScript Files', extensions: ['js', 'mjs', 'jsx', 'ts', 'tsx'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    sendToRenderer('files-imported', result.filePaths);
  }
}

/**
 * 处理导入文件夹
 */
async function handleImportFolder() {
  const result = await dialog.showOpenDialog(mainWindow!, {
    title: '选择文件夹',
    properties: ['openDirectory'],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    sendToRenderer('folder-imported', result.filePaths[0]);
  }
}

/**
 * 处理导出报告
 */
async function handleExportReport() {
  const result = await dialog.showSaveDialog(mainWindow!, {
    title: '导出报告',
    defaultPath: `js-hunter-report-${Date.now()}.html`,
    filters: [
      { name: 'HTML Report', extensions: ['html'] },
      { name: 'PDF Report', extensions: ['pdf'] },
      { name: 'JSON Data', extensions: ['json'] },
      { name: 'Markdown', extensions: ['md'] },
    ],
  });

  if (!result.canceled && result.filePath) {
    sendToRenderer('export-report', result.filePath);
  }
}



/**
 * 应用准备就绪
 */
app.whenReady().then(async () => {
  // 初始化数据库
  const userDataPath = app.getPath('userData');
  dbManager = new DatabaseManager(path.join(userDataPath, 'js-hunter.db'));
  await dbManager.init();

  // 初始化AI分析器
  aiAnalyzer = new AIAnalyzerWrapper(dbManager);

  // 初始化文件管理器
  fileManager = new FileManager(dbManager);

  // 设置IPC处理器
  setupIPCHandlers(dbManager, aiAnalyzer, fileManager, () => mainWindow);

  // 创建窗口
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

/**
 * 所有窗口关闭
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * 应用退出前
 */
app.on('before-quit', async () => {
  // 关闭数据库
  if (dbManager) {
    await dbManager.close();
  }
});
