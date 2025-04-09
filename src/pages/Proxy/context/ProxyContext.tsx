import React, { createContext, useContext, useReducer, useEffect } from 'react';
// 导入子逻辑模块的类型、Reducer 和初始状态
import { TableStatePart, TableAction, tableReducer, initialTableStatePart } from './TableProxyLogic';
import { EditorStatePart, EditorAction, editorReducer, initialEditorStatePart } from './EditorProxyLogic';
// 导入服务函数
import {
  initProxyData,
  updateProxyData,
} from '../service';
import { ProxyData } from '@/model/proxy';

export type ProxyState = TableStatePart & EditorStatePart;
export type ProxyAction = TableAction | EditorAction;

const initialState: ProxyState = {
  ...initialTableStatePart,
  ...initialEditorStatePart,
};

const ProxyContext = createContext<
  | {
      state: ProxyState;
      dispatch: React.Dispatch<ProxyAction>;
    }
  | undefined
>(undefined);

const isTableAction = (action: ProxyAction): action is TableAction => {
  const tableActionTypes = [
    'INIT_TABLE_DATA',
    'SET_CURRENT_TAB',
    'ADD_CUSTOM_TAB',
    'DELETE_CUSTOM_TAB',
    'UPDATE_TABLE_TAB_DATA',
    'TOGGLE_TABLE_TAB_STATUS'
  ];
  return tableActionTypes.includes(action.type);
};


const isEditorAction = (action: ProxyAction): action is EditorAction => {
  const editorActionTypes = [
    'INIT_EDITOR_DATA',
    'SET_EDITOR_CONTENT'
  ];
  return editorActionTypes.includes(action.type);
};

//Reducer
const proxyReducer = (state: ProxyState, action: ProxyAction): ProxyState => {
  if (isTableAction(action)) {
    const tableStateUpdate = tableReducer({
      currentTab: state.currentTab,
      customTabs: state.customTabs,
      tableProxyData: state.tableProxyData
    }, action);
    return { ...state, ...tableStateUpdate };
  } else if (isEditorAction(action)) {
    const editorStateUpdate = editorReducer({ editorProxyData: state.editorProxyData }, action);
    return { ...state, ...editorStateUpdate };
  }

  return state;
};

//Provider 组件
export const ProxyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(proxyReducer, initialState);

  // 加载初始数据 (表格和编辑器) - 逻辑不变
  useEffect(() => {
    initProxyData().then(data => {
      if (data && Object.keys(data).length > 0) {
        dispatch({ type: 'INIT_TABLE_DATA', payload: data as ProxyData });
      }
    }).catch(error => console.error("初始化表格代理数据失败:", error));

    initProxyData().then(data => {
      if (data && Object.keys(data).length > 0) {
        dispatch({ type: 'INIT_EDITOR_DATA', payload: data as ProxyData });
      }
    }).catch(error => console.error("初始化编辑器代理数据失败:", error));
  }, []);

  // 监听并保存表格数据的变化 - 逻辑不变
  useEffect(() => {
    if (Object.keys(state.tableProxyData).length > 0) {
      updateProxyData({
          // 确保只传递 ProxyData 部分给服务函数
          ...state.tableProxyData
      });
    }
  }, [state.tableProxyData]);

  // 监听并保存编辑器数据的变化 - 逻辑不变
  useEffect(() => {
    if (state.editorProxyData !== initialEditorStatePart.editorProxyData) {

      // 处理成为 ProxyData 类型
       updateProxyData(state.editorProxyData);
    }
  }, [state.editorProxyData]);

  return <ProxyContext.Provider value={{ state, dispatch }}>{children}</ProxyContext.Provider>;
};

// --- 统一的 Hook ---
export const useProxy = () => {
  const context = useContext(ProxyContext);
  if (context === undefined) {
    throw new Error('useProxy 必须在 ProxyProvider 内部使用');
  }
  return context;
};

/**
 * 采用单一 Provider (`ProxyProvider`) 和单一 Context (`ProxyContext`)。
 * 状态管理逻辑被拆分到：
 * - `TableProxyLogic.ts` (处理表格和 Tab 相关状态)
 * - `EditorProxyLogic.ts` (处理编辑器内容状态)
 * 主 Reducer (`proxyReducer`) 将 Action 委托给相应的子 Reducer。
 */