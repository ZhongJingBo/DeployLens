/**
 * 解析URL并分离基础URL和查询参数
 * @param url 完整的URL字符串
 * @returns 包含baseUrl和queryParams的对象
 */
export const parseUrlAndQueryParams = (
  url: string
): { baseUrl: string; queryParams: Record<string, string>[] } => {
  const urlParts = url.split('?');
  const queryString = urlParts[1];

  if (!queryString) return { baseUrl: urlParts[0], queryParams: [] };

  const queryParams = queryString.split('&').map(pair => {
    const [key, value] = pair.split('=');
    return {
      [decodeURIComponent(key)]: decodeURIComponent(value || ''),
    };
  });

  return {
    baseUrl: urlParts[0],
    queryParams,
  };
};

/**
 * 复制基础URL
 * @param baseUrl 基础URL
 */
export const handleCopyBaseUrl = (baseUrl: string) => {
  navigator.clipboard.writeText(baseUrl);
};

/**
 * 复制查询参数
 * @param queryParams 查询参数
 */
export const handleCopyQueryParams = (queryParams: Record<string, string>[]) => {
  navigator.clipboard.writeText(JSON.stringify(queryParams));
};

/**
 * 替换URL
 * @param queryParams 查询参数
 * @param url 完整的URL字符串
 */
export const replaceLink = (
  queryParams: Record<string, string>[],
  url: { baseUrl: string; currentUrl: string }
) => {
  const newParams = queryParams
    .map(param => {
      const [key, value] = Object.entries(param)[0];
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join('&');

  const newUrl = `${url.baseUrl}?${newParams}`;
  chrome.tabs.update({ url: newUrl });
};
