import { EDITOR_PROXY, EDITOR_PROXY_JSONC } from '@/constants';
import { ProxyData, proxyGroupStatus } from '@/model/proxy';
// --- 编辑器逻辑相关的 State 部分 ---
export interface EditorStatePart {
  editorProxyData: ProxyData;
  currentTab: string;
  customTabs: string[];
}

// --- 编辑器逻辑相关的 Action 类型 ---
export type EditorAction =
  | { type: 'INIT_EDITOR_DATA'; payload: ProxyData }
  | { type: 'SET_EDITOR_CONTENT'; payload: ProxyData }
  | { type: 'ADD_CUSTOM_TAB_EDITOR'; payload: string }
  | { type: 'DELETE_CUSTOM_TAB_EDITOR'; payload: string }
  | { type: 'SET_CURRENT_TAB_EDITOR'; payload: string }
  | { type: 'TOGGLE_TABLE_TAB_STATUS_EDITOR'; payload: string };

// --- 编辑器逻辑的初始状态 ---
export const initialEditorStatePart: EditorStatePart = {
  editorProxyData: EDITOR_PROXY,
  currentTab: 'default',
  customTabs: [],
};

// --- 编辑器逻辑的 Reducer ---
// 这个 Reducer 只处理与编辑器数据相关的 Action
export const editorReducer = (state: EditorStatePart, action: EditorAction): EditorStatePart => {
  switch (action.type) {
    case 'INIT_EDITOR_DATA': {
      const editorData = action.payload;
      if (typeof editorData !== 'object' || editorData === null) {
        console.error("[EditorLogic] INIT_EDITOR_DATA 接收到无效数据:", editorData);
        return state;
      }
      const loadedTabs = Object.keys(editorData).filter(key => key !== 'default');
      return {
        ...state,
        editorProxyData: editorData || EDITOR_PROXY,
        customTabs: loadedTabs,
        currentTab: editorData[state.currentTab] ? state.currentTab : (loadedTabs.length > 0 ? loadedTabs[0] : 'default'),
      };
    }
    case 'SET_EDITOR_CONTENT':
      return {
        ...state,
        editorProxyData: action.payload,
      };
    case 'SET_CURRENT_TAB_EDITOR':
      if (
        typeof action.payload === 'string' &&
        (state.editorProxyData[action.payload] || action.payload === 'default')
      ) {
        return { ...state, currentTab: action.payload };
      }
      console.warn(`[EditorLogic] 尝试切换到不存在或无效的标签页: ${action.payload}`);
      return state;
    case 'ADD_CUSTOM_TAB_EDITOR': {
      const tabKey = action.payload;
      const newTabData = {
        key: tabKey,
        group: tabKey,
        groupEnabled: true,
        groupStatus: proxyGroupStatus.ACTIVE,
        jsonc: EDITOR_PROXY_JSONC,
        rule: [],
      };
      const newEditorProxyData = {
        ...state.editorProxyData,
        [tabKey]: newTabData,
      };
      return {
        ...state,
        editorProxyData: newEditorProxyData,
        customTabs: [...state.customTabs, tabKey],
        currentTab: tabKey,
      };
    }
    case 'DELETE_CUSTOM_TAB_EDITOR': {
      const tabToDelete = action.payload;
      if (tabToDelete === 'default') return state;
      if (!state.editorProxyData[tabToDelete]) return state;

      const { [tabToDelete]: removed, ...rest } = state.editorProxyData;
      const remainingTabs = state.customTabs.filter(tab => tab !== tabToDelete);
      let nextCurrentTab = state.currentTab;
      if (state.currentTab === tabToDelete) {
        nextCurrentTab = remainingTabs.length > 0 ? remainingTabs[0] : 'default';
      }
      return {
        ...state,
        editorProxyData: rest,
        customTabs: remainingTabs,
        currentTab: nextCurrentTab,
      };
    }
    case 'TOGGLE_TABLE_TAB_STATUS_EDITOR': {
      const tabKey = action.payload;
      if (!state.editorProxyData[tabKey]) return state;

      const currentItem = state.editorProxyData[tabKey];
      const nextStatus =
        currentItem.groupStatus === proxyGroupStatus.ACTIVE
          ? proxyGroupStatus.INACTIVE
          : proxyGroupStatus.ACTIVE;
      const nextEnabled = nextStatus === proxyGroupStatus.ACTIVE;
      return {
        ...state,
        editorProxyData: {
          ...state.editorProxyData,
          [tabKey]: { ...currentItem, groupStatus: nextStatus, groupEnabled: nextEnabled },
        },
      };
    }
    default:
      return state;
  }
};
