import { ProxyData } from '@/model/proxy';
import { setProxyLocalStorage, getProxyLocalStorage } from './localStorage';
import {
  setProxyChromeStorage,
  getProxyChromeStorage,
  getProxyStatusChromeStorage,
  setProxyStatusChromeStorage,
} from './chromeStorage';
import { isDev } from '@/utils/env';
import { PROXY_DATA } from '@/constants';
import RequestForwardService from './requestForwardService';
/**
 * 初始化数据
 * 如果localStorage 和 chromeStorage 都没有数据 则使用默认数据
 */
export const initProxyData = async (): Promise<ProxyData> => {
  const proxyLocalStorage = getProxyLocalStorage();

  if (isDev()) {
    return proxyLocalStorage || PROXY_DATA;
  }
  const proxyChromeStorage = await getProxyChromeStorage();

  return proxyChromeStorage || PROXY_DATA;
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
