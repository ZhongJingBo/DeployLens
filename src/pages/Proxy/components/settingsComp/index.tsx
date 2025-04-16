import React, { useState, useEffect } from 'react';
import { Switch, Label, Button } from '@/components/ui';
import { getProxyStatus } from '@/pages/Proxy/service';
import RequestForwardService from '@/pages/Proxy/service/requestForwardService';
import { eventBus } from '@/lib/event-bus';
import { Rocket } from 'lucide-react';
import { ProxyMode } from '@/model/proxy';
const SettingsComp: React.FC<{
  mode: ProxyMode;
  setIsShowQuickProxyTable: (value: boolean) => void;
  showQuickProxyTable: boolean;
}> = ({ mode, setIsShowQuickProxyTable, showQuickProxyTable }) => {
  const [proxyStatus, setProxyStatus] = useState(false);

  useEffect(() => {
    // 初始化获取代理状态
    getProxyStatus().then(setProxyStatus);
    // 监听代理状态
    eventBus.on('proxy-rules-updated', handleRulesUpdated);
    return () => {
      eventBus.off('proxy-rules-updated', handleRulesUpdated);
    };
  }, []);

  const handleRulesUpdated = (count: number) => {
    setProxyStatus(count > 0);
  };

  const handleProxyStatusChange = (checked: boolean) => {
    setProxyStatus(checked);
    RequestForwardService.toggleProxy();
  };

  return (
    <div className="flex items-center gap-4 p-2">
      {mode === ProxyMode.TABLE && (
        <div className="flex items-center gap-2">
          {showQuickProxyTable ? (
            <Button variant="outline" size="sm" onClick={() => setIsShowQuickProxyTable(false)}>
              返回
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setIsShowQuickProxyTable(true)}>
              <Rocket className="h-4 w-4 mr-0.5" />
              快速代理
            </Button>
          )}
        </div>
      )}
      <div className="flex items-center gap-2">
        <Switch
          id="proxy-switch"
          checked={proxyStatus}
          onCheckedChange={handleProxyStatusChange}
          className="data-[state=checked]:bg-primary"
        />
        <Label
          htmlFor="proxy-switch"
          className={`text-sm font-medium ${proxyStatus ? 'text-primary' : 'text-muted-foreground'}`}
        >
          {proxyStatus ? '关闭代理' : '开启代理'}
        </Label>
      </div>
    </div>
  );
};

export default SettingsComp;
