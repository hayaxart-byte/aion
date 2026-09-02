'use client';

import { useRef } from 'react';
import { Avatar, Button } from '@aion/ui';
import { Upload, X } from 'lucide-react';

interface BioUploaderProps {
  avatarUrl: string | null;
  description: string;
  onAvatarChange: (url: string | null) => void;
  onDescriptionChange: (desc: string) => void;
}

export function BioUploader({ avatarUrl, description, onAvatarChange, onDescriptionChange }: BioUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onAvatarChange(url);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium mb-3">Foto de perfil</p>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar
              name=""
              src={avatarUrl ?? undefined}
              className="h-20 w-20 text-lg"
            />
            {avatarUrl && (
              <button
                onClick={() => onAvatarChange(null)}
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-sm"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4 mr-1" />
            Subir foto
          </Button>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Descripción profesional</p>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Cuéntanos sobre tu experiencia, especialidad y servicios..."
          rows={5}
          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm resize-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
        />
        <p className="text-xs text-muted-foreground mt-1 text-right">{description.length}/500</p>
      </div>
    </div>
  );
}
