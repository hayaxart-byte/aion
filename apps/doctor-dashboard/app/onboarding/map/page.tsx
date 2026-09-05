'use client';

import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/lib/onboarding/store';
import { MapSelector } from '@/components/onboarding/MapSelector';
import type { MapSelectorHandle } from '@/components/onboarding/MapSelector';
import { searchLocations, type GeocodingResult } from '@/lib/onboarding/api';
import { Button, Input } from '@aion/ui';
import { ArrowLeft, ArrowRight, MapPin, Search, Loader2, MapIcon } from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';

export default function MapPage() {
  const router = useRouter();
  const { medicalCenter, setMedicalCenter } = useOnboardingStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const mapRef = useRef<MapSelectorHandle>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const markerPosition: [number, number] | null =
    medicalCenter.latitude && medicalCenter.longitude
      ? [medicalCenter.latitude, medicalCenter.longitude]
      : null;

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      setHasSearched(false);
      return;
    }
    setLoading(true);
    setHasSearched(false);
    try {
      const results = await searchLocations(query);
      setSuggestions(results);
      setShowDropdown(true);
      setHasSearched(true);
    } catch {
      setSuggestions([]);
      setShowDropdown(true);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 350);
  }, [fetchSuggestions]);

  const handleSelect = useCallback((result: GeocodingResult) => {
    setSearchQuery(result.displayName);
    setShowDropdown(false);
    setMedicalCenter({ latitude: result.lat, longitude: result.lng });
    mapRef.current?.flyTo(result.lat, result.lng, 15);
  }, [setMedicalCenter]);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setMedicalCenter({ latitude: lat, longitude: lng });
    setShowDropdown(false);
  }, [setMedicalCenter]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl space-y-6 sm:space-y-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Ubicación</h1>
            <p className="text-sm text-muted-foreground">Selecciona la ubicación en el mapa</p>
          </div>
        </div>

        <div ref={containerRef} className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                value={searchQuery}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                placeholder="Buscar ubicación..."
                autoComplete="off"
                className="pr-9"
              />
              {loading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>

          {showDropdown && (
            <div className="absolute z-[100] mt-1 w-full rounded-xl border border-border bg-white shadow-lg">
              {loading && suggestions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Buscando ubicación...
                </div>
              ) : suggestions.length > 0 ? (
                <ul className="max-h-60 overflow-y-auto py-1">
                  {suggestions.map((result, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() => handleSelect(result)}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-secondary transition-colors flex items-start gap-2.5"
                      >
                        <MapIcon className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                        <span className="leading-snug">{formatDisplayName(result.displayName)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : hasSearched ? (
                <div className="px-4 py-3 text-sm text-muted-foreground">
                  No encontramos ubicaciones para &ldquo;{searchQuery}&rdquo;
                </div>
              ) : null}
            </div>
          )}
        </div>

        <MapSelector
          ref={mapRef}
          onLocationSelect={handleMapClick}
          markerPosition={markerPosition}
          defaultPosition={
            medicalCenter.latitude && medicalCenter.longitude
              ? [medicalCenter.latitude, medicalCenter.longitude]
              : undefined
          }
        />

        <div className="flex justify-between pt-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Atrás
          </Button>
          <Button onClick={() => router.push('/onboarding/bio')}>
            Continuar <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function formatDisplayName(name: string): string {
  const parts = name.split(',').map((p) => p.trim());
  if (parts.length <= 1) return name;
  const last = parts[parts.length - 1];
  const isCountry = /^(Nicaragua|Honduras|Guatemala|Costa Rica|El Salvador|Panamá|Estados Unidos|Argentina|México|España|Colombia|Perú|Chile|Brasil)$/i.test(last);
  if (isCountry) {
    return parts.slice(-2).join(', ');
  }
  return parts.slice(0, 3).join(', ');
}
