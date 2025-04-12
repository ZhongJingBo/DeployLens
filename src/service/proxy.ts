/**
 * 代理公共service
 */
import { ProxyMode } from '@/model/proxy';
import { CHFONE_STORE_PROXY_STATUS_KEY } from '@/constants';
import { storage } from './storage';

/**
 * 获取代理状态
 */
export const getProxyStatus = async (): Promise<boolean> => {
  const proxyStatus = await chrome.storage.local.get(CHFONE_STORE_PROXY_STATUS_KEY);
  return proxyStatus?.[CHFONE_STORE_PROXY_STATUS_KEY]?.status || false;
};

/**
 * 获取代理模式
 */
export const getModeProxy = async (): Promise<{ mode: ProxyMode } | null> => {
  const proxyStatus = await storage.get<{ mode: ProxyMode; status: boolean }>(CHFONE_STORE_PROXY_STATUS_KEY);
  return proxyStatus?.mode ? { mode: proxyStatus.mode } : null;
};

/**
 * 设置代理模式
 */
export const setModeProxy = async (mode: ProxyMode) => {
  const currentData = await storage.get<{ mode: ProxyMode; status: boolean }>(CHFONE_STORE_PROXY_STATUS_KEY);
  const currentStatus = currentData?.status || false;
  
  await storage.set(CHFONE_STORE_PROXY_STATUS_KEY, {
    mode,
    status: currentStatus
  });
};
