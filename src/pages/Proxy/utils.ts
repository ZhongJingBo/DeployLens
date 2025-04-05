import { ProxyRule } from '@/model/proxy';
import { parseTree, ParseOptions, Node, visit } from 'jsonc-parser';
/**
 * 移除 JSON 中的注释
 * @param str
 * @returns
 */
export const stripJSONComments = (str: string): string => {
  let inString = false;
  let inComment = false;
  let inMultilineComment = false;
  let newStr = '';

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const nextChar = str[i + 1];

    if (!inComment && !inMultilineComment) {
      if (char === '"' && str[i - 1] !== '\\') {
        inString = !inString;
      }
    }

    if (!inString) {
      if (!inComment && !inMultilineComment && char === '/' && nextChar === '/') {
        inComment = true;
        i++;
        continue;
      }

      if (!inComment && !inMultilineComment && char === '/' && nextChar === '*') {
        inMultilineComment = true;
        i++;
        continue;
      }

      if (inComment && char === '\n') {
        inComment = false;
      }

      if (inMultilineComment && char === '*' && nextChar === '/') {
        inMultilineComment = false;
        i++;
        continue;
      }

      if (inComment || inMultilineComment) {
        continue;
      }
    }

    newStr += char;
  }

  return newStr;
};

// 辅助函数：格式化 JSON 字符串
export const formatJSONString = (str: string): string => {
  return str
    .split('\n')
    .map(line => line.trim())
    .filter(line => line)
    .join('\n');
};

/**
 * 移除 JSON 中的逗号
 * @param str
 * @returns
 */
export const cleanJSON = (str: string): string => {
  return str
    .replace(/,(\s*\])/g, '$1') // 移除数组末尾的逗号
    .replace(/,(\s*\})/g, '$1'); // 移除对象末尾的逗号
};

// 辅助函数：验证和转换规则
export function validateAndTransformRules(rules: any[]): ProxyRule[] {
  if (!Array.isArray(rules)) {
    throw new Error('proxy must be an array');
  }

  return rules
    .filter(rule => {
      if (!Array.isArray(rule) || rule.length !== 2) {
        console.warn('Invalid rule format:', rule);
        return false;
      }
      return true;
    })
    .map(([pattern, target], index) => ({
      id: index,
      pattern: pattern?.trim() || '',
      target: target?.trim() || '',
      enabled: true,
    }));
}

/**
 * jsonc 转换为对象结构
 */
export const jsoncTransformProxyRule = (str: string): ProxyRule[] => {
  const json = stripJSONComments(str);
  const parseOptions: ParseOptions = {
    disallowComments: false,
    allowTrailingComma: true,
    allowEmptyContent: true,
  };
  const ast = parseTree(str, undefined, parseOptions);
  const commentedRules = findCommentedProxyRules(str, ast);

  const formattedJSON = formatJSONString(json);
  const cleanedJSON = cleanJSON(formattedJSON);
  const proxyData = JSON.parse(cleanedJSON);

  const { proxy } = proxyData;

  if (proxy) {
    const rules = validateAndTransformRules(proxy);

    return [...rules, ...commentedRules];
  }
  console.warn('proxy is not defined');
  return [];
};

function findCommentedProxyRules(text: string, node: Node | undefined): ProxyRule[] {
  const commentedRules: ProxyRule[] = [];
  let inProxyArray = false;
  let currentCommentLines: string[] = [];
  let isCollectingComment = false;
  // const COMMENTED_ID_OFFSET = 10000; // Large offset to avoid conflicts with uncommented rules

  // 访问 AST
  visit(text, {
    onObjectProperty: (property: string, offset: number, length: number) => {
      if (property === 'proxy') {
        inProxyArray = true;
        return;
      }
    },

    onComment: (offset: number, length: number) => {
      if (!inProxyArray) return;

      // 获取注释文本并清理
      const commentText = text.substring(offset, offset + length);

      // 移除注释标记并清理空白
      const cleanComment = commentText
        .replace(/^\/\/\s*/, '') // 移除行注释标记
        .replace(/^\/\*|\*\/$/g, '') // 移除块注释标记
        .trim();

      // 检查是否是注释规则的开始（包含数组开始）
      if (cleanComment.includes('[')) {
        if (isCollectingComment && currentCommentLines.length > 0) {
          processCollectedComment();
        }
        isCollectingComment = true;
        currentCommentLines = [];

        // 尝试从开始注释中提取第一个值
        const matches = cleanComment.match(/"([^"]+)"/);
        if (matches) {
          currentCommentLines.push(matches[1].trim());
        }
        return;
      }

      // 检查是否是注释规则的结束（包含数组结束）
      if (cleanComment.includes(']')) {
        // 尝试从结束注释中提取最后一个值
        const matches = cleanComment.match(/"([^"]+)"/);
        if (matches) {
          currentCommentLines.push(matches[1].trim());
        }
        processCollectedComment();
        return;
      }

      // 收集注释规则的中间部分
      if (isCollectingComment) {
        const matches = cleanComment.match(/"([^"]+)"/);
        if (matches) {
          const value = matches[1].trim();
          currentCommentLines.push(value);
        }
      }
    },
  });

  // 处理收集到的注释行
  function processCollectedComment() {
    if (!isCollectingComment || currentCommentLines.length === 0) return;

    try {
      if (currentCommentLines.length === 2) {
        commentedRules.push({
          id: commentedRules.length + 1, // Add offset to ensure unique IDs
          pattern: currentCommentLines[0],
          target: currentCommentLines[1],
          enabled: false,
        });
      }
    } catch (e) {
      console.warn('Failed to parse comment:', currentCommentLines, e);
    }

    // 重置收集状态
    isCollectingComment = false;
    currentCommentLines = [];
  }

  return commentedRules;
}

