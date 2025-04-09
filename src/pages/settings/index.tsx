import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { getModeProxy, setModeProxy } from '@/service/proxy';
import { ProxyMode } from '@/model/proxy';
const Settings: React.FC = () => {
  const [mode, setMode] = useState<ProxyMode>(ProxyMode.TABLE);

  useEffect(() => {
    const fetchMode = async () => {
      const proxyData = await getModeProxy();
      setMode(proxyData?.mode || ProxyMode.TABLE);
    };
    fetchMode();
  }, []);

  const handleModeChange = (value: ProxyMode) => {
    setMode(value);
    setModeProxy(value);
  };

  return (
    <div className="container mx-auto p-4">
      <h3 className="text-2xl font-bold mb-8 ">代理设置</h3>

      <Card className="w-full max-w-3xl border-muted">
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* 服务提供商选择部分 */}
            <div className="space-y-4">
              <div className="flex justify-between gap-2">
                <h4 className=" font-semibold text-xl">代理模式</h4>
                <div className="flex items-center w-60">
                  <Select value={mode} onValueChange={handleModeChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="选择代理模式" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Table">Table</SelectItem>
                      <SelectItem value="Editor">Editor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 服务说明 */}
              <p className="text-gray-600 text-sm leading-relaxed">
                提供两种代理编辑模式，Table可视化编辑 和 Editor 代码编辑。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
