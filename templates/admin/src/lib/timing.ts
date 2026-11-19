// Çerçeveden bağımsız zamanlama yardımcıları; React kancaları (hooks/use-timing) bunları sarar.

type Fn<A extends unknown[]> = (...args: A) => void;

export type Debounced<A extends unknown[]> = Fn<A> & { cancel: () => void; flush: () => void; pending: () => boolean };

/** Son çağrıdan `wait` ms sonra bir kez çalışır; `flush` bekleyen çağrıyı hemen yürütür. */
export function debounce<A extends unknown[]>(fn: Fn<A>, wait: number): Debounced<A> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastArgs: A | undefined;
  const run = () => { timer = undefined; const args = lastArgs!; lastArgs = undefined; fn(...args); };
  const debounced = ((...args: A) => {
    lastArgs = args;
    if (timer) clearTimeout(timer);
    timer = setTimeout(run, wait);
  }) as Debounced<A>;
  debounced.cancel = () => { if (timer) clearTimeout(timer); timer = undefined; lastArgs = undefined; };
  debounced.flush = () => { if (timer) { clearTimeout(timer); run(); } };
  debounced.pending = () => timer !== undefined;
  return debounced;
}

export type Throttled<A extends unknown[]> = Fn<A> & { cancel: () => void };

/**
 * En fazla `interval` ms'de bir çalışır. İlk çağrı hemen yürür; aralık içindeki çağrılardan
 * yalnız sonuncusu aralık bitince yürür (`trailing: false` ise atılır).
 */
export function throttle<A extends unknown[]>(fn: Fn<A>, interval: number, { trailing = true } = {}): Throttled<A> {
  let last = -Infinity;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastArgs: A | undefined;
  const throttled = ((...args: A) => {
    const now = Date.now();
    const remaining = interval - (now - last);
    if (remaining <= 0) {
      if (timer) { clearTimeout(timer); timer = undefined; }
      last = now;
      fn(...args);
    } else if (trailing) {
      lastArgs = args;
      timer ??= setTimeout(() => { last = Date.now(); timer = undefined; const pending = lastArgs!; lastArgs = undefined; fn(...pending); }, remaining);
    }
  }) as Throttled<A>;
  throttled.cancel = () => { if (timer) clearTimeout(timer); timer = undefined; lastArgs = undefined; last = -Infinity; };
  return throttled;
}

/** Kayan pencere sayacı: `limit` olay / `windowMs`. Kalan bekleme süresini (ms) döndürür; 0 ise izin verilir. */
export function slidingWindow(limit: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  return {
    take(key: string, now = Date.now()) {
      const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);
      if (recent.length >= limit) { hits.set(key, recent); return recent[0] + windowMs - now; }
      recent.push(now);
      hits.set(key, recent);
      // Bellek sızmasını önlemek için eski anahtarlar arada bir temizlenir.
      if (hits.size > 1000) for (const [other, times] of hits) if (times.every((time) => now - time >= windowMs)) hits.delete(other);
      return 0;
    },
  };
}
