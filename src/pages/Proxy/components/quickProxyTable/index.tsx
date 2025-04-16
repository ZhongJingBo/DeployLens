import React, { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Check, X } from 'lucide-react';
import {ProxyRule} from '@/model/proxy'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ScriptInfo {
  src: string;
  target: string;
  type?: string;
  async?: boolean;
  defer?: boolean;
}

const QuickProxyTable: React.FC<{
  onProxyChange: (proxyRules: ProxyRule[]) => void;
}> = ({ onProxyChange }) => {
  const [scripts, setScripts] = useState<ScriptInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTabId, setCurrentTabId] = useState<number | null>(null);
  const [selectedScripts, setSelectedScripts] = useState<Set<number>>(new Set());
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingScript, setEditingScript] = useState<ScriptInfo | null>(null);

  const getCurrentTabScripts = async () => {
    try {
      setLoading(true);
      // 获取当前活动标签页
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab.id) {
        console.error('No active tab found');
        return;
      }

      setCurrentTabId(tab.id);

      // 注入内容脚本
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content-scripts/getScripts.js'],
        });
      } catch (error) {
        console.log('Content script already injected or error:', error);
      }

      // 发送消息到内容脚本
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getScripts' });

      if (!response) {
        console.error('No response from content script');
        return;
      }

      // 过滤掉所有的 Inline Script，并为每个脚本添加初始 target
      const filteredScripts = response
        .filter((script: ScriptInfo) => script.src !== 'inline script')
        .map((script: ScriptInfo) => ({
          ...script,
          target: script.src, // 初始时 target 与 src 相同
        }));
      setScripts(filteredScripts);
      // 重置选中状态
      setSelectedScripts(new Set());
    } catch (error) {
      console.error('Error getting scripts:', error);
      setScripts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 初始加载
    getCurrentTabScripts();

    // 监听标签页激活事件
    const handleTabActivated = (activeInfo: chrome.tabs.TabActiveInfo) => {
      getCurrentTabScripts();
    };

    // 监听标签页更新事件
    const handleTabUpdated = (
      tabId: number,
      changeInfo: chrome.tabs.TabChangeInfo,
      tab: chrome.tabs.Tab
    ) => {
      if (changeInfo.status === 'complete' && tabId === currentTabId) {
        getCurrentTabScripts();
      }
    };

    // 添加事件监听
    chrome.tabs.onActivated.addListener(handleTabActivated);
    chrome.tabs.onUpdated.addListener(handleTabUpdated);

    // 清理函数
    return () => {
      chrome.tabs.onActivated.removeListener(handleTabActivated);
      chrome.tabs.onUpdated.removeListener(handleTabUpdated);
    };
  }, [currentTabId]);



  const toggleAll = (checked: boolean | 'indeterminate') => {
    if (typeof checked === 'boolean') {
      if (checked) {
        setSelectedScripts(new Set(scripts.map((_, index) => index)));
      } else {
        setSelectedScripts(new Set());
      }
    }
  };

  const toggleScript = (index: number, checked: boolean | 'indeterminate') => {
    if (typeof checked === 'boolean') {
      const newSelected = new Set(selectedScripts);
      if (checked) {
        newSelected.add(index);
      } else {
        newSelected.delete(index);
      }
      setSelectedScripts(newSelected);
    }
  };

  const isAllSelected = scripts.length > 0 && selectedScripts.size === scripts.length;
  const isPartiallySelected = selectedScripts.size > 0 && selectedScripts.size < scripts.length;

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditingScript({ ...scripts[index] });
  };

  const handleSave = () => {
    if (editingIndex !== null && editingScript) {
      const newScripts = [...scripts];
      newScripts[editingIndex] = editingScript;
      setScripts(newScripts);
      setEditingIndex(null);
      setEditingScript(null);
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditingScript(null);
  };

  const handleConfirmProxy = () => {
    const selectedScriptsList = Array.from(selectedScripts).map((index) => {
      const script = scripts[index];
      const proxyRule: ProxyRule = {
        id: Math.floor(Date.now() / 1000) * 1000 + index, // 使用秒级时间戳乘以1000加上索引，确保是整数
        pattern: script.src,
        target: script.target,
        enabled: true
      };
      return proxyRule;
    });
    onProxyChange(selectedScriptsList);
  };

  return (
    <div className="w-full">
      <div className="min-w-[350px] w-full rounded-lg border border-border/40 shadow-md text-[13px] relative">
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/60 hover:bg-muted/60">
                <TableHead className="w-[60px] text-center font-semibold whitespace-nowrap">
                  <Checkbox
                    checked={isAllSelected}
                    disabled={scripts.length === 0}
                    onCheckedChange={toggleAll}
                    className="translate-y-[2px]"
                    data-state={
                      isAllSelected ? 'checked' : isPartiallySelected ? 'indeterminate' : 'unchecked'
                    }
                  />
                </TableHead>
                <TableHead className="w-[40%] font-semibold whitespace-nowrap">来源</TableHead>
                <TableHead className="w-[40%] font-semibold whitespace-nowrap">目标</TableHead>
                <TableHead className="w-[100px] text-right font-semibold whitespace-nowrap pr-4">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="relative">
              {scripts.map((script, index) => (
                <TableRow 
                  key={index}
                  className="hover:bg-muted/30 transition-colors duration-200"
                >
                  <TableCell className="py-2 px-2">
                    <div className="flex justify-center items-center">
                      <Checkbox
                        checked={selectedScripts.has(index)}
                        onCheckedChange={checked => toggleScript(index, checked as boolean)}
                        className="translate-y-[2px]"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="py-2 px-2 relative">
                    {editingIndex === index ? (
                      <Input
                        value={editingScript?.src || ''}
                        onChange={e =>
                          setEditingScript(prev => (prev ? { ...prev, src: e.target.value } : null))
                        }
                        placeholder="输入来源地址"
                        className="h-8 text-[13px]"
                      />
                    ) : (
                      <TooltipProvider delayDuration={300}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="truncate text-[13px] absolute inset-y-0 left-0 right-0 py-2 px-2 flex items-center">
                              {script.src}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="max-w-[400px] break-all">
                            <p className="font-mono text-[13px]">{script.src}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </TableCell>
                  <TableCell className="py-2 px-2 relative">
                    {editingIndex === index ? (
                      <Input
                        value={editingScript?.target || ''}
                        onChange={e =>
                          setEditingScript(prev =>
                            prev ? { ...prev, target: e.target.value } : null
                          )
                        }
                        placeholder="输入目标地址"
                        className="h-8 text-[13px]"
                      />
                    ) : (
                      <TooltipProvider delayDuration={300}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="truncate text-[13px] absolute inset-y-0 left-0 right-0 py-2 px-2 flex items-center">
                              {script.target}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="max-w-[400px] break-all">
                            <p className="font-mono text-[13px]">{script.target}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </TableCell>
                  <TableCell className="py-2 px-2">
                    <div className="flex justify-end items-center gap-1 pr-4">
                      {editingIndex === index ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={handleSave}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={handleCancel}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleEdit(index)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {scripts.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    暂无可用的脚本
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-32">
          <div className="text-muted-foreground animate-pulse">加载中...</div>
        </div>
      )}

      <div className="flex justify-end items-center mt-4">
        <Button
          onClick={handleConfirmProxy}
          disabled={selectedScripts.size === 0}
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1"
        >
          确认代理 ({selectedScripts.size})
        </Button>
      </div>
    </div>
  );
};

export default QuickProxyTable;
