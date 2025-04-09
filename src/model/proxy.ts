/**
 * 代理原始数据
 */
export interface ProxyGroup {
  key: string;
  group: string;
  groupEnabled: boolean;
  rule: ProxyRule[];
  jsonc?: string;
  groupStatus?: proxyGroupStatus;
}

/**
 * 代理规则
 */
export interface ProxyRule {
  id: number;
  pattern: string;
  target: string;
  enabled: boolean;
}

/**
 * 代理组级状态控制
 */
export enum proxyGroupStatus {
  /**
   * 激活
   */
  ACTIVE = 'active',
  /**
   * 禁用
   */
  INACTIVE = 'inactive',
}

export type ProxyData = {
  [key: string]: ProxyGroup;
};



export enum ProxyMode {
  EDITOR = 'Editor',
  TABLE = 'Table',
}



// 定义状态类型
export interface ProxyState {
  currentTab: string;
  customTabs: string[];
  tableProxyData: ProxyData;
  editorProxyData: string;
}

// 定义 action 类型
export type ProxyAction =
  | { type: 'SET_CURRENT_TAB'; payload: string }
  | { type: 'ADD_PROXY'; payload: ProxyGroup }
  | { type: 'ADD_CUSTOM_TAB'; payload: string }
  | { type: 'DELETE_CUSTOM_TAB'; payload: string }
  | { type: 'UPDATE_PROXY_DATA'; payload: { key: string; data: { rule: any[]; jsonc: string } } }
  | { type: 'TOGGLE_TAB_STATUS'; payload: string }
  | { type: 'INIT_PROXY_DATA'; payload: ProxyData };
