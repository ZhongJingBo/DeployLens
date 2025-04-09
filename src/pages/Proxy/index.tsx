import React, { useState ,useEffect} from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { Button } from '@/components/ui';
import { Plus, X } from 'lucide-react';
import { ProxyProvider, useProxy } from './context/ProxyContext';
import Editor from './components/editor';
import { proxyGroupStatus, ProxyMode } from '@/model/proxy';
import { jsoncTransformProxyRule, commentProxyRuleById } from './utils';
import SettingsComp from './components/settingsComp';
import ProxyTable from './components/table';
import { getModeProxy } from '@/service/proxy';
const ProxyContent: React.FC = () => {
  const { state, dispatch } = useProxy();
  const [newTabName, setNewTabName] = useState('');
  const [isAddingTab, setIsAddingTab] = useState(false);
  const [mode, setMode] = useState<ProxyMode>(ProxyMode.TABLE);

  useEffect(() => {
    const fetchMode = async () => {
      const proxyData = await getModeProxy();
      setMode(proxyData?.mode || ProxyMode.TABLE);
    };
    fetchMode();
  }, []);
  const handleTabChange = (value: string) => {
    dispatch({ type: 'SET_CURRENT_TAB', payload: value });
  };

  const handleTabDoubleClick = (key: string) => {
    dispatch({ type: 'TOGGLE_TAB_STATUS', payload: key });
    // 更新 updateProxyData
  };
  const getTabStatusColor = (key: string) => {
    const status = state.proxyData[key]?.groupStatus;
    if (!status) return '';
    return status === proxyGroupStatus.ACTIVE
      ? 'text-primary font-bold before:content-[""] before:absolute before:left-2 before:top-1/2 before:-translate-y-1/2 before:w-2 before:h-2 before:rounded-full before:bg-primary'
      : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground';
  };

  const handleAddTab = () => {
    if (newTabName.trim()) {
      dispatch({ type: 'ADD_CUSTOM_TAB', payload: newTabName.trim() });
      setNewTabName('');
      setIsAddingTab(false);
    }
  };

  const handleDeleteTab = (tabName: string) => {
    dispatch({ type: 'DELETE_CUSTOM_TAB', payload: tabName });
  };

  const editorUpdateChange = (jsonc: string) => {
    const rule = jsoncTransformProxyRule(jsonc);

    dispatch({
      type: 'UPDATE_PROXY_DATA',
      payload: {
        key: state.currentTab,
        data: {
          rule,
          jsonc,
        },
      },
    });
  };

  const handleModeChange = (mode: ProxyMode) => {
    setMode(mode);
  };

  const handleRuleStatusChange = (ruleId: number, enabled: boolean) => {
    const newData = { ...state.proxyData };
    const currentTabData = { ...newData[state.currentTab] };
    const updatedRules = currentTabData.rule.map(rule =>
      rule.id === ruleId ? { ...rule, enabled } : rule
    );
    const commentedJsonc = commentProxyRuleById(ruleId, currentTabData.jsonc || '' ,enabled );
    console.log('commentedJsonc', commentedJsonc);
    dispatch({
      type: 'UPDATE_PROXY_DATA',
      payload: {
        key: state.currentTab,
        data: {
          rule: updatedRules,
          jsonc: commentedJsonc || '',
        },
      },
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold mb-4">Proxy Settings</h1>
        <div className="flex items-center gap-2">
          <SettingsComp
            modeChange={(value: ProxyMode) => handleModeChange(value)}
          />
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
            {Object.keys(state.proxyData).map(key => (
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

        {Object.keys(state.proxyData).map(key => (
          <TabsContent key={key} value={key}>
            {mode === ProxyMode.EDITOR ? (
              <Editor value={state.proxyData[key].jsonc || ''} onChange={editorUpdateChange} />
            ) : (
              <ProxyTable data={state.proxyData[key]} onRuleStatusChange={handleRuleStatusChange} />
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
