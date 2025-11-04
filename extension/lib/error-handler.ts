// JS Hunter - Error Handling and Logging

/**
 * 错误级别
 */
export enum ErrorLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

/**
 * 错误类别
 */
export enum ErrorCategory {
  NETWORK = 'network',
  PARSING = 'parsing',
  ANALYSIS = 'analysis',
  STORAGE = 'storage',
  PERMISSION = 'permission',
  VALIDATION = 'validation',
  UNKNOWN = 'unknown',
}

/**
 * 自定义错误类
 */
export class JSHunterError extends Error {
  public readonly level: ErrorLevel;
  public readonly category: ErrorCategory;
  public readonly timestamp: number;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    level: ErrorLevel = ErrorLevel.ERROR,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = 'JSHunterError';
    this.level = level;
    this.category = category;
    this.timestamp = Date.now();
    this.context = context;

    // 保持正确的原型链
    Object.setPrototypeOf(this, JSHunterError.prototype);
  }

  /**
   * 转换为JSON
   */
  toJSON(): ErrorLog {
    return {
      name: this.name,
      message: this.message,
      level: this.level,
      category: this.category,
      timestamp: this.timestamp,
      stack: this.stack,
      context: this.context,
    };
  }
}

/**
 * 错误处理器
 */
export class ErrorHandler {
  private static logs: ErrorLog[] = [];
  private static maxLogs: number = 1000;
  private static listeners: Map<ErrorLevel, ErrorListener[]> = new Map();

  /**
   * 处理错误
   */
  static handle(error: Error | JSHunterError, context?: Record<string, any>): void {
    let errorLog: ErrorLog;

    if (error instanceof JSHunterError) {
      errorLog = error.toJSON();
    } else {
      errorLog = {
        name: error.name,
        message: error.message,
        level: ErrorLevel.ERROR,
        category: ErrorCategory.UNKNOWN,
        timestamp: Date.now(),
        stack: error.stack,
        context,
      };
    }

    // 添加到日志
    this.addLog(errorLog);

    // 触发监听器
    this.notifyListeners(errorLog);

    // 根据级别输出到控制台
    this.logToConsole(errorLog);
  }

  /**
   * 记录日志
   */
  static log(
    message: string,
    level: ErrorLevel = ErrorLevel.INFO,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    context?: Record<string, any>
  ): void {
    const log: ErrorLog = {
      name: 'Log',
      message,
      level,
      category,
      timestamp: Date.now(),
      context,
    };

    this.addLog(log);
    this.notifyListeners(log);
    this.logToConsole(log);
  }

  /**
   * 添加日志
   */
  private static addLog(log: ErrorLog): void {
    this.logs.push(log);

    // 如果超过最大数量，删除最旧的
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  /**
   * 输出到控制台
   */
  private static logToConsole(log: ErrorLog): void {
    const prefix = `[JS Hunter] [${log.level.toUpperCase()}] [${log.category}]`;
    const message = `${prefix} ${log.message}`;

    switch (log.level) {
      case ErrorLevel.DEBUG:
        console.debug(message, log.context);
        break;
      case ErrorLevel.INFO:
        console.info(message, log.context);
        break;
      case ErrorLevel.WARN:
        console.warn(message, log.context);
        break;
      case ErrorLevel.ERROR:
      case ErrorLevel.FATAL:
        console.error(message, log.context);
        if (log.stack) {
          console.error(log.stack);
        }
        break;
    }
  }

  /**
   * 添加监听器
   */
  static addListener(level: ErrorLevel, listener: ErrorListener): void {
    if (!this.listeners.has(level)) {
      this.listeners.set(level, []);
    }
    this.listeners.get(level)!.push(listener);
  }

  /**
   * 移除监听器
   */
  static removeListener(level: ErrorLevel, listener: ErrorListener): void {
    const listeners = this.listeners.get(level);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 通知监听器
   */
  private static notifyListeners(log: ErrorLog): void {
    const listeners = this.listeners.get(log.level);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(log);
        } catch (error) {
          console.error('Error in error listener:', error);
        }
      });
    }
  }

  /**
   * 获取所有日志
   */
  static getLogs(filter?: {
    level?: ErrorLevel;
    category?: ErrorCategory;
    startTime?: number;
    endTime?: number;
  }): ErrorLog[] {
    let logs = this.logs;

    if (filter) {
      logs = logs.filter((log) => {
        if (filter.level && log.level !== filter.level) return false;
        if (filter.category && log.category !== filter.category) return false;
        if (filter.startTime && log.timestamp < filter.startTime) return false;
        if (filter.endTime && log.timestamp > filter.endTime) return false;
        return true;
      });
    }

    return logs;
  }

  /**
   * 清除日志
   */
  static clearLogs(): void {
    this.logs = [];
  }

  /**
   * 设置最大日志数量
   */
  static setMaxLogs(max: number): void {
    this.maxLogs = max;
  }

  /**
   * 导出日志
   */
  static exportLogs(format: 'json' | 'text' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.logs, null, 2);
    } else {
      return this.logs
        .map((log) => {
          const time = new Date(log.timestamp).toISOString();
          return `[${time}] [${log.level.toUpperCase()}] [${log.category}] ${log.message}`;
        })
        .join('\n');
    }
  }

  /**
   * 包装异步函数以自动处理错误
   */
  static async wrapAsync<T>(
    fn: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T | null> {
    try {
      return await fn();
    } catch (error) {
      this.handle(error as Error, context);
      return null;
    }
  }

  /**
   * 包装同步函数以自动处理错误
   */
  static wrapSync<T>(fn: () => T, context?: Record<string, any>): T | null {
    try {
      return fn();
    } catch (error) {
      this.handle(error as Error, context);
      return null;
    }
  }
}

