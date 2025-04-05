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

interface TableProps {
  data: ProxyGroup;
  onRuleStatusChange?: (ruleId: number, enabled: boolean) => void;
}

const ProxyTable: React.FC<TableProps> = ({ data, onRuleStatusChange }) => {
  const handleStatusChange = (ruleId: number, enabled: boolean) => {
    onRuleStatusChange?.(ruleId, enabled);
  };

  return (
    <div className="rounded-md border shadow-sm">
      <ShadcnTable>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[100px]">状态</TableHead>
            <TableHead>请求</TableHead>
            <TableHead>目标</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.rule.map(rule => (
            <TableRow key={rule.id} className="hover:bg-muted/50">
              <TableCell>
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={checked => handleStatusChange(rule.id, checked)}
                  className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted"
                />
              </TableCell>
              <TableCell className="font-mono text-sm">{rule.pattern}</TableCell>
              <TableCell className="font-mono text-sm">{rule.target}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </ShadcnTable>
    </div>
  );
};

export default ProxyTable;
