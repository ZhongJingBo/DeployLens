import React from 'react';
import {
  Table as ShadcnTable,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { ProxyGroup } from '@/model/proxy';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TableProps {
  data: ProxyGroup;
  onRuleStatusChange?: (ruleId: number, enabled: boolean) => void;
}

const ProxyTable: React.FC<TableProps> = ({ data, onRuleStatusChange }) => {
  const handleStatusChange = (ruleId: number, enabled: boolean) => {
    onRuleStatusChange?.(ruleId, enabled);
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[400px] w-full rounded-lg border border-border/40 shadow-md text-[13px]">
        <ShadcnTable>
          <TableHeader>
            <TableRow className="bg-muted/60 hover:bg-muted/60">
              <TableHead className="w-[60px] text-center font-semibold whitespace-nowrap">状态</TableHead>
              <TableHead className="w-[50%] font-semibold whitespace-nowrap">请求</TableHead>
              <TableHead className="w-[50%] font-semibold whitespace-nowrap">目标</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rule.map(rule => (
              <TableRow key={rule.id} className="hover:bg-muted/30 transition-colors duration-200">
                <TableCell className="py-2 px-2">
                  <div className="flex justify-center items-center">
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={checked => handleStatusChange(rule.id, checked)}
                      className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-mono text-muted-foreground py-2 px-2 relative">
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="truncate text-[13px] absolute inset-2">{rule.pattern}</div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[400px] break-all">
                        <p className="font-mono text-[13px]">{rule.pattern}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell className="font-mono text-muted-foreground py-2 px-2 relative">
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="truncate text-[13px] absolute inset-2">{rule.target}</div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[400px] break-all">
                        <p className="font-mono text-[13px]">{rule.target}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </ShadcnTable>
      </div>
    </div>
  );
};

export default ProxyTable;
