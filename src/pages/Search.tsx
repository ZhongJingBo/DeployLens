import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ScriptInfo {
  src: string;
  type?: string;
  async?: boolean;
  defer?: boolean;
}

const Search: React.FC = () => {
  const [scripts, setScripts] = useState<ScriptInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCurrentTabScripts = async () => {
      try {
        // 获取当前活动标签页
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        console.log('Current tab:', tab);
        
        if (!tab.id) {
          console.error('No active tab found');
          return;
        }

        // 尝试注入内容脚本
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content-scripts/getScripts.js']
          });
        } catch (error) {
          console.log('Content script already injected or error:', error);
        }

        // 发送消息到内容脚本
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'getScripts' });
        console.log('Script info:', response);
        
        if (!response) {
          console.error('No response from content script');
          return;
        }

        setScripts(response);
      } catch (error) {
        console.error('Error getting scripts:', error);
        if (error instanceof Error) {
          console.error('Error details:', error.message);
          console.error('Error stack:', error.stack);
        }
      } finally {
        setLoading(false);
      }
    };

    getCurrentTabScripts();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Script Tags</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Found {scripts.length} Scripts</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {scripts.map((script, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
                  >
                    <div className="font-medium mb-2">
                      {script.src === 'inline script' ? 'Inline Script' : script.src}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {script.type && <div>Type: {script.type}</div>}
                      {script.async && <div>Async: Yes</div>}
                      {script.defer && <div>Defer: Yes</div>}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Search;
