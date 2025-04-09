import { ProxyData } from '@/model/proxy';
import { setProxyLocalStorage, getProxyLocalStorage } from './localStorage';
import {
  setProxyChromeStorage,
  getProxyChromeStorage,
  getProxyStatusChromeStorage,
  setProxyStatusChromeStorage,
} from './chromeStorage';
import { isDev } from '@/utils/env';
import RequestForwardService from './requestForwardService';
import { getModeProxy } from '@/service/proxy';
import { ProxyMode } from '@/model/proxy';
import { EDITOR_PROXY, TABLE_PROXY } from '@/constants';

/**
 * 初始化数据
 * 如果localStorage 和 chromeStorage 都没有数据 则使用默认数据
 */
export const initProxyData = async (): Promise<ProxyData> => {
  const modeProxy = await getModeProxy();
  const storageData = isDev() ? getProxyLocalStorage() : await getProxyChromeStorage();
  const defaultData = modeProxy?.mode === ProxyMode.EDITOR ? EDITOR_PROXY : TABLE_PROXY;
  
  return storageData || defaultData;
};

/**
 * 更新本地存储数据
 */
export const updateProxyData = (proxyData: ProxyData) => {

  if (isDev()) {
    setProxyLocalStorage(proxyData);
  } else {
    setProxyChromeStorage(proxyData);
    // 更新代理规则
    RequestForwardService.updateChromeRules(RequestForwardService.statusFilter(proxyData));
  }
};

/**
 * 获取代理状态
 */
export const getProxyStatus = async (): Promise<boolean> => {
  const proxyStatus = await getProxyStatusChromeStorage();
  return proxyStatus || false;
};

/**
 * 设置代理状态
 */
export const setProxyStatus = async (proxyStatus: boolean) => {
  await setProxyStatusChromeStorage(proxyStatus);
};
