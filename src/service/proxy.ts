/**
 * 代理公共service
 */
import { CHFONE_STORE_PROXY_STATUS_KEY, CHFONE_STORE_LINK_KEY } from '@/constants';
import { isDev } from '@/utils/env';

export const getModeProxy = async () => {
  if (isDev()) {
    const proxyStatus = localStorage.getItem(CHFONE_STORE_LINK_KEY);
    if (proxyStatus) {
      return Promise.resolve(JSON.parse(proxyStatus));
    }
  } else {
    const proxyStatus = await chrome.storage.local.get(CHFONE_STORE_PROXY_STATUS_KEY);
    if (proxyStatus) {
      return Promise.resolve(proxyStatus?.[CHFONE_STORE_PROXY_STATUS_KEY]);
    }
  }
  return Promise.resolve({});
};

export const setModeProxy = (mode: string) => {
  if (isDev()) {
    const data = {
      ...getModeProxy(),
      mode,
    };
    localStorage.setItem(CHFONE_STORE_LINK_KEY, JSON.stringify(data));
  } else {
    chrome.storage.local.set({
      [CHFONE_STORE_PROXY_STATUS_KEY]: {
        ...getModeProxy(),
        mode,
      },
    });
  }
};
