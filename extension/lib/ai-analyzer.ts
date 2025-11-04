// JS Hunter - AI Analyzer Engine

import type {
  AIModel,
  AnalysisConfig,
  AnalysisResult,
  AnalysisScenario,
  JSFile,
  UserConfig,
} from '../types/index';
import { generateUUID, safeJSONParse } from './utils';
import { getTemplateByScenario, fillTemplate } from './analysis-templates';

/**
 * AI分析器类
 */
export class AIAnalyzer {
  private config: UserConfig;

  constructor(config: UserConfig) {
    this.config = config;
  }

  /**
   * 分析JS文件
   */
  async analyze(
    jsFile: JSFile,
    analysisConfig: AnalysisConfig
  ): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = [];

    for (const scenario of analysisConfig.scenarios) {
      try {
        const result = await this.analyzeScenario(
          jsFile,
          scenario,
          analysisConfig
        );
        results.push(result);
      } catch (error) {
        console.error(`Error analyzing scenario ${scenario}:`, error);

        // 创建错误结果
        results.push({
          id: generateUUID(),
          jsFileId: jsFile.id,
          analysisType: scenario,
          model: analysisConfig.model,
          prompt: '',
          rawResponse: '',
          timestamp: Date.now(),
          duration: 0,
          status: 'error',
          error: (error as Error).message,
        });
      }
    }

