'use client';

import { useAuth } from '@/lib/auth';
import { useOnboardingStore } from '@/lib/onboarding/store';
import { Avatar, Card, Badge } from '@aion/ui';
import { MapPin, Phone, Stethoscope } from 'lucide-react';

export function PreviewSidebar() {
  const { user } = useAuth();
  const { medicalCenter, bio, profileType } = useOnboardingStore();

  return (
    <div className="w-80 shrink-0 hidden lg:block">
      <div className="sticky top-6 space-y-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vista previa</h3>

        <Card className="p-5">
          <div className="flex items-center gap-3 mb-5">
            <Avatar name={user?.name} className="h-14 w-14 text-base" />
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">
                {user?.name || 'Tu nombre'}
              </p>
              {profileType && (
                <Badge variant="secondary" className="mt-1 text-[10px] px-2 py-0.5">
                  {profileType === 'with_agenda' ? 'Con agenda' : 'Sin agenda'}
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="font-medium truncate">{medicalCenter.name || 'Nombre del centro'}</p>
                <p className="text-muted-foreground text-xs truncate">
                  {[medicalCenter.address, medicalCenter.city, medicalCenter.country]
                    .filter(Boolean)
                    .join(', ') || 'Dirección'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
              <p className="text-muted-foreground text-xs">{medicalCenter.phone || 'Teléfono'}</p>
            </div>

            <div className="flex items-start gap-2.5">
              <Stethoscope className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-muted-foreground text-xs line-clamp-2">
                {bio.description || 'Descripción profesional...'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
