"use client";

import { useEffect, useRef, useState } from "react";
import { checkSlug } from "@/app/actions";
import { useDebouncedValue } from "@/hooks/use-timing";

export type SlugStatus = "idle" | "checking" | "available" | "taken" | "unknown";
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Slug yazılırken, kullanıcı 400 ms durunca sunucuda müsaitlik kontrolü yapar. Geç dönen eski yanıtlar
 * sıra numarasıyla elenir; kayıtlı haliyle aynı slug kontrol edilmez.
 */
export function useSlugCheck({ siteKey, type, slug, savedSlug, exceptId, enabled }: { siteKey: string; type: string; slug: string; savedSlug?: string; exceptId?: string; enabled: boolean }): SlugStatus {
  const debounced = useDebouncedValue(slug, 400);
  const [result, setResult] = useState<{ key: string; available: boolean | null } | null>(null);
  const sequence = useRef(0);
  const key = `${siteKey}:${type}:${debounced}`;
  const skip = !enabled || !slugPattern.test(debounced) || (savedSlug !== undefined && debounced === savedSlug);

  useEffect(() => {
    if (skip) return;
    const id = ++sequence.current;
    void checkSlug(siteKey, type, debounced, exceptId).then((available) => {
      if (id === sequence.current) setResult({ key, available });
    });
  }, [skip, siteKey, type, debounced, exceptId, key]);

  if (!enabled || !slug || (savedSlug !== undefined && slug === savedSlug)) return "idle";
  if (!slugPattern.test(slug)) return "idle";
  if (slug !== debounced || result?.key !== key) return "checking";
  return result.available === null ? "unknown" : result.available ? "available" : "taken";
}
