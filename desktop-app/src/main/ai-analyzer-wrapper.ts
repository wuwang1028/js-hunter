// JS Hunter Desktop - AI Analyzer Wrapper

import { DatabaseManager } from './database';
import { AIAnalyzer } from './ai-analyzer';
import type { AnalysisConfig } from '../shared/types/index';

/**
 * AI分析器包装类（适配桌面应用）
 */
export class AIAnalyzerWrapper {
  private analyzer: AIAnalyzer | null = null;

  constructor(private dbManager: DatabaseManager) {}

  /**
   * 分析文件
   */
  async analyze(fileId: string, config: AnalysisConfig): Promise<any> {
    // 获取文件
    const file = await this.dbManager.getJSFile(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    // 获取用户配置
    const userConfig = await this.dbManager.getConfig();

    // 创建分析器实例
    this.analyzer = new AIAnalyzer(userConfig);

    // 执行分析
    const results = await this.analyzer.analyze(file, config);

    // 保存结果到数据库
    for (const result of results) {
      await this.dbManager.addAnalysisResult(result);
    }

    return results;
  }
}
