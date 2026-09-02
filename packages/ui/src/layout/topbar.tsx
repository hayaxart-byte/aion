'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../utils';
import { Button } from '../button';
import { Avatar } from '../avatar';

export interface TopbarNavItem {
  label: string;
  href: string;
}

export interface TopbarProps {
  navItems: TopbarNavItem[];
  title?: string;
  userName?: string;
  userRole?: string;
  onLogout: () => void;
}

function Topbar({ navItems, title, userName, userRole, onLogout }: TopbarProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border/50 shadow-sm shadow-black/[0.02]">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-primary tracking-tight">{title ?? 'Aion'}</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Avatar name={userName} className="h-7 w-7 text-xs" />
            <div className="text-sm leading-tight hidden sm:block">
              <p className="font-medium truncate max-w-[150px]">{userName ?? 'Usuario'}</p>
              {userRole && (
                <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            Salir
          </Button>
        </div>
      </div>
      {navItems.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 flex gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm py-3 px-4 rounded-t-lg transition-all duration-200 ease-out relative',
                  isActive
                    ? 'text-primary font-medium bg-background'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}

export { Topbar };
