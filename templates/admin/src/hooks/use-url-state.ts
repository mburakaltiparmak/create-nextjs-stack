"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useDebouncedValue } from "@/hooks/use-timing";

// history.replaceState, App Router'da useSearchParams ile senkronlanır ama sunucuya istek atmaz;
// filtreler adrese yazılır (paylaşılabilir, geri tuşunda korunur) ve sayfa verisi yeniden çekilmez.
function writeParam(key: string, value: string, fallback: string) {
  const url = new URL(window.location.href);
  if (!value || value === fallback) url.searchParams.delete(key);
  else url.searchParams.set(key, value);
  if (url.href !== window.location.href) window.history.replaceState(window.history.state, "", url);
}

/** Adres çubuğunda tutulan basit filtre değeri (sekme, tip, durum). */
export function useUrlState(key: string, fallback: string, allowed?: readonly string[]) {
  const params = useSearchParams();
  const read = (raw: string | null) => raw && (!allowed || allowed.includes(raw)) ? raw : fallback;
  const fromUrl = read(params.get(key));
  const [value, setValue] = useState(fromUrl);
  // Adres dışarıdan değişirse (bağlantı, geri tuşu) durum adrese uyar; kendi yazdığımız değer zaten eşittir.
  const [seen, setSeen] = useState(fromUrl);
  if (fromUrl !== seen) { setSeen(fromUrl); setValue(fromUrl); }
  const update = useCallback((next: string) => { setValue(next); writeParam(key, next, fallback); }, [key, fallback]);
  return [value, update] as const;
}

/**
 * Arama kutusu durumu: `query` her tuşta, `debounced` kullanıcı yazmayı bırakınca güncellenir.
 * Filtreleme `debounced` ile yapılır; adres de yalnız o zaman güncellenir.
 */
export function useSearchQuery(key = "q", delay = 250) {
  const params = useSearchParams();
  const fromUrl = params.get(key) ?? "";
  const [query, setQuery] = useState(fromUrl);
  const debounced = useDebouncedValue(query.trim(), delay);
  const [seen, setSeen] = useState(fromUrl);
  if (fromUrl !== seen) { setSeen(fromUrl); if (fromUrl !== debounced) setQuery(fromUrl); }
  useEffect(() => { writeParam(key, debounced, ""); }, [key, debounced]);
  return { query, setQuery, debounced, searching: query.trim() !== debounced };
}
