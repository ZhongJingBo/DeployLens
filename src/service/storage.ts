import { isDev } from '@/utils/env';
import { ProxyData, ProxyMode } from '@/model/proxy';
import { CHFONE_STORE_PROXY_EDITOR_KEY, CHFONE_STORE_PROXY_TABLE_KEY } from '@/constants';

interface StorageAdapter {
  get: <T>(key: string) => Promise<T | null>;
  set: <T>(key: string, value: T) => Promise<void>;
  getProxyData: (mode: ProxyMode) => Promise<ProxyData | null>;
  setProxyData: (data: ProxyData, mode: ProxyMode) => Promise<void>;
}

class LocalStorageAdapter implements StorageAdapter {
  async get<T>(key: string): Promise<T | null> {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    localStorage.setItem(key, JSON.stringify(value));
  }

  async getProxyData(mode: ProxyMode): Promise<ProxyData | null> {
    const key = mode === ProxyMode.EDITOR ? CHFONE_STORE_PROXY_EDITOR_KEY : CHFONE_STORE_PROXY_TABLE_KEY;
    return this.get<ProxyData>(key);
  }

  async setProxyData(data: ProxyData, mode: ProxyMode): Promise<void> {
    const key = mode === ProxyMode.EDITOR ? CHFONE_STORE_PROXY_EDITOR_KEY : CHFONE_STORE_PROXY_TABLE_KEY;
    await this.set(key, data);
  }
}

class ChromeStorageAdapter implements StorageAdapter {
  async get<T>(key: string): Promise<T | null> {
    const result = await chrome.storage.local.get(key);
    return result[key] || null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    await chrome.storage.local.set({ [key]: value });
  }

  async getProxyData(mode: ProxyMode): Promise<ProxyData | null> {
    const key = mode === ProxyMode.EDITOR ? CHFONE_STORE_PROXY_EDITOR_KEY : CHFONE_STORE_PROXY_TABLE_KEY;
    return this.get<ProxyData>(key);
  }

  async setProxyData(data: ProxyData, mode: ProxyMode): Promise<void> {
    const key = mode === ProxyMode.EDITOR ? CHFONE_STORE_PROXY_EDITOR_KEY : CHFONE_STORE_PROXY_TABLE_KEY;
    await this.set(key, data);
  }
}

// 存储适配器单例
let storageAdapter: StorageAdapter;

/**
 * 获取存储适配器实例
 */
export const getStorageAdapter = (): StorageAdapter => {
  if (!storageAdapter) {
    storageAdapter = isDev() ? new LocalStorageAdapter() : new ChromeStorageAdapter();
  }
  return storageAdapter;
};

/**
 * 统一的存储服务接口
 */
export const storage = {
  /**
   * 获取存储的值
   * @param key 存储键
   * @returns 存储的值
   */
  get: async <T>(key: string): Promise<T | null> => {
    return getStorageAdapter().get<T>(key);
  },

  /**
   * 设置存储的值
   * @param key 存储键
   * @param value 要存储的值
   */
  set: async <T>(key: string, value: T): Promise<void> => {
    return getStorageAdapter().set<T>(key, value);
  },

  /**
   * 获取代理数据
   * @param mode 代理模式
   * @returns 代理数据
   */
  getProxyData: async (mode: ProxyMode): Promise<ProxyData | null> => {
    return getStorageAdapter().getProxyData(mode);
  },

  /**
   * 设置代理数据
   * @param data 代理数据
   * @param mode 代理模式
   */
  setProxyData: async (data: ProxyData, mode: ProxyMode): Promise<void> => {
    return getStorageAdapter().setProxyData(data, mode);
  }
};
