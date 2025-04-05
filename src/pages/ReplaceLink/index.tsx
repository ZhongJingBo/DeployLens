import React, { useState, useEffect } from 'react';
import { Copy, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { getData, addStoreNoteState, getStoreLink, deleteStoreNote } from './service';
import {
  parseUrlAndQueryParams,
  handleCopyBaseUrl,
  handleCopyQueryParams,
  replaceLink,
} from './utils';
import {
  Input,
  Button,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { isProd } from '@/utils/env';
interface StoreLinkItem {
  key: string;
  value: string;
  note?: string;
  timestamp?: number;
}

const ReplaceLink: React.FC = () => {
  const [url, setUrl] = useState({
    baseUrl: '',
    currentUrl: '',
  });
  const [queryParams, setQueryParams] = useState<Record<string, string>[]>([]);
  const [expandedParams, setExpandedParams] = useState<number[]>([]);
  const [note, setNote] = useState<string>('');
  const [openPopover, setOpenPopover] = useState<number | null>(null);
  const [storeLinks, setStoreLinks] = useState<StoreLinkItem[]>([]);

  useEffect(() => {
    initData();

    // 监听标签页激活事件
    const handleTabActivated = (activeInfo: { tabId: number; windowId: number }) => {
      initData();
    };

    // 监听标签页更新事件
    const handleTabUpdated = (tabId: number, changeInfo: { url?: string }) => {
      if (changeInfo.url) {
        initData();
      }
    };

    if (isProd()) {
      chrome.tabs.onActivated.addListener(handleTabActivated);
      chrome.tabs.onUpdated.addListener(handleTabUpdated);
    }
    // 添加事件监听器

    // 清理函数
    return () => {
      if (isProd()) {
        chrome.tabs.onActivated.removeListener(handleTabActivated);
        chrome.tabs.onUpdated.removeListener(handleTabUpdated);
      }
    };
  }, []);

  const initData = () => {
    getData().then(url => {
      const { baseUrl, queryParams } = parseUrlAndQueryParams(url);
      setUrl({
        baseUrl,
        currentUrl: url,
      });
      setQueryParams(queryParams);

      // 在获取到 baseUrl 后再获取 storeLinks
      getStoreLink(baseUrl).then(data => {
        setStoreLinks(data?.[baseUrl] || []);
      });
    });
  };

  const toggleExpand = (index: number) => {
    setExpandedParams(prev => {
      // 如果当前索引已经在展开列表中，则关闭它
      if (prev.includes(index)) {
        return [];
      }
      // 否则，只展开当前索引
      return [index];
    });
    // 获取 storeLink 数据
    getStoreLink(url.baseUrl).then(data => {
      setStoreLinks(data?.[url.baseUrl] || []);
    });
  };

  const noteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNote(e.target.value);
  };

  const handleSaveNote = (data: { key: string; value: string }) => {
    setOpenPopover(null);
    addStoreNoteState({
      note,
      data,
      baseUrl: url.baseUrl,
    }).then(() => {
      // 保存成功后更新 storeLinks
      getStoreLink(url.baseUrl).then(data => {
        setStoreLinks(data?.[url.baseUrl] || []);
      });
    });
    setNote('');
  };

  return (
    <div className="select-none">
      <h1 className="text-2xl font-bold mb-4 flex items-baseline">
        BaseUrl{' '}
        <Copy
          className="w-4 h-4 ml-2 cursor-pointer hover:text-primary active:text-primary/80 transition-colors relative top-0.5"
          onClick={() => handleCopyBaseUrl(url.baseUrl)}
        />
      </h1>{' '}
      <p>{url.baseUrl}</p>
      <div className="mb-4 mt-8">
        {queryParams?.length > 0 && (
          <h1 className="text-2xl font-bold flex items-baseline">
            queryParams{' '}
            <Copy
              className="w-4 h-4 ml-2 cursor-pointer hover:text-primary active:text-primary/80 transition-colors relative top-0.5"
              onClick={() => handleCopyQueryParams(queryParams)}
            />
          </h1>
        )}
      </div>
      <div className="space-y-4 pt-4 pl-4 min-w-[200px] max-w-[500px]">
        {queryParams &&
          queryParams.map((item, index) => {
            const [key, value] = Object.entries(item)[0];
            const isExpanded = expandedParams.includes(index);
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Label className="w-[100px] text-sm font-medium text-muted-foreground flex-shrink-0">
                          <span className="truncate block">{key}</span>
                        </Label>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{key}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Input
                    value={value}
                    onChange={e => {
                      const newParams = [...queryParams];
                      newParams[index] = { [key]: e.target.value };
                      setQueryParams(newParams);
                    }}
                    className="w-[300px] bg-background flex-shrink-0"
                    placeholder={`Enter ${key} value`}
                  />

                  <Popover
                    open={openPopover === index}
                    onOpenChange={open => setOpenPopover(open ? index : null)}
                  >
                    <PopoverTrigger asChild>
                      <Plus className="w-5 h-5 cursor-pointer hover:text-primary active:text-primary/80 transition-colors relative top-0.5" />
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Key</span>
                            <span className="font-medium">{key}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Value</span>
                            <span className="font-medium">{value}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Label className="text-sm font-medium text-muted-foreground">备注</Label>
                          <Input
                            placeholder="添加备注信息"
                            className="flex-1"
                            onChange={noteChange}
                            value={note}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              handleSaveNote({ key, value });
                            }}
                          >
                            确定
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {storeLinks.some(item => item.key === key && item.value === value) &&
                    (isExpanded ? (
                      <ChevronUp
                        className="w-5 h-5 cursor-pointer hover:text-primary active:text-primary/80 transition-colors relative top-0.5"
                        onClick={() => toggleExpand(index)}
                      />
                    ) : (
                      <ChevronDown
                        className="w-5 h-5 cursor-pointer hover:text-primary active:text-primary/80 transition-colors relative top-0.5"
                        onClick={() => toggleExpand(index)}
                      />
                    ))}
                </div>
                <div
                  className={`bg-muted/50 rounded-lg space-y-3 transition-all duration-300 ease-in-out ${
                    isExpanded ? 'ml-[96px] opacity-100 h-auto' : 'opacity-0 h-0 p-0 m-0'
                  }`}
                >
                  {storeLinks && isExpanded && (
                    <div className="p-4">
                      <div className="text-sm font-medium text-muted-foreground mb-2 select-none">
                        备忘记录
                      </div>
                      <div className="space-y-2">
                        <RadioGroup
                          value={value}
                          onValueChange={(newValue: string) => {
                            const newParams = [...queryParams];
                            newParams[index] = { [key]: newValue };
                            console.log(newParams, 'newParams');
                            setQueryParams(newParams);
                          }}
                          className="space-y-2"
                        >
                          {storeLinks
                            .filter(item => item.key === key)
                            .map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-4 p-2 rounded-md hover:bg-muted/80 transition-colors cursor-pointer group select-none"
                                onClick={() => {
                                  const newParams = [...queryParams];
                                  newParams[index] = { [key]: item.value };
                                  setQueryParams(newParams);
                                }}
                              >
                                <RadioGroupItem
                                  value={item.value}
                                  id={`radio-${key}-${idx}`}
                                  className="h-4 w-4"
                                />
                                <div className="flex-1 space-y-1">
                                  <div className="text-sm font-medium select-none">
                                    {item.value}
                                  </div>
                                  {item.note && (
                                    <div className="text-xs text-muted-foreground select-none">
                                      {item.note}
                                    </div>
                                  )}
                                </div>
                                <Trash2
                                  className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                                  onClick={e => {
                                    e.stopPropagation();
                                    deleteStoreNote({
                                      baseUrl: url.baseUrl,
                                      key: item.key,
                                      value: item.value,
                                    }).then(() => {
                                      // 更新本地状态
                                      setStoreLinks(prev =>
                                        prev.filter(
                                          link =>
                                            !(link.key === item.key && link.value === item.value)
                                        )
                                      );
                                    });
                                  }}
                                />
                              </div>
                            ))}
                        </RadioGroup>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>
      <div className="mt-12 flex justify-end">
        <Button onClick={() => replaceLink(queryParams, url)}>Replace Link</Button>
      </div>
    </div>
  );
};

export default ReplaceLink;

