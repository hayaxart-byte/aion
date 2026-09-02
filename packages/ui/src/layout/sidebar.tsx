'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../utils';

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

export interface SidebarProps {
  navItems: NavItem[];
}

function Sidebar({ navItems }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (item: NavItem) =>
    pathname === item.href || pathname.startsWith(item.href + '/');

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-white">
      <nav className="space-y-2 px-4 pt-6" aria-label="Navegación principal">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                active
                  ? 'font-semibold text-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              {item.icon && (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                  {item.icon}
                </span>
              )}
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export { Sidebar };
