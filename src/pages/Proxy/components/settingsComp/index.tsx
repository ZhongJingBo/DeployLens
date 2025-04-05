import React, { useState, useEffect } from 'react';
import { Switch, Label, Button } from '@/components/ui';
import { getProxyStatus } from '@/pages/Proxy/service';
import RequestForwardService from '@/pages/Proxy/service/requestForwardService';
import { RefreshCw } from 'lucide-react';
import { eventBus } from '@/lib/event-bus';
const SettingsComp: React.FC<{
  modeChange: (value: 'table' | 'editor') => void;
  mode: 'table' | 'editor';
}> = ({ modeChange, mode }) => {
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
  const handleModeChange = () => {
    modeChange(mode === 'table' ? 'editor' : 'table');
  };
  return (
    <div className="flex items-center gap-4 p-2">
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
          {proxyStatus ? '开启代理' : '关闭代理'}
        </Label>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleModeChange}
        className="flex items-center gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        <span>模式切换</span>
      </Button>
    </div>
  );
};

export default SettingsComp;
