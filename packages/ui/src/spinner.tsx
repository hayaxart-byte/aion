import * as React from 'react';
import { cn } from './utils';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'default' | 'lg';
}

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  default: 'h-8 w-8 border-[3px]',
  lg: 'h-12 w-12 border-[3px]',
};

function Spinner({ className, size = 'default', ...props }: SpinnerProps) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-primary/20 border-t-primary',
        sizeMap[size],
        className
      )}
      {...props}
    />
  );
}

export { Spinner };
