import {CHFONE_STORE_LINK_KEY, DEVELOPMENT_STORELINK } from '@/constants';
import { isDev } from '@/utils/env';

/**
 * 获取当前标签页的 URL
 * @returns 当前标签页的 URL
 */
export const getData = () => {
  return new Promise<string>(resolve => {
    if (isDev()) {
      resolve(DEVELOPMENT_STORELINK);
      return;
    }

    if (typeof chrome !== 'undefined' && chrome?.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
        if (tabs[0]) {
          const url = tabs[0].url || '';

          resolve(url);
        }
      });

      // 监听标签页更新事件
      chrome.tabs.onUpdated.addListener(
        (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
          // 确保是当前活动的标签页
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
            if (tabs[0]?.id === tabId && changeInfo.url) {
              resolve(changeInfo.url);
            }
          });
        }
      );

      // 监听标签页激活事件
      chrome.tabs.onActivated.addListener((activeInfo: chrome.tabs.TabActiveInfo) => {
        chrome.tabs.get(activeInfo.tabId, (tab: chrome.tabs.Tab) => {
          if (tab.url) {
            resolve(tab.url);
          }
        });
      });
    }
  });
};

export const addStoreNoteState = async ({ note, data, baseUrl }: AddStoreNoteParams) => {
  if (isDev()) {
    return;
  }

  try {
    const result = await chrome.storage.local.get(CHFONE_STORE_LINK_KEY);
    const storeLinks = result[CHFONE_STORE_LINK_KEY] || {};

    // 如果 baseUrl 不存在，创建一个新数组
    if (!storeLinks[baseUrl]) {
      storeLinks[baseUrl] = [];
    }

    // 检查是否存在相同 key 和 value 的记录
    const existingIndex = storeLinks[baseUrl].findIndex(
      (item: any) => item.key === data.key && item.value === data.value
    );

    if (existingIndex !== -1) {
      // 如果存在，更新该记录
      storeLinks[baseUrl][existingIndex] = {
        ...storeLinks[baseUrl][existingIndex],
        note,
        timestamp: Date.now(),
      };
    } else {
      // 如果不存在，添加新记录
      storeLinks[baseUrl].push({
        key: data.key,
        value: data.value,
        note,
        timestamp: Date.now(),
      });
    }

    // 保存更新后的数据
    await chrome.storage.local.set({
      [CHFONE_STORE_LINK_KEY]: storeLinks,
    });
  } catch (error) {
    console.error('Error adding store note:', error);
  }
};

export const getStoreLink = (baseUrl: string) => {
  return new Promise<any>((resolve, reject) => {
    chrome.storage.local.get(CHFONE_STORE_LINK_KEY, (result: any) => {
      resolve(result[CHFONE_STORE_LINK_KEY]);
    });
  });
};

interface DeleteStoreNoteParams {
  baseUrl: string;
  key: string;
  value: string;
}

interface AddStoreNoteParams {
  baseUrl: string;
  data: {
    key: string;
    value: string;
  };
  note: string;
}

export const deleteStoreNote = async ({ baseUrl, key, value }: DeleteStoreNoteParams) => {
  if (isDev()) {
    return;
  }

  try {
    const result = await chrome.storage.local.get(CHFONE_STORE_LINK_KEY);
    const storeLinks = result[CHFONE_STORE_LINK_KEY] || {};

    // 如果 baseUrl 不存在，直接返回
    if (!storeLinks[baseUrl]) {
      return;
    }

    // 过滤掉要删除的记录
    storeLinks[baseUrl] = storeLinks[baseUrl].filter(
      (item: any) => !(item.key === key && item.value === value)
    );

    // 如果该 baseUrl 下没有记录了，删除整个 baseUrl
    if (storeLinks[baseUrl].length === 0) {
      delete storeLinks[baseUrl];
    }

    // 保存更新后的数据
    await chrome.storage.local.set({
      [CHFONE_STORE_LINK_KEY]: storeLinks,
    });
  } catch (error) {
    console.error('Error deleting store note:', error);
  }
};
