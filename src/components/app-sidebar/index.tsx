import { useLocation, useHistory } from 'react-router-dom';

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
import { routes } from '@/config/routes';

import { ThemeToggle } from '../theme-toggle';

export function AppSidebar() {
  const location = useLocation();
  const history = useHistory();

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
                  >
                    <route.icon className="h-4 w-4" />
                    <span>{route.title}</span>
                  </SidebarMenuButton>
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
