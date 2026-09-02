'use client';

import dynamic from 'next/dynamic';

const MapSelectorInner = dynamic(
  () => import('./map-selector-inner'),
  { ssr: false, loading: () => <div className="h-[400px] w-full rounded-xl bg-muted animate-pulse flex items-center justify-center text-sm text-muted-foreground">Cargando mapa...</div> }
);

export { MapSelectorInner as MapSelector };
