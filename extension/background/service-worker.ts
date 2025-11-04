// JS Hunter - Background Service Worker

import { database } from '../lib/database';
import {
  generateUUID,
  calculateHash,
  extractDomain,
  analyzeMetadata,
  isJSUrl,
  isJavaScriptContentType,
} from '../lib/utils';
import type {
  JSFile,
  JSFileType,
  Message,
  MessageResponse,
  AnalysisTask,
  UserConfig,
} from '../types/index';

// 初始化数据库
database.init().catch(console.error);

// JS文件缓存（基于hash去重）
const jsFileCache = new Map<string, string>(); // hash -> fileId

// 分析任务队列
const analysisQueue: AnalysisTask[] = [];
let isProcessingQueue = false;

/**
 * 监听Web请求，拦截JS文件
 */
chrome.webRequest.onCompleted.addListener(
  async (details) => {
    try {
      // 只处理成功的请求
      if (details.statusCode !== 200) return;

      // 检查是否为JS文件
      if (!isJSUrl(details.url)) {
        // 检查Content-Type
        const contentType = details.responseHeaders?.find(
          (h) => h.name.toLowerCase() === 'content-type'
        )?.value;

        if (!contentType || !isJavaScriptContentType(contentType)) {
          return;
        }
      }

      // 获取响应内容
      const content = await fetchJSContent(details.url);
      if (!content) return;

      // 创建JS文件对象
      await collectJSFile({
        url: details.url,
        content,
        type: 'external',
        tabId: details.tabId,
        frameId: details.frameId,
        httpHeaders: details.responseHeaders?.reduce(
          (acc, h) => {
            acc[h.name] = h.value || '';
            return acc;
          },
          {} as Record<string, string>
        ),
      });
    } catch (error) {
      console.error('Error intercepting JS file:', error);
    }
  },
  { urls: ['<all_urls>'] },
  ['responseHeaders']
);

/**
 * 获取JS文件内容
 */
async function fetchJSContent(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.text();
  } catch (error) {
    console.error('Error fetching JS content:', error);
    return null;
  }
}

/**
 * 收集JS文件
 */
async function collectJSFile(data: {
  url: string;
  content: string;
  type: JSFileType;
  tabId?: number;
  frameId?: number;
  httpHeaders?: Record<string, string>;
}): Promise<JSFile | null> {
  try {
    const { url, content, type, tabId, frameId, httpHeaders } = data;

    // 计算hash
    const hash = await calculateHash(content);

    // 检查是否已存在（去重）
    if (jsFileCache.has(hash)) {
      console.log('JS file already exists (hash match):', url);
      return null;
    }

    // 分析元数据
    const metadata = analyzeMetadata(content, url);

    // 创建JS文件对象
    const jsFile: JSFile = {
      id: generateUUID(),
      url,
      domain: extractDomain(url),
      type,
      content,
      size: content.length,
      hash,
      timestamp: Date.now(),
      httpHeaders,
      metadata,
      tabId,
      frameId,
    };

    // 保存到数据库
    await database.addJSFile(jsFile);

    // 添加到缓存
    jsFileCache.set(hash, jsFile.id);

    console.log('JS file collected:', jsFile.url);

    // 通知UI更新
    notifyUIUpdate('JS_COLLECTED', jsFile);

    // 检查是否需要自动分析
    const config = await getConfig();
    if (config.analysis.autoAnalyze) {
      // TODO: 创建分析任务
    }

    return jsFile;
  } catch (error) {
    console.error('Error collecting JS file:', error);
    return null;
  }
}

/**
 * 消息处理
 */
chrome.runtime.onMessage.addListener(
  (
    message: Message,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: MessageResponse) => void
  ) => {
    handleMessage(message, sender)
      .then((data) => sendResponse({ success: true, data }))
      .catch((error) =>
        sendResponse({ success: false, error: error.message })
      );

    // 返回true表示异步响应
    return true;
  }
);

/**
 * 处理消息
 */
async function handleMessage(
  message: Message,
  sender: chrome.runtime.MessageSender
): Promise<any> {
  switch (message.type) {
    case 'COLLECT_JS':
      return await handleCollectJS(message.payload, sender);

    case 'GET_FILES':
      return await handleGetFiles(message.payload);

    case 'GET_RESULTS':
      return await handleGetResults(message.payload);

    case 'START_ANALYSIS':
      return await handleStartAnalysis(message.payload);

    case 'GET_CONFIG':
      return await getConfig();

    case 'UPDATE_CONFIG':
      return await updateConfig(message.payload);

    case 'EXPORT_DATA':
      return await handleExportData(message.payload);

    case 'CLEAR_DATA':
      return await handleClearData();

    default:
      throw new Error(`Unknown message type: ${message.type}`);
  }
}

/**
 * 处理收集JS请求
 */
async function handleCollectJS(
  payload: any,
  sender: chrome.runtime.MessageSender
): Promise<any> {
  const { url, content, type } = payload;

  return await collectJSFile({
    url,
    content,
    type,
    tabId: sender.tab?.id,
    frameId: sender.frameId,
  });
}

/**
 * 处理获取文件列表
 */
