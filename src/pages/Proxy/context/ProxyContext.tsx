import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getModeProxy } from '@/service/proxy';
// 导入子逻辑模块的类型、Reducer 和初始状态
import {
  TableStatePart,
  TableAction,
  tableReducer,
  initialTableStatePart,
} from './TableProxyLogic';
import {
  EditorStatePart,
  EditorAction,
  editorReducer,
  initialEditorStatePart,
} from './EditorProxyLogic';
// 导入服务函数
import { initProxyData, updateProxyData } from '../service';
import { ProxyData, ProxyMode } from '@/model/proxy';

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
    'SET_CURRENT_TAB_TABLE',
    'ADD_CUSTOM_TAB_TABLE',
    'DELETE_CUSTOM_TAB_TABLE',
    'UPDATE_TABLE_TAB_DATA',
    'TOGGLE_TABLE_TAB_STATUS_TABLE',
  ];
  return tableActionTypes.includes(action.type);
};

const isEditorAction = (action: ProxyAction): action is EditorAction => {
  const editorActionTypes = [
    'INIT_EDITOR_DATA',
    'SET_EDITOR_CONTENT',
    'ADD_CUSTOM_TAB_EDITOR',
    'DELETE_CUSTOM_TAB_EDITOR',
    'SET_CURRENT_TAB_EDITOR',
    'TOGGLE_TABLE_TAB_STATUS_EDITOR',
  ];
  return editorActionTypes.includes(action.type);
};

//Reducer
const proxyReducer = (state: ProxyState, action: ProxyAction): ProxyState => {
  if (isTableAction(action)) {
    const tableStateUpdate = tableReducer(
      {
        currentTab: state.currentTab,
        customTabs: state.customTabs,
        tableProxyData: state.tableProxyData,
      },
      action
    );
    return { ...state, ...tableStateUpdate };
  } else if (isEditorAction(action)) {
    const editorStateUpdate = editorReducer(
      { 
        editorProxyData: state.editorProxyData, 
        currentTab: state.currentTab,
        customTabs: state.customTabs 
      },
      action
    );
    return { ...state, ...editorStateUpdate };
  }

  return state;
};

//Provider 组件
export const ProxyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(proxyReducer, initialState);
  const [currentMode, setCurrentMode] = React.useState<ProxyMode | undefined>();

  // 监听模式变化
  useEffect(() => {
    const initMode = async () => {
      const modeProxy = await getModeProxy();
      setCurrentMode(modeProxy?.mode);
    };
    initMode();
  }, []);

  // 监听表格模式数据变化
  useEffect(() => {
    if (currentMode === ProxyMode.TABLE && Object.keys(state.tableProxyData).length > 0) {
      updateProxyData(state.tableProxyData);
    }
  }, [currentMode, state.tableProxyData]);

  // 监听编辑器模式数据变化
  useEffect(() => {
    if (currentMode === ProxyMode.EDITOR && state.editorProxyData !== initialEditorStatePart.editorProxyData) {
      updateProxyData(state.editorProxyData);
    }
  }, [currentMode, state.editorProxyData]);

  // 加载初始数据 (表格和编辑器) - 逻辑不变
  useEffect(() => {
    initProxyData()
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          dispatch({ type: 'INIT_TABLE_DATA', payload: data as ProxyData });
        }
      })
      .catch(error => console.error('初始化表格代理数据失败:', error));

    initProxyData()
      .then(data => {
        console.log('data111', data);
        if (data && Object.keys(data).length > 0) {
          dispatch({ type: 'INIT_EDITOR_DATA', payload: data as ProxyData });
        }
      })
      .catch(error => console.error('初始化编辑器代理数据失败:', error));
  }, []);

  return <ProxyContext.Provider value={{ state, dispatch }}>{children}</ProxyContext.Provider>;
};

// Hooks
export const useProxy = () => {
  const context = useContext(ProxyContext);
  if (context === undefined) {
    throw new Error('useProxy 必须在 ProxyProvider 内部使用');
  }
  return context;
};
