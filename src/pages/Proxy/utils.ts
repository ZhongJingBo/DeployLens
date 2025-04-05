import { ProxyRule } from '@/model/proxy';

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
  const formattedJSON = formatJSONString(json);
  const cleanedJSON = cleanJSON(formattedJSON);
  const proxyData = JSON.parse(cleanedJSON);

  const { proxy } = proxyData;

  if (proxy) {
    const rules = validateAndTransformRules(proxy);
    return rules;
  }
  console.warn('proxy is not defined');
  return [];
};
