// JS Hunter - IndexedDB Database Manager

import type {
  JSFile,
  AnalysisResult,
  AnalysisTemplate,
  Project,
} from '../types/index';

const DB_NAME = 'JSHunterDB';
const DB_VERSION = 1;

// Object Store Names
const STORES = {
  JS_FILES: 'jsFiles',
  ANALYSIS_RESULTS: 'analysisResults',
  ANALYSIS_TEMPLATES: 'analysisTemplates',
  PROJECTS: 'projects',
} as const;

class Database {
  private db: IDBDatabase | null = null;

  /**
   * 初始化数据库
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // JS Files Store
        if (!db.objectStoreNames.contains(STORES.JS_FILES)) {
          const jsFilesStore = db.createObjectStore(STORES.JS_FILES, {
            keyPath: 'id',
          });
          jsFilesStore.createIndex('url', 'url', { unique: false });
          jsFilesStore.createIndex('domain', 'domain', { unique: false });
          jsFilesStore.createIndex('hash', 'hash', { unique: false });
          jsFilesStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Analysis Results Store
        if (!db.objectStoreNames.contains(STORES.ANALYSIS_RESULTS)) {
          const resultsStore = db.createObjectStore(STORES.ANALYSIS_RESULTS, {
            keyPath: 'id',
          });
          resultsStore.createIndex('jsFileId', 'jsFileId', { unique: false });
          resultsStore.createIndex('analysisType', 'analysisType', {
            unique: false,
          });
          resultsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Analysis Templates Store
        if (!db.objectStoreNames.contains(STORES.ANALYSIS_TEMPLATES)) {
          const templatesStore = db.createObjectStore(
            STORES.ANALYSIS_TEMPLATES,
            { keyPath: 'id' }
          );
          templatesStore.createIndex('category', 'category', { unique: false });
          templatesStore.createIndex('isBuiltin', 'isBuiltin', {
            unique: false,
          });
        }

        // Projects Store
        if (!db.objectStoreNames.contains(STORES.PROJECTS)) {
          const projectsStore = db.createObjectStore(STORES.PROJECTS, {
            keyPath: 'id',
          });
          projectsStore.createIndex('timestamp', 'createdAt', { unique: false });
        }
      };
    });
  }

  /**
   * 获取数据库实例
   */
  private getDB(): IDBDatabase {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.db;
  }

  /**
   * 添加JS文件
   */
  async addJSFile(file: JSFile): Promise<void> {
    const db = this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.JS_FILES], 'readwrite');
      const store = transaction.objectStore(STORES.JS_FILES);
      const request = store.add(file);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 更新JS文件
   */
  async updateJSFile(file: JSFile): Promise<void> {
    const db = this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.JS_FILES], 'readwrite');
      const store = transaction.objectStore(STORES.JS_FILES);
      const request = store.put(file);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 根据ID获取JS文件
   */
  async getJSFile(id: string): Promise<JSFile | null> {
    const db = this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.JS_FILES], 'readonly');
      const store = transaction.objectStore(STORES.JS_FILES);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 根据hash查找JS文件
   */
  async getJSFileByHash(hash: string): Promise<JSFile | null> {
    const db = this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.JS_FILES], 'readonly');
      const store = transaction.objectStore(STORES.JS_FILES);
      const index = store.index('hash');
      const request = index.get(hash);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 获取所有JS文件
   */
  async getAllJSFiles(): Promise<JSFile[]> {
    const db = this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.JS_FILES], 'readonly');
      const store = transaction.objectStore(STORES.JS_FILES);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 根据域名获取JS文件
   */
  async getJSFilesByDomain(domain: string): Promise<JSFile[]> {
    const db = this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.JS_FILES], 'readonly');
      const store = transaction.objectStore(STORES.JS_FILES);
      const index = store.index('domain');
      const request = index.getAll(domain);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 删除JS文件
   */
  async deleteJSFile(id: string): Promise<void> {
    const db = this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.JS_FILES], 'readwrite');
      const store = transaction.objectStore(STORES.JS_FILES);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 添加分析结果
   */
  async addAnalysisResult(result: AnalysisResult): Promise<void> {
    const db = this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.ANALYSIS_RESULTS], 'readwrite');
      const store = transaction.objectStore(STORES.ANALYSIS_RESULTS);
      const request = store.add(result);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 获取分析结果
   */
  async getAnalysisResult(id: string): Promise<AnalysisResult | null> {
    const db = this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.ANALYSIS_RESULTS], 'readonly');
      const store = transaction.objectStore(STORES.ANALYSIS_RESULTS);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 根据JS文件ID获取分析结果
   */
  async getAnalysisResultsByFileId(jsFileId: string): Promise<AnalysisResult[]> {
    const db = this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.ANALYSIS_RESULTS], 'readonly');
      const store = transaction.objectStore(STORES.ANALYSIS_RESULTS);
      const index = store.index('jsFileId');
      const request = index.getAll(jsFileId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 添加分析模板
   */
  async addAnalysisTemplate(template: AnalysisTemplate): Promise<void> {
    const db = this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.ANALYSIS_TEMPLATES], 'readwrite');
      const store = transaction.objectStore(STORES.ANALYSIS_TEMPLATES);
      const request = store.add(template);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 获取所有分析模板
   */
  async getAllAnalysisTemplates(): Promise<AnalysisTemplate[]> {
    const db = this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.ANALYSIS_TEMPLATES], 'readonly');
      const store = transaction.objectStore(STORES.ANALYSIS_TEMPLATES);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 添加项目
   */
  async addProject(project: Project): Promise<void> {
    const db = this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.PROJECTS], 'readwrite');
      const store = transaction.objectStore(STORES.PROJECTS);
      const request = store.add(project);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 获取所有项目
   */
  async getAllProjects(): Promise<Project[]> {
    const db = this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.PROJECTS], 'readonly');
      const store = transaction.objectStore(STORES.PROJECTS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 获取数据库统计信息
   */
  async getStatistics(): Promise<{
    jsFilesCount: number;
    analysisResultsCount: number;
    templatesCount: number;
    projectsCount: number;
  }> {
    const db = this.getDB();
    
    const getCount = (storeName: string): Promise<number> => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.count();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    };

    const [jsFilesCount, analysisResultsCount, templatesCount, projectsCount] =
      await Promise.all([
        getCount(STORES.JS_FILES),
        getCount(STORES.ANALYSIS_RESULTS),
        getCount(STORES.ANALYSIS_TEMPLATES),
        getCount(STORES.PROJECTS),
      ]);

    return {
      jsFilesCount,
      analysisResultsCount,
      templatesCount,
      projectsCount,
    };
  }

  /**
   * 清空所有数据
   */
  async clearAllData(): Promise<void> {
    const db = this.getDB();
    const storeNames = [
      STORES.JS_FILES,
      STORES.ANALYSIS_RESULTS,
      STORES.ANALYSIS_TEMPLATES,
      STORES.PROJECTS,
    ];

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeNames, 'readwrite');

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);

      for (const storeName of storeNames) {
        transaction.objectStore(storeName).clear();
      }
    });
  }

  /**
   * 关闭数据库连接
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// 导出单例实例
export const database = new Database();
