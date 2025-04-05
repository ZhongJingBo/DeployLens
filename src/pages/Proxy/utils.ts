import { ProxyRule } from '@/model/proxy';
import { parseTree, ParseOptions, Node, visit, NodeType } from 'jsonc-parser';
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
export const validateAndTransformRules = (rules: any[]) => {
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
};

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
          id: commentedRules.length,
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

/**
 * 根据规则ID注释对应的proxy规则
 * @param ruleId 规则ID
 * @param jsoncContent JSONC内容
 * @param enabled 是否启用，true表示移除注释，false表示添加注释
 * @returns 注释后的JSONC内容
 * 
 */
export const commentProxyRuleById = (ruleId: number, jsoncContent: string, enabled: boolean): string => {
  // 解析 JSONC 内容
  const parseOptions: ParseOptions = {
    disallowComments: false,
    allowTrailingComma: true,
    allowEmptyContent: true,
  };
  
  // 解析 AST
  const ast = parseTree(jsoncContent, undefined, parseOptions);
  
  if (!ast) {
    return jsoncContent;
  }
  
  // 查找指定 ID 的规则
  const rules = jsoncTransformProxyRule(jsoncContent);
  const targetRule = rules.find(rule => rule.id === ruleId);
  
  if (!targetRule) {
    return jsoncContent;
  }
  
  // 在 JSONC 内容中搜索目标规则
  const lines = jsoncContent.split('\n');
  const rulePattern = `"${targetRule.pattern}"`;
  const ruleTarget = `"${targetRule.target}"`;
  
  // 查找需要处理的规则的范围
  let startLine = -1;
  let endLine = -1;
  let bracketCount = 0;
  
  // 查找规则的位置
  // 如果 enabled=false（添加注释），我们查找未注释的行
  // 如果 enabled=true（移除注释），我们查找已注释的行
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const uncommentedLine = line.replace(/^\s*\/\/\s*/, ''); // 移除可能的注释前缀
    
    // 根据 enabled 参数不同，查找条件不同
    if ((enabled && line.trim().startsWith('//') && uncommentedLine.includes(rulePattern)) ||
        (!enabled && !line.trim().startsWith('//') && line.includes(rulePattern))) {
      
      // 向上查找这条规则的开始 [
      for (let j = i; j >= 0; j--) {
        const currentLine = lines[j];
        const trimmedLine = currentLine.trim();
        const uncommentedCurrentLine = currentLine.replace(/^\s*\/\/\s*/, '').trim();
        
        // 寻找规则数组开始的标记 [
        if ((enabled && trimmedLine.startsWith('//') && uncommentedCurrentLine.startsWith('[')) ||
            (!enabled && !trimmedLine.startsWith('//') && trimmedLine.startsWith('['))) {
          
          // 确保这是规则的开始而不是 proxy 数组的开始
          // 检查这是独立的 [ 而不是 proxy": [
          if (!uncommentedCurrentLine.includes('proxy') && !uncommentedCurrentLine.includes(':')) {
            startLine = j;
            break;
          }
        }
      }
      
      // 向下查找这条规则的结束 ]
      if (startLine !== -1) {
        bracketCount = 0;
        
        for (let j = startLine; j < lines.length; j++) {
          const currentLine = lines[j];
          const trimmedLine = currentLine.trim();
          const uncommentedLine = currentLine.replace(/^\s*\/\/\s*/, '').trim();
          
          // 计算括号的嵌套
          // 需要考虑注释和未注释行的情况
          if (enabled) {
            // 查找注释行中的括号
            if (trimmedLine.startsWith('//')) {
              for (let k = 0; k < uncommentedLine.length; k++) {
                if (uncommentedLine[k] === '[') bracketCount++;
                if (uncommentedLine[k] === ']') bracketCount--;
              }
            }
          } else {
            // 查找非注释行中的括号
            if (!trimmedLine.startsWith('//')) {
              for (let k = 0; k < trimmedLine.length; k++) {
                if (trimmedLine[k] === '[') bracketCount++;
                if (trimmedLine[k] === ']') bracketCount--;
              }
            }
          }
          
          // 找到了结束括号
          if (bracketCount <= 0) {
            if ((enabled && trimmedLine.startsWith('//') && uncommentedLine.includes(']')) ||
                (!enabled && !trimmedLine.startsWith('//') && trimmedLine.includes(']'))) {
              endLine = j;
              break;
            }
          }
        }
        
        // 找到了目标规则，跳出循环
        if (endLine !== -1) break;
      }
    }
  }
  
  // 如果没找到精确的规则位置，尝试更宽松的匹配方式
  if (startLine === -1 || endLine === -1) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const uncommentedLine = line.replace(/^\s*\/\/\s*/, '');
      
      // 根据 enabled 参数不同，查找条件不同
      if ((enabled && line.trim().startsWith('//') && uncommentedLine.includes(rulePattern)) ||
          (!enabled && !line.trim().startsWith('//') && line.includes(rulePattern))) {
          
        // 查找附近几行是否包含目标值
        for (let j = i; j < Math.min(i + 5, lines.length); j++) {
          const targetLine = lines[j];
          const uncommentedTargetLine = targetLine.replace(/^\s*\/\/\s*/, '');
          
          if ((enabled && targetLine.trim().startsWith('//') && uncommentedTargetLine.includes(ruleTarget)) ||
              (!enabled && !targetLine.trim().startsWith('//') && targetLine.includes(ruleTarget))) {
            
            // 查找规则开始 [
            for (let k = i; k >= Math.max(0, i - 5); k--) {
              const bracketLine = lines[k];
              const uncommBracketLine = bracketLine.replace(/^\s*\/\/\s*/, '').trim();
              
              if ((enabled && bracketLine.trim().startsWith('//') && uncommBracketLine.startsWith('[')) ||
                  (!enabled && !bracketLine.trim().startsWith('//') && bracketLine.trim().startsWith('['))) {
                startLine = k;
                break;
              }
            }
            
            // 查找规则结束 ]
            for (let k = j; k < Math.min(j + 5, lines.length); k++) {
              const bracketLine = lines[k];
              const uncommBracketLine = bracketLine.replace(/^\s*\/\/\s*/, '').trim();
              
              if ((enabled && bracketLine.trim().startsWith('//') && uncommBracketLine.startsWith(']')) ||
                  (!enabled && !bracketLine.trim().startsWith('//') && bracketLine.trim().startsWith(']'))) {
                endLine = k;
                break;
              }
            }
            
            break;
          }
        }
        
        if (startLine !== -1 && endLine !== -1) break;
      }
    }
  }
  
  if (startLine === -1 || endLine === -1) {
    return jsoncContent; // 未找到匹配的规则
  }
  
  // 根据 enabled 参数处理找到的规则
  for (let i = startLine; i <= endLine; i++) {
    if (enabled) {
      // 移除注释
      if (lines[i].trim().startsWith('//')) {
        lines[i] = lines[i].replace(/^\s*\/\/\s*/, '');
      }
    } else {
      // 添加注释
      if (!lines[i].trim().startsWith('//')) {
        lines[i] = '// ' + lines[i];
      }
    }
  }
  
  return lines.join('\n');
};






