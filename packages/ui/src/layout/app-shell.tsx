'use client';

import * as React from 'react';
import { Menu } from 'lucide-react';
import { Sidebar, type NavItem } from './sidebar';
import { UserDropdown } from './user-dropdown';

export interface AppShellProps {
  children: React.ReactNode;
  navItems: NavItem[];
  title?: string;
  userName?: string;
  userRole?: string;
  onLogout: () => void;
  profileHref?: string;
  settingsHref?: string;
}

function AppShell({
  children,
  navItems,
  title,
  userName,
  userRole,
  onLogout,
  profileHref,
  settingsHref,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar
        navItems={navItems}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 w-full shrink-0 items-center justify-between border-b border-border bg-white px-4 md:px-6">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="md:hidden" />
          <UserDropdown
            userName={userName}
            userRole={userRole}
            onLogout={onLogout}
            profileHref={profileHref}
            settingsHref={settingsHref}
          />
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

export { AppShell };
