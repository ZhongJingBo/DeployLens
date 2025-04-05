import { CHFONE_STORE_PROXY_KEY } from '@/constants/index';
import { ProxyData } from '@/model/proxy';
export const getProxyLocalStorage = (): ProxyData | null => {
  const result = localStorage.getItem(CHFONE_STORE_PROXY_KEY);

  if(!result){
    return null
  }

  return JSON.parse(result) as ProxyData | null;
};

export const setProxyLocalStorage = (proxyData: ProxyData) => {
  localStorage.setItem(CHFONE_STORE_PROXY_KEY, JSON.stringify(proxyData));
};
