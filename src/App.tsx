import { BrowserRouter } from 'react-router-dom';

import { SidebarProvider } from '@/components/ui/sidebar';

import { AppSidebar } from './components/app-sidebar';
import { ThemeProvider } from './components/theme-provider';
import { AppRouter } from './router';

import './index.css';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="app-theme">
      <BrowserRouter>
        <SidebarProvider defaultOpen={false} >
          <div className="flex min-h-screen flex-1">
            <AppSidebar />
            <main className="flex-1 h-screen overflow-y-auto pl-8 pt-8 w-full pr-25">
              <AppRouter />
            </main>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