    return results;
  }

  /**
   * 分析单个场景
   */
  private async analyzeScenario(
    jsFile: JSFile,
    scenario: AnalysisScenario,
    analysisConfig: AnalysisConfig
  ): Promise<AnalysisResult> {
    const startTime = Date.now();

    // 获取模板
    const template = getTemplateByScenario(scenario);
    if (!template) {
      throw new Error(`Template not found for scenario: ${scenario}`);
    }

    // 准备代码
    let code = jsFile.content;

    // 如果需要去混淆
    if (analysisConfig.autoDeobfuscate && jsFile.metadata.isObfuscated) {
      // TODO: 实现去混淆
      console.log('Deobfuscation not implemented yet');
    }

    // 如果代码太大，需要分块
    const maxContextSize = this.getMaxContextSize(analysisConfig.model);
    if (code.length > maxContextSize) {
      return await this.analyzeWithChunking(
        jsFile,
        scenario,
        analysisConfig,
        template.prompt,
        maxContextSize
      );
    }

    // 填充模板
    const prompt = fillTemplate(template.prompt, code);

    // 调用AI API
    const response = await this.callAIAPI(prompt, analysisConfig.model);

    // 解析响应
    const parsedResult = this.parseResponse(response, scenario);

    const duration = Date.now() - startTime;

    return {
      id: generateUUID(),
      jsFileId: jsFile.id,
      analysisType: scenario,
      model: analysisConfig.model,
      prompt,
      rawResponse: response,
      timestamp: Date.now(),
      duration,
      status: 'success',
      ...parsedResult,
    };
  }

  /**
   * 分块分析（针对超大文件）
   */
  private async analyzeWithChunking(
    jsFile: JSFile,
    scenario: AnalysisScenario,
    analysisConfig: AnalysisConfig,
    promptTemplate: string,
    maxContextSize: number
  ): Promise<AnalysisResult> {
    const startTime = Date.now();

    // 简单分块策略：按行分割
    const lines = jsFile.content.split('\n');
    const chunks: string[] = [];
    let currentChunk: string[] = [];
    let currentSize = 0;

    for (const line of lines) {
      if (currentSize + line.length > maxContextSize * 0.8) {
        chunks.push(currentChunk.join('\n'));
        currentChunk = [];
        currentSize = 0;
      }
      currentChunk.push(line);
      currentSize += line.length;
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join('\n'));
    }

    console.log(`Analyzing ${chunks.length} chunks for ${scenario}`);

    // 分析每个块
    const chunkResults = await Promise.all(
      chunks.map(async (chunk, index) => {
        const prompt = fillTemplate(promptTemplate, chunk);
        const response = await this.callAIAPI(prompt, analysisConfig.model);
        return this.parseResponse(response, scenario);
      })
    );

    // 合并结果
    const mergedResult = this.mergeChunkResults(chunkResults, scenario);

    const duration = Date.now() - startTime;

    return {
      id: generateUUID(),
      jsFileId: jsFile.id,
      analysisType: scenario,
      model: analysisConfig.model,
      prompt: `[Chunked analysis: ${chunks.length} chunks]`,
      rawResponse: JSON.stringify(chunkResults),
      timestamp: Date.now(),
      duration,
      status: 'success',
      ...mergedResult,
    };
  }

  /**
   * 调用AI API
   */
  private async callAIAPI(prompt: string, model: AIModel): Promise<string> {
    switch (model) {
      case 'gemini-2.5-flash':
        return await this.callGeminiAPI(prompt);

      case 'deepseek-v3':
        return await this.callDeepSeekAPI(prompt);

      case 'gpt-4.1-mini':
        return await this.callOpenAIAPI(prompt);

      case 'custom':
        return await this.callCustomAPI(prompt);

      default:
        throw new Error(`Unsupported model: ${model}`);
    }
  }

  /**
   * 调用Gemini API
   */
  private async callGeminiAPI(prompt: string): Promise<string> {
    const apiKey = this.config.apiKeys.gemini;
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  /**
   * 调用DeepSeek API
   */
  private async callDeepSeekAPI(prompt: string): Promise<string> {
    const apiKey = this.config.apiKeys.deepseek;
    if (!apiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 8192,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * 调用OpenAI API
   */
  private async callOpenAIAPI(prompt: string): Promise<string> {
    const apiKey = this.config.apiKeys.openai;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * 调用自定义API
   */
  private async callCustomAPI(prompt: string): Promise<string> {
    const endpoint = this.config.customApiEndpoint;
    const apiKey = this.config.apiKeys.custom;

    if (!endpoint) {
      throw new Error('Custom API endpoint not configured');
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`Custom API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * 解析AI响应
   */
  private parseResponse(
    response: string,
    scenario: AnalysisScenario
  ): Partial<AnalysisResult> {
    // 尝试提取JSON
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      const json = safeJSONParse(jsonMatch[1], null);
      if (json) {
        return this.mapResponseToResult(json, scenario);
      }
    }

    // 如果没有JSON格式，尝试直接解析
    const json = safeJSONParse(response, null);
    if (json) {
      return this.mapResponseToResult(json, scenario);
    }

    // 无法解析，返回原始响应
    return {
      customFindings: { rawResponse: response },
    };
  }

  /**
   * 映射响应到结果
   */
  private mapResponseToResult(
    json: any,
    scenario: AnalysisScenario
  ): Partial<AnalysisResult> {
    switch (scenario) {
      case 'api-discovery':
        return {
          apiEndpoints: json.endpoints || [],
        };

      case 'secret-scan':
        return {
          secrets: json.findings || [],
        };

      case 'vulnerability-scan':
        return {
          vulnerabilities: json.vulnerabilities || [],
        };

      case 'hidden-features':
        return {
          hiddenFeatures: [
            ...(json.hiddenRoutes || []).map((r: any) => r.path),
            ...(json.debugEndpoints || []).map((e: any) => e.endpoint),
          ],
        };

      default:
        return {
          customFindings: json,
        };
    }
  }

  /**
   * 合并分块结果
   */
  private mergeChunkResults(
    results: Partial<AnalysisResult>[],
    scenario: AnalysisScenario
  ): Partial<AnalysisResult> {
    // 简单合并策略：合并数组
    const merged: any = {};

    for (const result of results) {
      for (const [key, value] of Object.entries(result)) {
        if (Array.isArray(value)) {
          if (!merged[key]) {
            merged[key] = [];
          }
          merged[key].push(...value);
        } else if (typeof value === 'object') {
          if (!merged[key]) {
            merged[key] = {};
          }
          Object.assign(merged[key], value);
        }
      }
    }

    return merged;
  }

  /**
   * 获取模型的最大上下文大小
   */
  private getMaxContextSize(model: AIModel): number {
    switch (model) {
      case 'gemini-2.5-flash':
        return 2000000; // 2M tokens ≈ 8M characters

      case 'deepseek-v3':
        return 128000; // 128K tokens ≈ 512K characters

      case 'gpt-4.1-mini':
        return 1000000; // 1M tokens ≈ 4M characters

      case 'custom':
        return 128000; // 默认128K

      default:
        return 128000;
    }
  }
}
