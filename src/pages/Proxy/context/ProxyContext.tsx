import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { JSONC } from '@/constants';
import { ProxyState, proxyGroupStatus, ProxyData, ProxyAction } from '@/model/proxy';
import { initProxyData, updateProxyData } from '../service';

// 初始状态
const initialState: ProxyState = {
  currentTab: 'default',
  customTabs: [],
  proxyData: {} as ProxyData,
};

// Context
const ProxyContext = createContext<
  | {
      state: ProxyState;
      dispatch: React.Dispatch<ProxyAction>;
    }
  | undefined
>(undefined);

//  reducer
const proxyReducer = (state: ProxyState, action: ProxyAction): ProxyState => {
  switch (action.type) {
    case 'SET_CURRENT_TAB':
      return {
        ...state,
        currentTab: action.payload,
      };
    case 'INIT_PROXY_DATA':
      return {
        ...state,
        proxyData: action.payload,
      };
    case 'ADD_CUSTOM_TAB':
      const newProxyData = { ...state.proxyData };
      const tabKey = String(action.payload);
      delete newProxyData[tabKey];
      newProxyData[tabKey] = {
        key: tabKey,
        group: tabKey,
        groupEnabled: true,
        groupStatus: proxyGroupStatus.INACTIVE,
        rule: [
          {
            id: 1,
            pattern: '^https://api.example.com/users/.*',
            target: 'https://test-api.example.com/users/',
            enabled: true,
          },
          {
            id: 2,
            pattern: '^https://api.example.com/users/.*',
            target: 'https://test-api.example.com/users/',
            enabled: true,
          },
        ],
        jsonc: JSONC,
      };
      return {
        ...state,
        customTabs: [...state.customTabs, tabKey],
        currentTab: tabKey,
        proxyData: newProxyData,
      };
    // 删除tab
    case 'DELETE_CUSTOM_TAB':
      const { [action.payload]: removed, ...rest } = state.proxyData;
      return {
        ...state,
        customTabs: state.customTabs.filter(tab => tab !== action.payload),
        currentTab: state.currentTab === action.payload ? 'default' : state.currentTab,
        proxyData: rest,
      };
    // 更新proxyData
    case 'UPDATE_PROXY_DATA':
      return {
        ...state,
        proxyData: {
          ...state.proxyData,
          [action.payload.key]: {
            ...state.proxyData[action.payload.key],
            rule: action.payload.data.rule,
            jsonc: action.payload.data.jsonc,
          },
        },
      };
    // 切换tab状态
    case 'TOGGLE_TAB_STATUS':
      return {
        ...state,
        proxyData: {
          ...state.proxyData,
          [action.payload]: {
            ...state.proxyData[action.payload],
            groupStatus:
              state.proxyData[action.payload].groupStatus === proxyGroupStatus.ACTIVE
                ? proxyGroupStatus.INACTIVE
                : proxyGroupStatus.ACTIVE,
          },
        },
      };
    default:
      return state;
  }
};

//  Provider 组件
export const ProxyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(proxyReducer, initialState);

  useEffect(() => {
    initProxyData().then(data => {
      if (data) {
        dispatch({ type: 'INIT_PROXY_DATA', payload: data });
      }
    });
  }, []);

  // 监听state.proxyData的变化
  useEffect(() => {
    if (Object.keys(state.proxyData).length > 0) {
      updateProxyData(state.proxyData);
    }
  }, [state.proxyData]);

  return <ProxyContext.Provider value={{ state, dispatch }}>{children}</ProxyContext.Provider>;
};

//  hook
export const useProxy = () => {
  const context = useContext(ProxyContext);
  if (context === undefined) {
    throw new Error('useProxy must be used within a ProxyProvider');
  }
  return context;
};
