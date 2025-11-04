// JS Hunter - Type Definitions

/**
 * JS文件类型
 */
export type JSFileType = 'external' | 'inline' | 'dynamic' | 'webpack-chunk';

/**
 * JS文件元数据
 */
export interface JSFileMetadata {
  isMinified: boolean;
  isObfuscated: boolean;
  framework?: 'react' | 'vue' | 'angular' | 'svelte' | 'unknown';
  bundler?: 'webpack' | 'rollup' | 'vite' | 'parcel' | 'unknown';
  hasSourceMap: boolean;
  lineCount: number;
  estimatedOriginalSize?: number;
}

/**
 * JS文件数据结构
 */
export interface JSFile {
  id: string;
  url: string;
  domain: string;
  type: JSFileType;
  content: string;
  size: number;
  hash: string;
  sourceMapUrl?: string;
  timestamp: number;
  httpHeaders?: Record<string, string>;
  metadata: JSFileMetadata;
  tabId?: number;
  frameId?: number;
}

/**
 * 分析场景类型
 */
export type AnalysisScenario =
  | 'api-discovery'
  | 'secret-scan'
  | 'auth-analysis'
  | 'crypto-detection'
  | 'vulnerability-scan'
  | 'business-logic'
  | 'hidden-features'
  | 'custom';

/**
 * AI模型类型
 */
export type AIModel = 'gemini-2.5-flash' | 'deepseek-v3' | 'gpt-4.1-mini' | 'custom';

/**
 * 分析模式
 */
export type AnalysisMode = 'quick' | 'deep' | 'chunked';

/**
 * 分析配置
 */
export interface AnalysisConfig {
  mode: AnalysisMode;
  scenarios: AnalysisScenario[];
  model: AIModel;
  customApiEndpoint?: string;
  autoDeobfuscate: boolean;
  useSourceMap: boolean;
  includeComments: boolean;
  analyzeHistory: boolean;
  maxChunkSize?: number;
}

/**
 * API发现结果
 */
export interface APIEndpoint {
  method: string;
  url: string;
  path: string;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  body?: any;
  responseType?: string;
  authType?: string;
  location: {
    line: number;
    column?: number;
    snippet: string;
  };
}

/**
 * 敏感信息发现
 */
export interface SecretFinding {
  type: 'api-key' | 'token' | 'password' | 'connection-string' | 'domain' | 'ip' | 'other';
  value: string;
  riskLevel: 'high' | 'medium' | 'low';
  location: {
    line: number;
    column?: number;
    snippet: string;
  };
  description: string;
  recommendation?: string;
}

/**
 * 漏洞发现
 */
export interface VulnerabilityFinding {
  type: 'xss' | 'injection' | 'prototype-pollution' | 'csrf' | 'weak-crypto' | 'client-validation' | 'other';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  location: {
    line: number;
    column?: number;
    snippet: string;
  };
  exploitation?: string;
  remediation?: string;
  cwe?: string;
  cvss?: number;
}

/**
 * 分析结果
 */
export interface AnalysisResult {
  id: string;
  jsFileId: string;
  analysisType: AnalysisScenario;
  model: AIModel;
  prompt: string;
  rawResponse: string;
  timestamp: number;
  duration: number;
  status: 'success' | 'error' | 'partial';
  error?: string;
  
  // 结构化结果
  apiEndpoints?: APIEndpoint[];
  secrets?: SecretFinding[];
  vulnerabilities?: VulnerabilityFinding[];
  hiddenFeatures?: string[];
  businessLogic?: any;
  cryptoAlgorithms?: any;
  authMechanisms?: any;
  customFindings?: any;
}

/**
 * 分析任务
 */
export interface AnalysisTask {
  id: string;
  jsFileId: string;
  config: AnalysisConfig;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  error?: string;
  resultId?: string;
}

/**
 * 分析模板
 */
export interface AnalysisTemplate {
  id: string;
  name: string;
  description: string;
  category: AnalysisScenario;
  prompt: string;
  isBuiltin: boolean;
  isPublic: boolean;
  author?: string;
  timestamp: number;
  usageCount?: number;
  rating?: number;
}

/**
 * 项目
 */
export interface Project {
  id: string;
  name: string;
  description: string;
  domains: string[];
  jsFileIds: string[];
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

/**
 * 统计数据
 */
export interface Statistics {
  totalJSFiles: number;
  totalSize: number;
  analyzedFiles: number;
  totalFindings: number;
  findingsByType: Record<string, number>;
  findingsBySeverity: Record<string, number>;
  topDomains: Array<{ domain: string; count: number }>;
  recentActivity: Array<{
    timestamp: number;
    type: 'collect' | 'analyze' | 'export';
    description: string;
  }>;
}

/**
 * 用户配置
 */
export interface UserConfig {
  // API配置
  apiKeys: {
    gemini?: string;
    deepseek?: string;
    openai?: string;
    custom?: string;
  };
  customApiEndpoint?: string;
  
  // 收集设置
  collection: {
    autoCollect: boolean;
    collectInline: boolean;
    collectDynamic: boolean;
    maxFileSize: number;
    domainWhitelist: string[];
    domainBlacklist: string[];
  };
  
  // 分析设置
  analysis: {
    defaultModel: AIModel;
    defaultScenarios: AnalysisScenario[];
    autoAnalyze: boolean;
    concurrentTasks: number;
    rateLimit: number;
  };
  
  // 存储设置
  storage: {
    maxStorage: number;
    autoCleanup: boolean;
    cleanupThreshold: number;
    retentionDays: number;
  };
  
  // UI设置
  ui: {
    theme: 'light' | 'dark' | 'auto';
    language: 'en' | 'zh';
    codeTheme: string;
  };
  
  // 高级设置
  advanced: {
    proxyUrl?: string;
    debugMode: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
  };
}

/**
 * 消息类型
 */
export type MessageType =
  | 'COLLECT_JS'
  | 'JS_COLLECTED'
  | 'START_ANALYSIS'
  | 'ANALYSIS_PROGRESS'
  | 'ANALYSIS_COMPLETE'
  | 'GET_FILES'
  | 'GET_RESULTS'
  | 'GET_CONFIG'
  | 'UPDATE_CONFIG'
  | 'EXPORT_DATA'
  | 'CLEAR_DATA';

/**
 * 消息结构
 */
export interface Message<T = any> {
  type: MessageType;
  payload?: T;
  requestId?: string;
}

/**
 * 消息响应
 */
export interface MessageResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  requestId?: string;
}

/**
 * 导出格式
 */
export type ExportFormat = 'json' | 'html' | 'pdf' | 'markdown';

/**
 * 导出选项
 */
export interface ExportOptions {
  format: ExportFormat;
  includeJSFiles: boolean;
  includeAnalysisResults: boolean;
  includeStatistics: boolean;
  projectId?: string;
  fileIds?: string[];
}
