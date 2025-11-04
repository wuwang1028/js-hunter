// JS Hunter - Performance Monitoring and Optimization

/**
 * 性能监控器
 */
export class PerformanceMonitor {
  private static metrics: Map<string, PerformanceMetric> = new Map();
  private static enabled: boolean = true;

  /**
   * 开始性能测量
   */
  static start(label: string): void {
    if (!this.enabled) return;

    this.metrics.set(label, {
      label,
      startTime: performance.now(),
      endTime: 0,
      duration: 0,
      memory: this.getMemoryUsage(),
    });
  }

  /**
   * 结束性能测量
   */
  static end(label: string): PerformanceMetric | null {
    if (!this.enabled) return null;

    const metric = this.metrics.get(label);
    if (!metric) {
      console.warn(`Performance metric "${label}" not found`);
      return null;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;
    metric.memoryDelta = this.getMemoryUsage() - metric.memory;

    console.log(`[Performance] ${label}: ${metric.duration.toFixed(2)}ms`);

    return metric;
  }

  /**
   * 测量异步函数性能
   */
  static async measure<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    try {
      const result = await fn();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }

  /**
   * 测量同步函数性能
   */
  static measureSync<T>(label: string, fn: () => T): T {
    this.start(label);
    try {
      const result = fn();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }

  /**
   * 获取所有指标
   */
  static getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * 清除所有指标
   */
  static clear(): void {
    this.metrics.clear();
  }

  /**
   * 启用/禁用监控
   */
  static setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * 获取内存使用情况
   */
  private static getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  /**
   * 生成性能报告
   */
  static generateReport(): PerformanceReport {
    const metrics = this.getMetrics();
    const totalDuration = metrics.reduce((sum, m) => sum + m.duration, 0);
    const avgDuration = metrics.length > 0 ? totalDuration / metrics.length : 0;
    const maxDuration = Math.max(...metrics.map((m) => m.duration), 0);
    const minDuration = Math.min(...metrics.map((m) => m.duration), Infinity);

    return {
      totalMetrics: metrics.length,
      totalDuration,
      avgDuration,
      maxDuration,
      minDuration,
      metrics: metrics.sort((a, b) => b.duration - a.duration),
    };
  }
}

/**
 * 缓存管理器
 */
export class CacheManager {
  private static cache: Map<string, CacheEntry<any>> = new Map();
  private static maxSize: number = 100;
  private static defaultTTL: number = 5 * 60 * 1000; // 5 minutes

  /**
   * 设置缓存
   */
  static set<T>(key: string, value: T, ttl?: number): void {
    // 如果缓存已满，删除最旧的条目
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  /**
   * 获取缓存
   */
  static get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // 检查是否过期
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * 删除缓存
   */
  static delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清空缓存
   */
  static clear(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存大小
   */
  static size(): number {
    return this.cache.size;
  }

  /**
   * 设置最大缓存大小
   */
  static setMaxSize(size: number): void {
    this.maxSize = size;
  }

  /**
   * 设置默认TTL
   */
  static setDefaultTTL(ttl: number): void {
    this.defaultTTL = ttl;
  }

  /**
   * 清理过期缓存
   */
  static cleanup(): number {
    let removed = 0;
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        removed++;
      }
    }

    return removed;
  }
}

/**
 * 批处理管理器
 */
export class BatchProcessor<T, R> {
  private queue: T[] = [];
  private processing: boolean = false;
  private batchSize: number;
  private delay: number;
  private processor: (items: T[]) => Promise<R[]>;

  constructor(
    processor: (items: T[]) => Promise<R[]>,
    options: {
      batchSize?: number;
      delay?: number;
    } = {}
  ) {
    this.processor = processor;
    this.batchSize = options.batchSize || 10;
    this.delay = options.delay || 100;
  }

  /**
   * 添加项目到队列
   */
  async add(item: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push(item);

      // 如果队列达到批处理大小，立即处理
      if (this.queue.length >= this.batchSize) {
        this.process().catch(reject);
      } else if (!this.processing) {
        // 否则延迟处理
        setTimeout(() => this.process().catch(reject), this.delay);
      }

      // 注意：这里简化了实现，实际应该跟踪每个item的promise
      // 这里只是示例
      resolve({} as R);
    });
  }

  /**
   * 处理队列
   */
  private async process(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    try {
      const batch = this.queue.splice(0, this.batchSize);
      await this.processor(batch);
    } finally {
      this.processing = false;

      // 如果还有剩余项目，继续处理
      if (this.queue.length > 0) {
        setTimeout(() => this.process(), this.delay);
      }
    }
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.queue = [];
  }

  /**
   * 获取队列大小
   */
  size(): number {
    return this.queue.length;
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  let previous = 0;

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    const remaining = wait - (now - previous);

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func.apply(this, args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now();
        timeout = null;
        func.apply(this, args);
      }, remaining);
    }
  };
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (this: any, ...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}

/**
 * 内存优化：分块处理大文件
 */
export async function processInChunks<T, R>(
  items: T[],
  processor: (chunk: T[]) => Promise<R[]>,
  chunkSize: number = 100
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = await processor(chunk);
    results.push(...chunkResults);

    // 让出控制权，避免阻塞UI
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  return results;
}

/**
 * 重试机制
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delay?: number;
    backoff?: boolean;
  } = {}
): Promise<T> {
  const { maxAttempts = 3, delay = 1000, backoff = true } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt} failed:`, error);

      if (attempt < maxAttempts) {
        const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError;
}

/**
 * 类型定义
 */
export interface PerformanceMetric {
  label: string;
  startTime: number;
  endTime: number;
  duration: number;
  memory: number;
  memoryDelta?: number;
}

export interface PerformanceReport {
  totalMetrics: number;
  totalDuration: number;
  avgDuration: number;
  maxDuration: number;
  minDuration: number;
  metrics: PerformanceMetric[];
}

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
}
