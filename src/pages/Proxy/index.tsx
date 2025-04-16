import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { Button } from '@/components/ui';
import { Plus, X } from 'lucide-react';
import { ProxyProvider, useProxy } from './context/ProxyContext';
import Editor from './components/editor';
import { proxyGroupStatus, ProxyMode, ProxyGroup, ProxyRule } from '@/model/proxy';
import { jsoncTransformProxyRule } from './utils';
import SettingsComp from './components/settingsComp';
import ProxyTable from './components/table';
import { getModeProxy } from '@/service/proxy';
import { initProxyData } from './service';
import { eventBus } from '@/lib/event-bus';
import QuickProxyTable from './components/quickProxyTable';
const ProxyContent: React.FC = () => {
  const { state, dispatch } = useProxy();
  const [newTabName, setNewTabName] = useState('');
  const [isAddingTab, setIsAddingTab] = useState(false);
  const [mode, setMode] = useState<ProxyMode>(ProxyMode.TABLE);
  const [showQuickProxyTable, setsShowQuickProxyTable] = useState(false);

  useEffect(() => {
    const fetchMode = async () => {
      const proxyData = await getModeProxy();
      setMode(proxyData?.mode || ProxyMode.TABLE);
    };
    fetchMode();

    // 监听模式改变事件
    const handleModeChange = async (newMode: ProxyMode) => {
      setMode(newMode);
      try {
        const proxyData = await initProxyData();
        const actionType = newMode === ProxyMode.TABLE ? 'INIT_TABLE_DATA' : 'INIT_EDITOR_DATA';
        dispatch({ type: actionType, payload: proxyData });
      } catch (error) {
        console.error('获取代理数据失败:', error);
      }
    };

    eventBus.on('proxyModeChange', handleModeChange);

    // 清理事件监听
    return () => {
      eventBus.off('proxyModeChange', handleModeChange);
    };
  }, []);





  /**
   * 处理标签页改变
   * @param value 标签页名称
   */
  const handleTabChange = (value: string) => {
    const currentData = getCurrentData();
    if (currentData && currentData[value]) {
      const actionType =
        mode === ProxyMode.TABLE ? 'SET_CURRENT_TAB_TABLE' : 'SET_CURRENT_TAB_EDITOR';
      dispatch({ type: actionType, payload: value });
    } else {
      console.warn(`[ProxyContent] 标签页 "${value}" 不存在或未完全加载`);
    }
  };

  /**
   * 处理标签页双击
   * @param key 标签页名称
   */
  const handleTabDoubleClick = (key: string) => {
    console.log('handleTabDoubleClick', key);
    const actionType =
      mode === ProxyMode.TABLE ? 'TOGGLE_TABLE_TAB_STATUS_TABLE' : 'TOGGLE_TABLE_TAB_STATUS_EDITOR';
    dispatch({ type: actionType, payload: key });

    console.log('state.tableProxyData', state);
  };

  /**
   * 获取标签页状态颜色
   * @param key 标签页名称
   * @returns 标签页状态颜色
   */
  const getTabStatusColor = (key: string) => {
    const status =
      mode === ProxyMode.TABLE
        ? state.tableProxyData[key]?.groupStatus
        : state.editorProxyData[key]?.groupStatus;
    if (!status) return '';
    return status === proxyGroupStatus.ACTIVE
      ? 'text-primary font-bold before:content-[""] before:absolute before:left-2 before:top-1/2 before:-translate-y-1/2 before:w-2 before:h-2 before:rounded-full before:bg-primary'
      : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground';
  };

  /**
   * 处理添加标签页
   */
  const handleAddTab = () => {
    if (newTabName.trim()) {
      const actionType =
        mode === ProxyMode.TABLE ? 'ADD_CUSTOM_TAB_TABLE' : 'ADD_CUSTOM_TAB_EDITOR';
      dispatch({ type: actionType, payload: newTabName.trim() });
      setNewTabName('');
      setIsAddingTab(false);
    }
  };

  /**
   * 处理删除标签页
   * @param tabName 标签页名称
   */
  const handleDeleteTab = (tabName: string) => {
    const actionType =
      mode === ProxyMode.TABLE ? 'DELETE_CUSTOM_TAB_TABLE' : 'DELETE_CUSTOM_TAB_EDITOR';
    dispatch({ type: actionType, payload: tabName });
    handleTabChange('default');
  };

  /**
   * 处理编辑器内容改变
   * @param jsonc 编辑器内容
   */
  const editorUpdateChange = (jsonc: string) => {
    const rule = jsoncTransformProxyRule(jsonc);
    dispatch({
      type: 'SET_EDITOR_CONTENT',
      payload: {
        ...state.editorProxyData,
        [state.currentTab]: {
          ...state.editorProxyData[state.currentTab],
          jsonc,
          rule,
        },
      },
    });
  };

  /**
   * 处理规则状态改变
   * @param data 更新后的完整数据
   */
  const handleRuleStatusChange = (data: ProxyGroup) => {
    dispatch({
      type: 'UPDATE_TABLE_TAB_DATA',
      payload: {
        key: state.currentTab,
        data: {
          rule: data.rule,
        },
      },
    });
  };

  /**
   * 获取当前数据
   * @returns
   */
  const getCurrentData = () => {

    return mode === ProxyMode.TABLE ? state.tableProxyData : state.editorProxyData;
  };


  const quickOnProxyChange = (proxyRules: ProxyRule[]) => {
    setsShowQuickProxyTable(false);
    
    // 获取当前标签页的现有规则
    const currentTabData = state.tableProxyData[state.currentTab];
    const existingRules = currentTabData?.rule || [];
    
    // 处理新规则，去掉首尾空格
    const processedRules = proxyRules.map(rule => ({
      ...rule,
      pattern: rule.pattern.trim(),
      target: rule.target.trim()
    }));

    const mergedRules = [...existingRules];
    processedRules.forEach(newRule => {
      const existingRuleIndex = mergedRules.findIndex(rule => rule.pattern === newRule.pattern && rule.target === newRule.target);
      if (existingRuleIndex === -1) {
        // 如果规则不存在，添加到合并列表中
        mergedRules.push({ ...newRule, id: Date.now() * 1000 + Math.floor(Math.random() * 1000) });
      }
    });

    dispatch({
      type: 'UPDATE_TABLE_TAB_DATA',
      payload: {
        key: state.currentTab,
        data: {
          rule: mergedRules,
        },
      },
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold mb-4">Proxy Settings</h1>
        <div className="flex items-center gap-2">
          <SettingsComp mode={mode} setIsShowQuickProxyTable={setsShowQuickProxyTable} showQuickProxyTable={showQuickProxyTable} />
        </div>
      </div>
      <Tabs
        defaultValue="default"
        className="w-full"
        value={state.currentTab}
        onValueChange={handleTabChange}
      >
        <TabsList className="flex w-full items-center h-10">
          <div className="flex-1 flex overflow-x-auto scrollbar-hide h-full">
            {Object.keys(getCurrentData()).map(key => (
              <TabsTrigger
                key={key}
                value={key}
                className={`flex-shrink-0 h-full relative group ${state.customTabs.includes(key) ? 'pr-8' : ''} ${getTabStatusColor(key)}`}
                onDoubleClick={() => handleTabDoubleClick(key)}
              >
                {key}
                {state.customTabs.includes(key) && (
                  <div
                    className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 h-6 w-6 flex items-center justify-center cursor-pointer hover:bg-gray-100 rounded"
                    onClick={e => {
                      e.stopPropagation();
                      handleDeleteTab(key);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </div>
                )}
              </TabsTrigger>
            ))}
          </div>
          <div className="ml-2 flex-shrink-0 h-full">
            {!isAddingTab ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-full"
                onClick={() => setIsAddingTab(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            ) : (
              <div className="flex items-center gap-2 h-full">
                <input
                  type="text"
                  value={newTabName}
                  onChange={e => setNewTabName(e.target.value)}
                  className="w-32 px-2 py-1 border rounded h-8"
                  placeholder="Tab name"
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleAddTab();
                    }
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-full"
                  onClick={() => {
                    setIsAddingTab(false);
                    setNewTabName('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </TabsList>

        {Object.keys(getCurrentData()).map(key => (
          <TabsContent key={key} value={key}>
            {mode === ProxyMode.EDITOR ? (
              <Editor value={getCurrentData()[key].jsonc || ''} onChange={editorUpdateChange} />
            ) : (
              showQuickProxyTable ? (
                <QuickProxyTable onProxyChange={quickOnProxyChange} />
              ) : (
                <ProxyTable
                  data={getCurrentData()[key]}
                  onRuleStatusChange={handleRuleStatusChange}
                />
              )
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

const Proxy: React.FC = () => {
  return (
    <ProxyProvider>
      <ProxyContent />
    </ProxyProvider>
  );
};

export default Proxy;
