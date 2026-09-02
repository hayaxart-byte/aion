import * as React from 'react';
import { cn } from './utils';

export interface AvatarProps {
  name?: string;
  src?: string;
  className?: string;
  fallback?: string;
}

function getInitials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function getColorFromName(name?: string): string {
  if (!name) return 'bg-muted text-muted-foreground';
  const colors = [
    'bg-primary/10 text-primary',
    'bg-success/10 text-success',
    'bg-warning/10 text-warning',
    'bg-destructive/10 text-destructive',
    'bg-[#5856D6]/10 text-[#5856D6]',
    'bg-[#FF2D55]/10 text-[#FF2D55]',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps & React.HTMLAttributes<HTMLDivElement>>(
  ({ name, src, className, fallback, ...props }, ref) => {
    if (src) {
      return (
        <div
          ref={ref}
          className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow-sm', className)}
          {...props}
        >
          <img src={src} alt={name ?? ''} className="aspect-square h-full w-full object-cover" />
        </div>
      );
    }
    return (
      <div
        ref={ref}
        className={cn(
          'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full items-center justify-center text-sm font-semibold ring-2 ring-white/80 shadow-sm',
          getColorFromName(name),
          className
        )}
        {...props}
      >
        {fallback ?? getInitials(name)}
      </div>
    );
  }
);
Avatar.displayName = 'Avatar';

export { Avatar };
