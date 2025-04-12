import { ProxyData } from '@/model/proxy';
import { storage } from '@/service/storage';
import RequestForwardService from './requestForwardService';
import { getModeProxy } from '@/service/proxy';
import { ProxyMode } from '@/model/proxy';
import { EDITOR_PROXY, TABLE_PROXY, CHFONE_STORE_PROXY_STATUS_KEY } from '@/constants';
import { isDev } from '@/utils/env';

/**
 * 初始化数据
 * 如果localStorage 和 chromeStorage 都没有数据 则使用默认数据
 */
export const initProxyData = async (): Promise<ProxyData> => {
  const modeProxy = await getModeProxy();
  const currentMode = modeProxy?.mode || ProxyMode.TABLE;
  
  // 获取存储的数据
  const storageData = await storage.getProxyData(currentMode);
    
  // 如果存储中有数据，直接返回
  if (storageData) {
    return storageData;
  }
  
  // 如果没有存储数据，使用对应模式的默认数据
  return currentMode === ProxyMode.EDITOR ? EDITOR_PROXY : TABLE_PROXY;
};

/**
 * 更新本地存储数据
 */
export const updateProxyData = async (proxyData: ProxyData) => {
  const modeProxy = await getModeProxy();
  const currentMode = modeProxy?.mode || ProxyMode.TABLE;
  
  // 保存数据到存储
  await storage.setProxyData(proxyData, currentMode);

  // 在非开发环境下，更新Chrome代理规则
  if (!isDev()) {
    RequestForwardService.updateChromeRules(RequestForwardService.statusFilter(proxyData));
  }
};

/**
 * 获取代理状态
 */
export const getProxyStatus = async (): Promise<boolean> => {
  const proxyStatus = await storage.get<{ status: boolean }>(CHFONE_STORE_PROXY_STATUS_KEY);
  return proxyStatus?.status || false;
};

/**
 * 设置代理状态
 */
export const setProxyStatus = async (proxyStatus: boolean) => {
  const currentData = await storage.get<{ mode: ProxyMode; status: boolean }>(CHFONE_STORE_PROXY_STATUS_KEY);
  await storage.set(CHFONE_STORE_PROXY_STATUS_KEY, {
    mode: currentData?.mode || ProxyMode.TABLE,
    status: proxyStatus
  });
};
