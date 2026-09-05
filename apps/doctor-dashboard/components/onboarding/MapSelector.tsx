'use client';

import dynamic from 'next/dynamic';
import { forwardRef } from 'react';
import type { MapSelectorHandle } from './map-selector-inner';

const MapSelectorInner = dynamic(
  () => import('./map-selector-inner'),
  { ssr: false, loading: () => <div className="h-[400px] w-full rounded-xl bg-muted animate-pulse flex items-center justify-center text-sm text-muted-foreground">Cargando mapa...</div> }
);

const MapSelector = forwardRef<MapSelectorHandle, React.ComponentProps<typeof MapSelectorInner>>(
  function MapSelector(props, ref) {
    return <MapSelectorInner ref={ref} {...props} />;
  }
);

export { MapSelector };
export type { MapSelectorHandle };
