// JS Hunter - Code Beautifier & Deobfuscator

/**
 * 代码美化器
 */
export class Beautifier {
  /**
   * 美化JavaScript代码
   */
  static beautify(code: string, options: BeautifyOptions = {}): string {
    const {
      indentSize = 2,
      indentChar = ' ',
      maxPreserveNewlines = 2,
      preserveNewlines = true,
      keepArrayIndentation = false,
      breakChainedMethods = false,
      spaceInParen = false,
      spaceInEmptyParen = false,
      jslintHappy = false,
      spaceAfterAnonFunction = false,
      braceStyle = 'collapse',
      unescapeStrings = false,
      wrapLineLength = 0,
      endWithNewline = false,
    } = options;

    try {
      let result = code;
      let indent = 0;
      let inString = false;
      let stringChar = '';
      let inComment = false;
      let commentType = '';
      let output = '';
      let lastChar = '';
      let nextChar = '';

      const getIndent = () => indentChar.repeat(indentSize * indent);
      const newline = () => '\n' + getIndent();

      for (let i = 0; i < result.length; i++) {
        const char = result[i];
        nextChar = result[i + 1] || '';

        // 处理字符串
        if ((char === '"' || char === "'" || char === '`') && lastChar !== '\\') {
          if (!inString) {
            inString = true;
            stringChar = char;
          } else if (char === stringChar) {
            inString = false;
            stringChar = '';
          }
        }

        // 处理注释
        if (!inString) {
          if (char === '/' && nextChar === '/' && !inComment) {
            inComment = true;
            commentType = '//';
          } else if (char === '/' && nextChar === '*' && !inComment) {
            inComment = true;
            commentType = '/*';
          } else if (char === '\n' && commentType === '//') {
            inComment = false;
            commentType = '';
          } else if (char === '*' && nextChar === '/' && commentType === '/*') {
            output += char;
            i++;
            output += '/';
            inComment = false;
            commentType = '';
            lastChar = '/';
            continue;
          }
        }

        // 不在字符串或注释中时处理格式
        if (!inString && !inComment) {
          // 左大括号
          if (char === '{') {
            output += ' ' + char;
            indent++;
            if (nextChar !== '}') {
              output += newline();
            }
            lastChar = char;
            continue;
          }

          // 右大括号
          if (char === '}') {
            indent = Math.max(0, indent - 1);
            if (lastChar !== '{') {
              output += newline();
            }
            output += char;
            if (nextChar && nextChar !== ';' && nextChar !== ',' && nextChar !== ')') {
              output += newline();
            }
            lastChar = char;
            continue;
          }

          // 分号
          if (char === ';') {
            output += char;
            if (nextChar && nextChar !== '\n' && nextChar !== '}') {
              output += newline();
            }
            lastChar = char;
            continue;
          }

          // 逗号
          if (char === ',') {
            output += char + ' ';
            lastChar = char;
            continue;
          }

          // 跳过多余的空白
          if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
            if (lastChar !== ' ' && lastChar !== '\n') {
              if (char === '\n' && preserveNewlines) {
                output += newline();
              } else if (char === ' ') {
                output += char;
              }
            }
            lastChar = char === '\n' ? '\n' : ' ';
            continue;
          }
        }

        output += char;
        lastChar = char;
      }

      return output.trim();
    } catch (error) {
      console.error('Beautify error:', error);
      return code;
    }
  }

  /**
   * 简单的去混淆
   */
  static deobfuscate(code: string): DeobfuscateResult {
    const original = code;
    let deobfuscated = code;
    const changes: string[] = [];

    try {
      // 1. 解码十六进制字符串
      const hexPattern = /\\x([0-9A-Fa-f]{2})/g;
      if (hexPattern.test(deobfuscated)) {
        deobfuscated = deobfuscated.replace(hexPattern, (match, hex) => {
          return String.fromCharCode(parseInt(hex, 16));
        });
        changes.push('解码十六进制字符串');
      }

      // 2. 解码Unicode字符串
      const unicodePattern = /\\u([0-9A-Fa-f]{4})/g;
      if (unicodePattern.test(deobfuscated)) {
        deobfuscated = deobfuscated.replace(unicodePattern, (match, unicode) => {
          return String.fromCharCode(parseInt(unicode, 16));
        });
        changes.push('解码Unicode字符串');
      }

      // 3. 替换常见的混淆变量名
      const obfuscatedVarPattern = /\b_0x[0-9a-f]+\b/gi;
      const obfuscatedVars = deobfuscated.match(obfuscatedVarPattern);
      if (obfuscatedVars && obfuscatedVars.length > 0) {
        const uniqueVars = [...new Set(obfuscatedVars)];
        uniqueVars.forEach((varName, index) => {
          const newName = `var_${index + 1}`;
          deobfuscated = deobfuscated.replace(new RegExp(varName, 'g'), newName);
        });
        changes.push(`重命名${uniqueVars.length}个混淆变量`);
      }

      // 4. 解包字符串数组
      const stringArrayPattern = /var\s+(\w+)\s*=\s*\[(.*?)\];/s;
      const stringArrayMatch = deobfuscated.match(stringArrayPattern);
      if (stringArrayMatch) {
        const arrayName = stringArrayMatch[1];
        const arrayContent = stringArrayMatch[2];
        
        try {
          // 尝试解析字符串数组
          const strings = eval(`[${arrayContent}]`);
          
          // 替换所有对数组的引用
          strings.forEach((str: string, index: number) => {
            const pattern = new RegExp(`${arrayName}\\[${index}\\]`, 'g');
            deobfuscated = deobfuscated.replace(pattern, JSON.stringify(str));
          });
          
          // 移除原始数组定义
          deobfuscated = deobfuscated.replace(stringArrayPattern, '');
          changes.push('解包字符串数组');
        } catch (e) {
          // 解析失败，跳过
        }
      }

      // 5. 简化常量表达式
      const constantExpressions = [
        { pattern: /!!\[\]/g, replacement: 'true' },
        { pattern: /!\[\]/g, replacement: 'false' },
        { pattern: /\[\]\+\[\]/g, replacement: '""' },
        { pattern: /\+\[\]/g, replacement: '0' },
      ];

      constantExpressions.forEach(({ pattern, replacement }) => {
        if (pattern.test(deobfuscated)) {
          deobfuscated = deobfuscated.replace(pattern, replacement);
          if (!changes.includes('简化常量表达式')) {
            changes.push('简化常量表达式');
          }
        }
      });

      // 6. 美化代码
      deobfuscated = this.beautify(deobfuscated);

      return {
        success: true,
        original,
        deobfuscated,
        changes,
        reductionRate: ((original.length - deobfuscated.length) / original.length * 100).toFixed(2) + '%',
      };
    } catch (error: any) {
      return {
        success: false,
        original,
        deobfuscated: original,
        changes: [],
        error: error.message,
        reductionRate: '0%',
      };
    }
  }

  /**
   * 检测代码是否被混淆
   */
  static isObfuscated(code: string): ObfuscationDetection {
    const indicators = {
      hexStrings: (code.match(/\\x[0-9A-Fa-f]{2}/g) || []).length,
      unicodeStrings: (code.match(/\\u[0-9A-Fa-f]{4}/g) || []).length,
      obfuscatedVars: (code.match(/\b_0x[0-9a-f]+\b/gi) || []).length,
      shortVars: (code.match(/\b[a-zA-Z_$][a-zA-Z0-9_$]{0,2}\b/g) || []).length,
      stringArrays: (code.match(/var\s+\w+\s*=\s*\[.*?\];/gs) || []).length,
      evalUsage: (code.match(/\beval\s*\(/g) || []).length,
      functionConstructor: (code.match(/Function\s*\(/g) || []).length,
    };

    const score = 
      indicators.hexStrings * 2 +
      indicators.unicodeStrings * 2 +
      indicators.obfuscatedVars * 3 +
      (indicators.shortVars > 50 ? 10 : 0) +
      indicators.stringArrays * 5 +
      indicators.evalUsage * 3 +
      indicators.functionConstructor * 3;

    let level: 'none' | 'low' | 'medium' | 'high' = 'none';
    if (score > 50) level = 'high';
    else if (score > 20) level = 'medium';
    else if (score > 5) level = 'low';

    return {
      isObfuscated: score > 5,
      level,
      score,
      indicators,
    };
  }

  /**
   * 提取字符串常量
   */
  static extractStrings(code: string): string[] {
    const strings: string[] = [];
    const patterns = [
      /"([^"\\]*(\\.[^"\\]*)*)"/g,
      /'([^'\\]*(\\.[^'\\]*)*)'/g,
      /`([^`\\]*(\\.[^`\\]*)*)`/g,
    ];

    patterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(code)) !== null) {
        strings.push(match[1]);
      }
    });

    return [...new Set(strings)];
  }

  /**
   * 移除注释
   */
  static removeComments(code: string): string {
    // 移除单行注释
    let result = code.replace(/\/\/.*$/gm, '');
    
    // 移除多行注释
    result = result.replace(/\/\*[\s\S]*?\*\//g, '');
    
    return result;
  }

  /**
   * 移除空白
   */
  static removeWhitespace(code: string): string {
    return code
      .replace(/\s+/g, ' ')
      .replace(/\s*([{}();,:])\s*/g, '$1')
      .trim();
  }
}

/**
 * 类型定义
 */
export interface BeautifyOptions {
  indentSize?: number;
  indentChar?: string;
  maxPreserveNewlines?: number;
  preserveNewlines?: boolean;
  keepArrayIndentation?: boolean;
  breakChainedMethods?: boolean;
  spaceInParen?: boolean;
  spaceInEmptyParen?: boolean;
  jslintHappy?: boolean;
  spaceAfterAnonFunction?: boolean;
  braceStyle?: 'collapse' | 'expand' | 'end-expand';
  unescapeStrings?: boolean;
  wrapLineLength?: number;
  endWithNewline?: boolean;
}

export interface DeobfuscateResult {
  success: boolean;
  original: string;
  deobfuscated: string;
  changes: string[];
  error?: string;
  reductionRate: string;
}

export interface ObfuscationDetection {
  isObfuscated: boolean;
  level: 'none' | 'low' | 'medium' | 'high';
  score: number;
  indicators: {
    hexStrings: number;
    unicodeStrings: number;
    obfuscatedVars: number;
    shortVars: number;
    stringArrays: number;
    evalUsage: number;
    functionConstructor: number;
  };
}