async function handleGetFiles(payload: any): Promise<JSFile[]> {
  const { domain, projectId } = payload || {};

  if (domain) {
    return await database.getJSFilesByDomain(domain);
  }

  if (projectId) {
    const project = await database.getAllProjects();
    const targetProject = project.find((p) => p.id === projectId);
    if (targetProject) {
      const files = await Promise.all(
        targetProject.jsFileIds.map((id) => database.getJSFile(id))
      );
      return files.filter((f) => f !== null) as JSFile[];
    }
  }

  return await database.getAllJSFiles();
}

/**
 * 处理获取分析结果
 */
async function handleGetResults(payload: any): Promise<any> {
  const { jsFileId } = payload || {};

  if (jsFileId) {
    return await database.getAnalysisResultsByFileId(jsFileId);
  }

  // TODO: 返回所有分析结果
  return [];
}

/**
 * 处理开始分析
 */
async function handleStartAnalysis(payload: any): Promise<any> {
  const { jsFileId, config } = payload;

  // 创建分析任务
  const task: AnalysisTask = {
    id: generateUUID(),
    jsFileId,
    config,
    priority: 'high',
    status: 'pending',
    progress: 0,
    createdAt: Date.now(),
  };

  // 添加到队列
  analysisQueue.push(task);

  // 开始处理队列
  if (!isProcessingQueue) {
    processAnalysisQueue();
  }

  return task;
}

/**
 * 处理分析队列
 */
async function processAnalysisQueue(): Promise<void> {
  if (isProcessingQueue || analysisQueue.length === 0) {
    return;
  }

  isProcessingQueue = true;

  while (analysisQueue.length > 0) {
    // 按优先级排序
    analysisQueue.sort((a, b) => {
      const priorityMap = { high: 3, medium: 2, low: 1 };
      return priorityMap[b.priority] - priorityMap[a.priority];
    });

    const task = analysisQueue.shift();
    if (!task) continue;

    try {
      // 更新任务状态
      task.status = 'running';
      task.startedAt = Date.now();

      // TODO: 执行AI分析
      // const result = await performAIAnalysis(task);

      // 更新任务状态
      task.status = 'completed';
      task.completedAt = Date.now();
      task.progress = 100;

      // 通知UI
      notifyUIUpdate('ANALYSIS_COMPLETE', task);
    } catch (error) {
      console.error('Error processing analysis task:', error);
      task.status = 'failed';
      task.error = (error as Error).message;

      // 通知UI
      notifyUIUpdate('ANALYSIS_COMPLETE', task);
    }
  }

  isProcessingQueue = false;
}

/**
 * 获取配置
 */
async function getConfig(): Promise<UserConfig> {
  const result = await chrome.storage.local.get('config');

  if (result.config) {
    return result.config;
  }

  // 返回默认配置
  const defaultConfig: UserConfig = {
    apiKeys: {},
    collection: {
      autoCollect: true,
      collectInline: true,
      collectDynamic: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      domainWhitelist: [],
      domainBlacklist: [],
    },
    analysis: {
      defaultModel: 'gemini-2.5-flash',
      defaultScenarios: ['api-discovery', 'secret-scan', 'vulnerability-scan'],
      autoAnalyze: false,
      concurrentTasks: 2,
      rateLimit: 10,
    },
    storage: {
      maxStorage: 1024 * 1024 * 1024, // 1GB
      autoCleanup: true,
      cleanupThreshold: 0.9,
      retentionDays: 30,
    },
    ui: {
      theme: 'dark',
      language: 'zh',
      codeTheme: 'monokai',
    },
    advanced: {
      debugMode: false,
      logLevel: 'info',
    },
  };

  await chrome.storage.local.set({ config: defaultConfig });
  return defaultConfig;
}

/**
 * 更新配置
 */
async function updateConfig(config: Partial<UserConfig>): Promise<void> {
  const currentConfig = await getConfig();
  const newConfig = { ...currentConfig, ...config };
  await chrome.storage.local.set({ config: newConfig });
}

/**
 * 处理导出数据
 */
async function handleExportData(payload: any): Promise<any> {
  // TODO: 实现数据导出
  return { message: 'Export not implemented yet' };
}

/**
 * 处理清空数据
 */
async function handleClearData(): Promise<void> {
  await database.clearAllData();
  jsFileCache.clear();
  analysisQueue.length = 0;
}

/**
 * 通知UI更新
 */
function notifyUIUpdate(type: string, data: any): void {
  chrome.runtime.sendMessage({
    type,
    payload: data,
  });
}

/**
 * 扩展安装/更新时初始化
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    console.log('JS Hunter installed');

    // 初始化默认配置
    await getConfig();

    // 初始化内置模板
    const { getBuiltinTemplates } = await import('../lib/analysis-templates');
    const templates = getBuiltinTemplates();

    for (const template of templates) {
      try {
        await database.addAnalysisTemplate(template);
      } catch (error) {
        // 模板可能已存在
        console.log('Template already exists:', template.name);
      }
    }
  } else if (details.reason === 'update') {
    console.log('JS Hunter updated');
  }
});

console.log('JS Hunter Background Service Worker loaded');
