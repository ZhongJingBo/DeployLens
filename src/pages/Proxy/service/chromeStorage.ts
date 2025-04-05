import { CHFONE_STORE_PROXY_KEY, CHFONE_STORE_PROXY_STATUS_KEY } from '@/constants/index';
import { ProxyData } from '@/model/proxy';
export const getProxyChromeStorage = async () => {
  try {
    const result = await chrome.storage.local.get(CHFONE_STORE_PROXY_KEY);
    if (!result || !result[CHFONE_STORE_PROXY_KEY]) {
      return null;
    }
    return result[CHFONE_STORE_PROXY_KEY] as ProxyData;
  } catch (error) {
    console.error('Failed to get proxy data from chrome storage:', error);
    return null;
  }
};

export const setProxyChromeStorage = async (proxyData: ProxyData) => {
  await chrome.storage.local.set({ [CHFONE_STORE_PROXY_KEY]: proxyData });
};

export const getProxyStatusChromeStorage = async () => {
  const result = await chrome.storage.local.get(CHFONE_STORE_PROXY_STATUS_KEY);
  return result[CHFONE_STORE_PROXY_STATUS_KEY] || false;
};

export const setProxyStatusChromeStorage = async (proxyStatus: boolean) => {
  await chrome.storage.local.set({ [CHFONE_STORE_PROXY_STATUS_KEY]: proxyStatus });
};
