// JS Hunter Desktop - Database Manager (SQLite)

import Database from 'better-sqlite3';
import type { JSFile, AnalysisResult, AnalysisTemplate, Project, UserConfig } from '../shared/types';

export class DatabaseManager {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
  }

  /**
   * 初始化数据库
   */
  async init(): Promise<void> {
    // 创建表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS js_files (
        id TEXT PRIMARY KEY,
        url TEXT,
        domain TEXT,
        type TEXT,
        content TEXT,
        size INTEGER,
        hash TEXT UNIQUE,
        source_map_url TEXT,
        timestamp INTEGER,
        http_headers TEXT,
        metadata TEXT,
        file_path TEXT
      );

      CREATE TABLE IF NOT EXISTS analysis_results (
        id TEXT PRIMARY KEY,
        js_file_id TEXT,
        analysis_type TEXT,
        model TEXT,
        prompt TEXT,
        raw_response TEXT,
        timestamp INTEGER,
        duration INTEGER,
        status TEXT,
        error TEXT,
        api_endpoints TEXT,
        secrets TEXT,
        vulnerabilities TEXT,
        hidden_features TEXT,
        business_logic TEXT,
        crypto_algorithms TEXT,
        auth_mechanisms TEXT,
        custom_findings TEXT,
        FOREIGN KEY (js_file_id) REFERENCES js_files(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS analysis_templates (
        id TEXT PRIMARY KEY,
        name TEXT,
        description TEXT,
        category TEXT,
        prompt TEXT,
        is_builtin INTEGER,
        is_public INTEGER,
        author TEXT,
        timestamp INTEGER,
        usage_count INTEGER,
        rating REAL
      );

      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT,
        description TEXT,
        domains TEXT,
        js_file_ids TEXT,
        tags TEXT,
        created_at INTEGER,
        updated_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY,
        value TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_js_files_domain ON js_files(domain);
      CREATE INDEX IF NOT EXISTS idx_js_files_hash ON js_files(hash);
      CREATE INDEX IF NOT EXISTS idx_analysis_results_js_file_id ON analysis_results(js_file_id);
      CREATE INDEX IF NOT EXISTS idx_analysis_results_type ON analysis_results(analysis_type);
    `);

    // 初始化默认配置
    await this.initDefaultConfig();
  }

  /**
   * 初始化默认配置
   */
  private async initDefaultConfig(): Promise<void> {
    const defaultConfig: UserConfig = {
      apiKeys: {},
      collection: {
        autoCollect: false,
        collectInline: true,
        collectDynamic: true,
        maxFileSize: 10 * 1024 * 1024,
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
        maxStorage: 1024 * 1024 * 1024,
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

    const existing = this.db.prepare('SELECT value FROM config WHERE key = ?').get('user_config');
    if (!existing) {
      this.db.prepare('INSERT INTO config (key, value) VALUES (?, ?)').run(
        'user_config',
        JSON.stringify(defaultConfig)
      );
    }
  }

  /**
   * 添加JS文件
   */
  async addJSFile(file: JSFile): Promise<void> {
    this.db.prepare(`
      INSERT INTO js_files (
        id, url, domain, type, content, size, hash, source_map_url,
        timestamp, http_headers, metadata, file_path
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      file.id,
      file.url,
      file.domain,
      file.type,
      file.content,
      file.size,
      file.hash,
      file.sourceMapUrl || null,
      file.timestamp,
      JSON.stringify(file.httpHeaders || {}),
      JSON.stringify(file.metadata),
      (file as any).filePath || null
    );
  }

  /**
   * 获取JS文件
   */
  async getJSFile(id: string): Promise<JSFile | null> {
    const row: any = this.db.prepare('SELECT * FROM js_files WHERE id = ?').get(id);
    if (!row) return null;

    return {
      id: row.id,
      url: row.url,
      domain: row.domain,
      type: row.type,
      content: row.content,
      size: row.size,
      hash: row.hash,
      sourceMapUrl: row.source_map_url,
      timestamp: row.timestamp,
      httpHeaders: JSON.parse(row.http_headers || '{}'),
      metadata: JSON.parse(row.metadata),
      filePath: row.file_path,
    } as JSFile;
  }

  /**
   * 根据hash查找JS文件
   */
  async getJSFileByHash(hash: string): Promise<JSFile | null> {
    const row: any = this.db.prepare('SELECT * FROM js_files WHERE hash = ?').get(hash);
    if (!row) return null;

    return this.getJSFile(row.id);
  }

  /**
   * 获取所有JS文件
   */
  async getAllJSFiles(): Promise<JSFile[]> {
    const rows: any[] = this.db.prepare('SELECT * FROM js_files ORDER BY timestamp DESC').all();
    return Promise.all(rows.map(row => this.getJSFile(row.id)!));
  }

  /**
   * 删除JS文件
   */
  async deleteJSFile(id: string): Promise<void> {
    this.db.prepare('DELETE FROM js_files WHERE id = ?').run(id);
  }

  /**
   * 添加分析结果
   */
  async addAnalysisResult(result: AnalysisResult): Promise<void> {
    this.db.prepare(`
      INSERT INTO analysis_results (
        id, js_file_id, analysis_type, model, prompt, raw_response,
        timestamp, duration, status, error, api_endpoints, secrets,
        vulnerabilities, hidden_features, business_logic, crypto_algorithms,
        auth_mechanisms, custom_findings
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      result.id,
      result.jsFileId,
      result.analysisType,
      result.model,
      result.prompt,
      result.rawResponse,
      result.timestamp,
      result.duration,
      result.status,
      result.error || null,
      JSON.stringify(result.apiEndpoints || []),
      JSON.stringify(result.secrets || []),
      JSON.stringify(result.vulnerabilities || []),
      JSON.stringify(result.hiddenFeatures || []),
      JSON.stringify(result.businessLogic || {}),
      JSON.stringify(result.cryptoAlgorithms || {}),
      JSON.stringify(result.authMechanisms || {}),
      JSON.stringify(result.customFindings || {})
    );
  }

  /**
   * 获取分析结果
   */
  async getAnalysisResultsByFileId(jsFileId: string): Promise<AnalysisResult[]> {
    const rows: any[] = this.db.prepare(
      'SELECT * FROM analysis_results WHERE js_file_id = ? ORDER BY timestamp DESC'
    ).all(jsFileId);

    return rows.map(row => ({
      id: row.id,
      jsFileId: row.js_file_id,
      analysisType: row.analysis_type,
      model: row.model,
      prompt: row.prompt,
      rawResponse: row.raw_response,
      timestamp: row.timestamp,
      duration: row.duration,
      status: row.status,
      error: row.error,
      apiEndpoints: JSON.parse(row.api_endpoints || '[]'),
      secrets: JSON.parse(row.secrets || '[]'),
      vulnerabilities: JSON.parse(row.vulnerabilities || '[]'),
      hiddenFeatures: JSON.parse(row.hidden_features || '[]'),
      businessLogic: JSON.parse(row.business_logic || '{}'),
      cryptoAlgorithms: JSON.parse(row.crypto_algorithms || '{}'),
      authMechanisms: JSON.parse(row.auth_mechanisms || '{}'),
      customFindings: JSON.parse(row.custom_findings || '{}'),
    }));
  }

  /**
   * 获取配置
   */
  async getConfig(): Promise<UserConfig> {
    const row: any = this.db.prepare('SELECT value FROM config WHERE key = ?').get('user_config');
    return JSON.parse(row.value);
  }

  /**
   * 更新配置
   */
  async updateConfig(config: Partial<UserConfig>): Promise<void> {
    const current = await this.getConfig();
    const updated = { ...current, ...config };
    this.db.prepare('UPDATE config SET value = ? WHERE key = ?').run(
      JSON.stringify(updated),
      'user_config'
    );
  }

  /**
   * 清空所有数据
   */
  async clearAllData(): Promise<void> {
    this.db.exec(`
      DELETE FROM js_files;
      DELETE FROM analysis_results;
      DELETE FROM projects;
    `);
  }

  /**
   * 关闭数据库
   */
  async close(): Promise<void> {
    this.db.close();
  }

  /**
   * 获取统计信息
   */
  async getStatistics(): Promise<any> {
    const jsFilesCount: any = this.db.prepare('SELECT COUNT(*) as count FROM js_files').get();
    const analysisResultsCount: any = this.db.prepare('SELECT COUNT(*) as count FROM analysis_results').get();
    const projectsCount: any = this.db.prepare('SELECT COUNT(*) as count FROM projects').get();

    return {
      jsFilesCount: jsFilesCount.count,
      analysisResultsCount: analysisResultsCount.count,
      projectsCount: projectsCount.count,
    };
  }
}
