'use client';

import * as React from 'react';
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
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar navItems={navItems} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 w-full shrink-0 items-center justify-between border-b border-border bg-white px-6">
          <div></div>
          <UserDropdown
            userName={userName}
            userRole={userRole}
            onLogout={onLogout}
            profileHref={profileHref}
            settingsHref={settingsHref}
          />
        </header>
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}

export { AppShell };
