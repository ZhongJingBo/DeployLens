import { useLocation, useHistory } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { routes } from '@/config/routes';
import { eventBus } from '@/lib/event-bus';
import { ThemeToggle } from '../theme-toggle';
import RequestForwardService from '@/pages/Proxy/service/requestForwardService';

export function AppSidebar() {
  const location = useLocation();
  const history = useHistory();
  const [activeRulesCount, setActiveRulesCount] = useState(0);

  const handleRulesUpdated = useCallback((count: number) => {
    setActiveRulesCount(count);
  }, []);

  const handleProxyRulesUpdated = useCallback(async () => {
    const count = await RequestForwardService.getProxyRulesCount();
    setActiveRulesCount(count);
  }, []);

  const onDoubleClick = useCallback(
    async (path: string) => {
      if (path === '/proxy') {
        if (activeRulesCount > 0) {
          await RequestForwardService.closeProxy();
        } else {
          await RequestForwardService.openProxy();
        }
      }
    },
    [activeRulesCount]
  );

  useEffect(() => {
    // 初始化获取规则数量
    handleProxyRulesUpdated();

    // 监听规则更新事件
    eventBus.on('proxy-rules-updated', handleRulesUpdated);

    return () => {
      eventBus.off('proxy-rules-updated', handleRulesUpdated);
    };
  }, [handleProxyRulesUpdated, handleRulesUpdated]);

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {routes.map(route => (
                <SidebarMenuItem key={route.path}>
                  <SidebarMenuButton
                    tooltip={route.title}
                    isActive={location.pathname === route.path}
                    onClick={() => history.push(route.path)}
                    onDoubleClick={() => onDoubleClick(route.path)}
                  >
                    <route.icon className="h-4 w-4" />
                    <span>{route.title}</span>
                  </SidebarMenuButton>
                  {route.path === '/proxy' && activeRulesCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] rounded-full"
                    >
                      {activeRulesCount}
                    </Badge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex justify-center p-2">
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
