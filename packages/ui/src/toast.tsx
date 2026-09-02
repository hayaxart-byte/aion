'use client';

import * as React from 'react';
import { cn } from './utils';

type ToastVariant = 'default' | 'success' | 'error' | 'warning';

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, variant?: ToastVariant) => void;
  removeToast: (id: string) => void;
}

let toastId = 0;
let ctx: React.Context<ToastContextType | null> | null = null;

function getCtx(): React.Context<ToastContextType | null> {
  if (!ctx) {
    ctx = React.createContext<ToastContextType | null>(null);
  }
  return ctx;
}

function useToast() {
  const context = React.useContext(getCtx());
  if (!context) throw new Error('useToast must be used within <ToastProvider>');
  return context;
}

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((message: string, variant: ToastVariant = 'default') => {
    const id = String(++toastId);
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const Ctx = getCtx();

  return (
    <Ctx.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-center gap-3 rounded-2xl border border-border/50 px-4 py-3 shadow-lg shadow-black/[0.06] backdrop-blur-xl bg-white/90 transition-all animate-slide-up',
              toast.variant === 'success' && 'border-success/20 bg-success/5 text-success',
              toast.variant === 'error' && 'border-destructive/20 bg-destructive/5 text-destructive',
              toast.variant === 'warning' && 'border-warning/20 bg-warning/5 text-warning',
              toast.variant === 'default' && 'border-border/50 bg-card/90 text-foreground'
            )}
          >
            <p className="text-sm flex-1">{toast.message}</p>
            <button
              className="text-muted-foreground hover:text-foreground shrink-0 rounded-full p-0.5"
              onClick={() => removeToast(toast.id)}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export { ToastProvider, useToast, type ToastVariant };
