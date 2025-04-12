import React, { useState } from 'react';
import {
  Table as ShadcnTable,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { ProxyGroup, ProxyRule } from '@/model/proxy';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { isDev } from '@/utils/env';

interface TableProps {
  data: ProxyGroup;
  onRuleStatusChange?: (data: ProxyGroup) => void;
}

const ProxyTable: React.FC<TableProps> = ({ data, onRuleStatusChange }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);
  const [editingRule, setEditingRule] = useState<ProxyRule | null>(null);
  const [newRule, setNewRule] = useState<Omit<ProxyRule, 'id'>>({
    pattern: '',
    target: '',
    enabled: true,
  });

  /**
   * 修改规则状态
   */
  const handleStatusChange = (ruleId: number, enabled: boolean) => {
    const updatedData = {
      ...data,
      rule: data.rule.map(rule => 
        rule.id === ruleId ? { ...rule, enabled } : rule
      )
    };
    onRuleStatusChange?.(updatedData);
  };

  /**
   * 添加规则
   */
  const handleAddRule = () => {
    if (newRule.pattern && newRule.target) {
      // 生成一个唯一的 ID，使用当前时间戳加上一个随机数
      const newId = Date.now() + Math.floor(Math.random() * 1000);
      const newRuleWithId = {
        ...newRule,
        id: newId,
      };
      const updatedData = {
        ...data,
        rule: [...data.rule, newRuleWithId],
      };
      onRuleStatusChange?.(updatedData);
      setNewRule({ pattern: '', target: '', enabled: true });
      setIsAdding(false);
    }
  };

  /**
   * 编辑规则
   */
  const handleEditRule = (rule: ProxyRule) => {
    if (isDev()) {
      setEditingRuleId(rule.id);
      setEditingRule({ ...rule });
    } else {
      // 在生产环境中，可能需要额外的权限检查或其他逻辑
      setEditingRuleId(rule.id);
      setEditingRule({ ...rule });
    }
  };

  const handleSaveEdit = () => {
    if (editingRule) {
      const updatedData = {
        ...data,
        rule: data.rule.map(r => (r.id === editingRule.id ? editingRule : r)),
      };
      onRuleStatusChange?.(updatedData);
      setEditingRuleId(null);
      setEditingRule(null);
    }
  };

  /**
   * 取消编辑规则
   */
  const handleCancelEdit = () => {
    setEditingRuleId(null);
    setEditingRule(null);
  };

  /**
   * 删除规则
   */
  const handleDeleteRule = (ruleId: number) => {
    if (isDev()) {
      // 开发环境中直接删除
      const updatedData = {
        ...data,
        rule: data.rule.filter(r => r.id !== ruleId),
      };
      onRuleStatusChange?.(updatedData);
    } else {
      // 生产环境中可能需要确认或其他逻辑
      if (window.confirm('确定要删除这条规则吗？')) {
        const updatedData = {
          ...data,
          rule: data.rule.filter(r => r.id !== ruleId),
        };
        onRuleStatusChange?.(updatedData);
      }
    }
  };

  /**
   * 取消添加规则
   */
  const handleCancelAdd = () => {
    setNewRule({ pattern: '', target: '', enabled: true });
    setIsAdding(false);
  };

  return (
    <div className="w-full">
      <div className="min-w-[350px] w-full rounded-lg border border-border/40 shadow-md text-[13px] relative">
        <ShadcnTable>
          <TableHeader>
            <TableRow className="bg-muted/60 hover:bg-muted/60">
              <TableHead className="w-[60px] text-center font-semibold whitespace-nowrap">
                状态
              </TableHead>
              <TableHead className="w-[40%] font-semibold whitespace-nowrap">
                请求
              </TableHead>
              <TableHead className="w-[40%] font-semibold whitespace-nowrap">
                目标
              </TableHead>
              <TableHead className="w-[100px] text-right font-semibold whitespace-nowrap pr-4">
                操作
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="relative">
            {data.rule.map(rule => (
              <TableRow key={rule.id} className="hover:bg-muted/30 transition-colors duration-200">
                <TableCell className="py-2 px-2 relative">
                  <div className="flex justify-center items-center">
                    <Switch
                      checked={editingRuleId === rule.id ? editingRule?.enabled : rule.enabled}
                      onCheckedChange={checked => {
                        if (editingRuleId === rule.id) {
                          setEditingRule(prev => prev ? { ...prev, enabled: checked } : null);
                        } else {
                          handleStatusChange(rule.id, checked);
                        }
                      }}
                      className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted"
                    />
                  </div>
                </TableCell>
                <TableCell className="py-2 px-2 relative">
                  {editingRuleId === rule.id ? (
                    <Input
                      value={editingRule?.pattern || ''}
                      onChange={e => setEditingRule(prev => prev ? { ...prev, pattern: e.target.value } : null)}
                      placeholder="输入请求模式"
                      className="h-8 text-[13px]"
                    />
                  ) : (
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="truncate text-[13px] absolute inset-y-0 left-0 right-0 py-2 px-2 flex items-center">{rule.pattern}</div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-[400px] break-all">
                          <p className="font-mono text-[13px]">{rule.pattern}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </TableCell>
                <TableCell className="py-2 px-2 relative">
                  {editingRuleId === rule.id ? (
                    <Input
                      value={editingRule?.target || ''}
                      onChange={e => setEditingRule(prev => prev ? { ...prev, target: e.target.value } : null)}
                      placeholder="输入目标地址"
                      className="h-8 text-[13px]"
                    />
                  ) : (
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="truncate text-[13px] absolute inset-y-0 left-0 right-0 py-2 px-2 flex items-center">{rule.target}</div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-[400px] break-all">
                          <p className="font-mono text-[13px]">{rule.target}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </TableCell>
                <TableCell className="py-2 px-2">
                  <div className="flex justify-end items-center gap-1 pr-4">
                    {editingRuleId === rule.id ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={handleSaveEdit}
                          disabled={!editingRule?.pattern || !editingRule?.target}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleEditRule(rule)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleDeleteRule(rule.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {isAdding && (
              <TableRow className="hover:bg-muted/30 transition-colors duration-200">
                <TableCell className="py-2 px-2">
                  <div className="flex justify-center items-center">
                    <Switch
                      checked={newRule.enabled}
                      onCheckedChange={checked => setNewRule(prev => ({ ...prev, enabled: checked }))}
                      className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted"
                    />
                  </div>
                </TableCell>
                <TableCell className="py-2 px-2">
                  <Input
                    value={newRule.pattern}
                    onChange={e => setNewRule(prev => ({ ...prev, pattern: e.target.value }))}
                    placeholder="输入请求模式"
                    className="h-8 text-[13px]"
                  />
                </TableCell>
                <TableCell className="py-2 px-2">
                  <Input
                    value={newRule.target}
                    onChange={e => setNewRule(prev => ({ ...prev, target: e.target.value }))}
                    placeholder="输入目标地址"
                    className="h-8 text-[13px]"
                  />
                </TableCell>
                <TableCell className="py-2 px-2">
                  <div className="flex justify-center items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={handleAddRule}
                      disabled={!newRule.pattern || !newRule.target}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={handleCancelAdd}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell colSpan={4} className="py-2 px-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full flex items-center justify-end gap-1 pr-5"
                  onClick={() => setIsAdding(true)}
                  disabled={isAdding || editingRuleId !== null}
                >
                  <Plus className="h-3 w-3" />
                  <span>添加规则</span>
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </ShadcnTable>
      </div>
    </div>
  );
};

export default ProxyTable;