interface LineInfo {
  original: string;
  trimmed: string;
  uncommented: string;
  indent: string;
}

/**
 * 处理单行内容，返回行信息
 */
const processLine = (line: string): LineInfo => {
  const trimmed = line.trim();
  return {
    original: line,
    trimmed,
    uncommented: trimmed.replace(/^\s*\/\/\s*/, ''),
    indent: line.match(/^\s*/)?.[0] || '',
  };
};

/**
 * 查找目标规则的范围
 */
const findRuleRange = (
  lines: string[],
  ruleId: number,
  startIndex: number
): { start: number; end: number } | null => {
  let currentRuleIndex = -1;
  let bracketCount = 0;
  let inRule = false;
  let foundFirstBracket = false;

  for (let i = startIndex; i < lines.length; i++) {
    const lineInfo = processLine(lines[i]);

    // 跳过proxy数组声明行
    if (lineInfo.uncommented.includes('"proxy"')) {
      continue;
    }

    // 找到proxy数组的开始
    if (!foundFirstBracket && lineInfo.uncommented === '[') {
      foundFirstBracket = true;
      continue;
    }

    // 检测规则开始
    if (foundFirstBracket && lineInfo.uncommented.startsWith('[')) {
      currentRuleIndex++;
      if (currentRuleIndex === ruleId) {
        inRule = true;
        bracketCount = 1;
        return findRuleEnd(lines, i, bracketCount);
      }
    }
  }

  return null;
};

/**
 * 查找规则的结束位置
 */
const findRuleEnd = (
  lines: string[],
  startIndex: number,
  initialBracketCount: number
): { start: number; end: number } | null => {
  let bracketCount = initialBracketCount;

  for (let i = startIndex; i < lines.length; i++) {
    const lineInfo = processLine(lines[i]);

    // 在规则内部时，检测嵌套的方括号
    if (!lineInfo.uncommented.startsWith('[') && lineInfo.uncommented.includes('[')) {
      bracketCount++;
    }

    // 检测规则结束
    if (lineInfo.uncommented.includes(']')) {
      bracketCount--;
      if (bracketCount === 0) {
        return { start: startIndex, end: i };
      }
    }
  }

  return null;
};

/**
 * 处理注释操作
 */
const processComments = (
  lines: string[],
  range: { start: number; end: number },
  enabled: boolean
): void => {
  for (let i = range.start; i <= range.end; i++) {
    const lineInfo = processLine(lines[i]);

    // 跳过空行
    if (!lineInfo.trimmed) continue;

    if (!enabled) {
      // 添加注释
      if (!lineInfo.trimmed.startsWith('//')) {
        lines[i] = lineInfo.indent + '// ' + lineInfo.trimmed;
      }
    } else {
      // 移除注释
      lines[i] = lineInfo.indent + lineInfo.uncommented;
    }
  }
};

/**
 * 根据规则ID注释对应的proxy规则
 * @param ruleId 规则ID
 * @param jsoncContent JSONC内容
 * @param enabled 是否启用，true表示移除注释，false表示添加注释
 * @returns 修改后的JSONC内容
 * @throws {Error} 当找不到proxy数组或目标规则时抛出错误
 */
export const commentProxyRuleById = (
  ruleId: number,
  jsoncContent: string,
  enabled: boolean
): string => {
  // 输入验证
  if (typeof ruleId !== 'number' || ruleId < 0) {
    throw new Error('Invalid rule ID');
  }

  if (typeof jsoncContent !== 'string' || !jsoncContent.trim()) {
    throw new Error('Invalid JSONC content');
  }

  const lines = jsoncContent.split('\n');

  // 找到proxy数组的开始位置
  const proxyStartIndex = lines.findIndex(line => line.includes('"proxy"'));
  if (proxyStartIndex === -1) {
    throw new Error('Proxy array not found');
  }

  // 查找目标规则
  const range = findRuleRange(lines, ruleId, proxyStartIndex);
  if (!range) {
    throw new Error(`Rule with ID ${ruleId} not found`);
  }

  // 处理注释
  processComments(lines, range, enabled);

  return lines.join('\n');
};