/**
 * 全局错误捕获
 */
export function setupGlobalErrorHandlers(): void {
  // 捕获未处理的Promise拒绝
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      ErrorHandler.handle(
        new JSHunterError(
          `Unhandled Promise Rejection: ${event.reason}`,
          ErrorLevel.ERROR,
          ErrorCategory.UNKNOWN,
          { reason: event.reason }
        )
      );
    });

    // 捕获全局错误
    window.addEventListener('error', (event) => {
      ErrorHandler.handle(
        new JSHunterError(
          event.message,
          ErrorLevel.ERROR,
          ErrorCategory.UNKNOWN,
          {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          }
        )
      );
    });
  }
}

/**
 * 创建特定类别的错误
 */
export function createNetworkError(message: string, context?: Record<string, any>): JSHunterError {
  return new JSHunterError(message, ErrorLevel.ERROR, ErrorCategory.NETWORK, context);
}

export function createParsingError(message: string, context?: Record<string, any>): JSHunterError {
  return new JSHunterError(message, ErrorLevel.ERROR, ErrorCategory.PARSING, context);
}

export function createAnalysisError(
  message: string,
  context?: Record<string, any>
): JSHunterError {
  return new JSHunterError(message, ErrorLevel.ERROR, ErrorCategory.ANALYSIS, context);
}

export function createStorageError(message: string, context?: Record<string, any>): JSHunterError {
  return new JSHunterError(message, ErrorLevel.ERROR, ErrorCategory.STORAGE, context);
}

export function createPermissionError(
  message: string,
  context?: Record<string, any>
): JSHunterError {
  return new JSHunterError(message, ErrorLevel.ERROR, ErrorCategory.PERMISSION, context);
}

export function createValidationError(
  message: string,
  context?: Record<string, any>
): JSHunterError {
  return new JSHunterError(message, ErrorLevel.ERROR, ErrorCategory.VALIDATION, context);
}

/**
 * 类型定义
 */
export interface ErrorLog {
  name: string;
  message: string;
  level: ErrorLevel;
  category: ErrorCategory;
  timestamp: number;
  stack?: string;
  context?: Record<string, any>;
}

export type ErrorListener = (log: ErrorLog) => void;

/**
 * 验证工具
 */
export class Validator {
  /**
   * 验证必需字段
   */
  static required<T>(value: T | null | undefined, fieldName: string): T {
    if (value === null || value === undefined) {
      throw createValidationError(`${fieldName} is required`);
    }
    return value;
  }

  /**
   * 验证字符串
   */
  static string(value: any, fieldName: string, options?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  }): string {
    if (typeof value !== 'string') {
      throw createValidationError(`${fieldName} must be a string`);
    }

    if (options?.minLength && value.length < options.minLength) {
      throw createValidationError(
        `${fieldName} must be at least ${options.minLength} characters`
      );
    }

    if (options?.maxLength && value.length > options.maxLength) {
      throw createValidationError(
        `${fieldName} must be at most ${options.maxLength} characters`
      );
    }

    if (options?.pattern && !options.pattern.test(value)) {
      throw createValidationError(`${fieldName} does not match required pattern`);
    }

    return value;
  }

  /**
   * 验证数字
   */
  static number(value: any, fieldName: string, options?: {
    min?: number;
    max?: number;
    integer?: boolean;
  }): number {
    if (typeof value !== 'number' || isNaN(value)) {
      throw createValidationError(`${fieldName} must be a number`);
    }

    if (options?.integer && !Number.isInteger(value)) {
      throw createValidationError(`${fieldName} must be an integer`);
    }

    if (options?.min !== undefined && value < options.min) {
      throw createValidationError(`${fieldName} must be at least ${options.min}`);
    }

    if (options?.max !== undefined && value > options.max) {
      throw createValidationError(`${fieldName} must be at most ${options.max}`);
    }

    return value;
  }

  /**
   * 验证URL
   */
  static url(value: any, fieldName: string): string {
    if (typeof value !== 'string') {
      throw createValidationError(`${fieldName} must be a string`);
    }

    try {
      new URL(value);
      return value;
    } catch {
      throw createValidationError(`${fieldName} must be a valid URL`);
    }
  }

  /**
   * 验证枚举
   */
  static enum<T>(value: any, fieldName: string, allowedValues: T[]): T {
    if (!allowedValues.includes(value)) {
      throw createValidationError(
        `${fieldName} must be one of: ${allowedValues.join(', ')}`
      );
    }
    return value;
  }
}
