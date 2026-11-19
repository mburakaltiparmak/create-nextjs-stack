"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { debounce, throttle } from "@/lib/timing";

// Geri çağırma her render'da değişse de zamanlayıcı korunur; en güncel fonksiyon çağrılır.
function useLatest<T>(value: T) {
  const ref = useRef(value);
  useLayoutEffect(() => { ref.current = value; });
  return ref;
}

/** Değer `delay` ms boyunca değişmediğinde güncellenir (ör. arama kutusu). */
export function useDebouncedValue<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function useDebouncedCallback<A extends unknown[]>(fn: (...args: A) => void, delay = 250) {
  const latest = useLatest(fn);
  const debounced = useMemo(() => debounce((...args: A) => latest.current(...args), delay), [delay, latest]);
  useEffect(() => () => debounced.cancel(), [debounced]);
  return debounced;
}

export function useThrottledCallback<A extends unknown[]>(fn: (...args: A) => void, interval = 1000, options?: { trailing?: boolean }) {
  const latest = useLatest(fn);
  const trailing = options?.trailing ?? true;
  const throttled = useMemo(() => throttle((...args: A) => latest.current(...args), interval, { trailing }), [interval, trailing, latest]);
  useEffect(() => () => throttled.cancel(), [throttled]);
  return throttled;
}

/**
 * Yükleniyor göstergesinin titremesini önler: `active` en az `delay` ms sürerse görünür olur,
 * göründükten sonra en az `minDuration` ms kalır.
 */
export function useDelayedFlag(active: boolean, delay = 150, minDuration = 400) {
  const [visible, setVisible] = useState(false);
  const shownAt = useRef(0);
  useEffect(() => {
    if (active) {
      const timer = setTimeout(() => { shownAt.current = Date.now(); setVisible(true); }, delay);
      return () => clearTimeout(timer);
    }
    const remaining = Math.max(0, shownAt.current + minDuration - Date.now());
    const timer = setTimeout(() => setVisible(false), remaining);
    return () => clearTimeout(timer);
  }, [active, delay, minDuration]);
  return visible;
}

/** `active` iken geçen süreyi saniye olarak verir; uzun işlemlerde açıklama göstermek için. */
export function useElapsedSeconds(active: boolean) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!active) return;
    const started = Date.now();
    const timer = setInterval(() => setSeconds(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => { clearInterval(timer); setSeconds(0); };
  }, [active]);
  return active ? seconds : 0;
}
