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

interface ScriptInfo {
  src: string;
  type?: string;
  async?: boolean;
  defer?: boolean;
}

const QuickProxyTable: React.FC = () => {
  const [scripts, setScripts] = useState<ScriptInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTabId, setCurrentTabId] = useState<number | null>(null);
  const [selectedScripts, setSelectedScripts] = useState<Set<number>>(new Set());

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

      // 尝试注入内容脚本
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

      // 过滤掉所有的 Inline Script
      const filteredScripts = response.filter(
        (script: ScriptInfo) => script.src !== 'inline script'
      );
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

  return (
    <div className="container mx-auto p-4">
      <ScrollArea className="h-[500px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={isAllSelected}
                  disabled={scripts.length === 0}
                  onCheckedChange={toggleAll}
                  className="translate-y-[2px]"
                  data-state={isAllSelected ? "checked" : isPartiallySelected ? "indeterminate" : "unchecked"}
                />
              </TableHead>
              <TableHead>Source</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scripts.map((script, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Checkbox
                    checked={selectedScripts.has(index)}
                    onCheckedChange={(checked) => toggleScript(index, checked as boolean)}
                    className="translate-y-[2px]"
                  />
                </TableCell>
                <TableCell className="font-medium truncate max-w-[400px]" title={script.src}>
                  {script.src === 'inline script' ? 'Inline Script' : script.src}
                </TableCell>
              </TableRow>
            ))}
            {scripts.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-4 text-muted-foreground">
                  No scripts found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>

      {loading && (
        <div className="flex justify-center items-center mt-4">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      )}
    </div>
  );
};

export default QuickProxyTable;
