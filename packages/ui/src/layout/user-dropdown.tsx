'use client';

import * as React from 'react';
import Link from 'next/link';
import { User, Settings, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '../dropdown-menu';
import { Avatar } from '../avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../dialog';
import { Button } from '../button';

export interface UserDropdownProps {
  userName?: string;
  userRole?: string;
  onLogout: () => void;
  profileHref?: string;
  settingsHref?: string;
}

function UserDropdown({
  userName,
  userRole,
  onLogout,
  profileHref = '/profile',
  settingsHref = '/settings',
}: UserDropdownProps) {
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);
  const [loggingOut, setLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 outline-none transition-colors hover:bg-secondary"
          >
            <Avatar name={userName} className="h-8 w-8 shrink-0 text-xs" />
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium leading-tight text-foreground">
                {userName ?? 'Usuario'}
              </p>
              {userRole && (
                <p className="text-xs leading-tight text-muted-foreground">
                  {userRole}
                </p>
              )}
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-foreground">
                {userName ?? 'Usuario'}
              </p>
              {userRole && (
                <p className="text-xs font-normal text-muted-foreground">
                  {userRole}
                </p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link
              href={profileHref}
              className="flex cursor-pointer items-center gap-2"
            >
              <User className="h-4 w-4" />
              Mi perfil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href={settingsHref}
              className="flex cursor-pointer items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Configuración
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setShowLogoutDialog(true);
            }}
            className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Cerrar sesión?</DialogTitle>
            <DialogDescription>
              Estás a punto de salir de Aion. Deberás iniciar sesión nuevamente
              para acceder.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
              disabled={loggingOut}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { UserDropdown };
