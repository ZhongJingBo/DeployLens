import { ProxyData, ProxyRule, proxyGroupStatus } from '@/model/proxy';

// --- 表格逻辑相关的 State 部分 ---
export interface TableStatePart {
  currentTab: string;
  customTabs: string[];
  tableProxyData: ProxyData;
}

// --- 表格逻辑相关的 Action 类型 ---
// (这些 Action 会被包含在 ProxyContext.tsx 的主 Action 类型中)
export type TableAction =
  | { type: 'INIT_TABLE_DATA'; payload: ProxyData }
  | { type: 'SET_CURRENT_TAB_TABLE'; payload: string }
  | { type: 'ADD_CUSTOM_TAB_TABLE'; payload: string }
  | { type: 'DELETE_CUSTOM_TAB_TABLE'; payload: string }
  | { type: 'UPDATE_TABLE_TAB_DATA'; payload: { key: string; data: { rule: ProxyRule[] } } }
  | { type: 'TOGGLE_TABLE_TAB_STATUS_TABLE'; payload: string };

// --- 表格逻辑的初始状态 ---
export const initialTableStatePart: TableStatePart = {
  currentTab: 'default',
  customTabs: [],
  tableProxyData: {} as ProxyData,
};

// --- 表格逻辑的 Reducer ---
// 这个 Reducer 只处理与表格数据和 Tab 相关的 Action
export const tableReducer = (state: TableStatePart, action: TableAction): TableStatePart => {
    switch (action.type) {
        case 'INIT_TABLE_DATA': {
            const tableData = action.payload;
            if (typeof tableData !== 'object' || tableData === null) {
                console.error("[TableLogic] INIT_TABLE_DATA 接收到无效数据:", tableData);
                return state;
            }
            const loadedTabs = Object.keys(tableData).filter(key => key !== 'default');
            return {
                ...state,
                tableProxyData: tableData,
                customTabs: loadedTabs,
                currentTab: tableData[state.currentTab] ? state.currentTab : (loadedTabs.length > 0 ? loadedTabs[0] : 'default'),
            };
        }
        case 'SET_CURRENT_TAB_TABLE':
            if (typeof action.payload === 'string' && (state.tableProxyData[action.payload] || action.payload === 'default')) {
                 return { ...state, currentTab: action.payload };
            }
             console.warn(`[TableLogic] 尝试切换到不存在或无效的标签页: ${action.payload}`);
            return state;

        case 'ADD_CUSTOM_TAB_TABLE': {
            const newTableProxyData = { ...state.tableProxyData };
            const tabKey = String(action.payload);
            if (newTableProxyData[tabKey]) {
                console.warn(`[TableLogic] 标签页 "${tabKey}" 已存在.`);
                return { ...state, currentTab: tabKey };
            }
            const newTabData = {
                key: tabKey,
                group: tabKey,
                groupEnabled: true,
                groupStatus: proxyGroupStatus.INACTIVE,
                rule: [{ id: Date.now(), pattern: '^https://example.com/new/.*', target: 'http://localhost:8080/$1', enabled: true }],
            };
            newTableProxyData[tabKey] = newTabData;
            
            return {
                ...state,
                customTabs: [...state.customTabs, tabKey],
                currentTab: tabKey,
                tableProxyData: newTableProxyData,
            };
        }
        case 'DELETE_CUSTOM_TAB_TABLE': {
            const tabToDelete = action.payload;
            if (tabToDelete === 'default') return state;
            if (!state.tableProxyData[tabToDelete]) return state;

            const { [tabToDelete]: removed, ...rest } = state.tableProxyData;
            const remainingTabs = state.customTabs.filter(tab => tab !== tabToDelete);
            let nextCurrentTab = state.currentTab;
            if (state.currentTab === tabToDelete) {
                nextCurrentTab = remainingTabs.length > 0 ? remainingTabs[0] : 'default';
            }
            return {
                ...state,
                customTabs: remainingTabs,
                currentTab: nextCurrentTab,
                tableProxyData: rest,
            };
        }
        case 'UPDATE_TABLE_TAB_DATA': {
            if (!action.payload?.key || !action.payload.data?.rule) return state;
            const { key, data } = action.payload;
            if (!state.tableProxyData[key]) return state;

            return {
                ...state,
                tableProxyData: {
                ...state.tableProxyData,
                [key]: { ...state.tableProxyData[key], rule: data.rule },
                },
            };
        }
        case 'TOGGLE_TABLE_TAB_STATUS_TABLE': {
            const tabKey = action.payload;
            if (!state.tableProxyData[tabKey]) return state;

            const currentItem = state.tableProxyData[tabKey];
            const nextStatus = currentItem.groupStatus === proxyGroupStatus.ACTIVE ? proxyGroupStatus.INACTIVE : proxyGroupStatus.ACTIVE;
            const nextEnabled = nextStatus === proxyGroupStatus.ACTIVE;
            return {
                ...state,
                tableProxyData: {
                ...state.tableProxyData,
                [tabKey]: { ...currentItem, groupStatus: nextStatus, groupEnabled: nextEnabled },
                },
            };
        }
        default:
            return state;
    }
}; 