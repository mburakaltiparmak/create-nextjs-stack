// Content type ID'leri kasıtlı olarak çoğul ve snake_case alanlarla tanımlıdır:
// Supabase varyantındaki tablo adlarıyla birebir eşleşir, böylece sayfalar ve
// bileşenler iki veri kaynağı arasında değişmeden çalışır.
export const CONTENT_TYPES = {
  CATEGORIES: 'categories',
  PRODUCTS: 'products',
  CLIENTS: 'clients',
  PROJECTS: 'projects',
} as const;

export const CACHE_TIMES = {
  CATEGORIES: 3600,    // 1 hour
  PRODUCTS: 1800,      // 30 minutes
  CLIENTS: 3600,       // 1 hour
  PROJECTS: 1800,      // 30 minutes
} as const;

export const CACHE_TAGS = {
  CATEGORIES: 'categories',
  PRODUCTS: 'products',
  CLIENTS: 'clients',
  PROJECTS: 'projects',
} as const;

export const RATE_LIMITS = {
  REQUESTS_PER_MINUTE: 60,
  REQUESTS_PER_HOUR: 1000,
} as const;

// Contentful tek istekte en fazla 1000 entry döndürür.
export const MAX_ENTRIES_PER_REQUEST = 1000;

// Link'lerin kaç seviye derinliğe kadar çözüleceği (product → category gibi).
export const DEFAULT_INCLUDE_DEPTH = 2;
