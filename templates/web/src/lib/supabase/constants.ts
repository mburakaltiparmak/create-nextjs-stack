export const TABLE_NAMES = {
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
