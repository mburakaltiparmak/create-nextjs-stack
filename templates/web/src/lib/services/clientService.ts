import { getBrowserClient } from '@/lib/supabase/client';
import { TABLE_NAMES, CACHE_TIMES } from '@/lib/supabase/constants';
import { memoryCache } from '@/lib/utils/cache';
import { perMinuteLimiter } from '@/lib/utils/rate-limiter';
import type { Client } from '@/lib/supabase/types';

/**
 * Client Service - Handles all client-related database operations
 * Implements singleton pattern with caching and rate limiting
 */
export class ClientService {
  private static instance: ClientService;

  private constructor() {}

  static getInstance(): ClientService {
    if (!ClientService.instance) {
      ClientService.instance = new ClientService();
    }
    return ClientService.instance;
  }

  /**
   * Get all published clients ordered by sort_order
   */
  async getAll(): Promise<Client[]> {
    const cacheKey = 'clients:all';

    const cached = memoryCache.get<Client[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const allowed = await perMinuteLimiter.checkLimit('clients:getAll');
    if (!allowed) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    const supabase = getBrowserClient();
    const { data, error } = await supabase
      .from(TABLE_NAMES.CLIENTS)
      .select('*')
      .eq('published', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('[ClientService] Error fetching clients:', error);
      throw new Error(`Failed to fetch clients: ${error.message}`);
    }

    memoryCache.set(cacheKey, data, CACHE_TIMES.CLIENTS);
    return data;
  }

  /**
   * Get client by name
   */
  async getByName(name: string): Promise<Client | null> {
    const cacheKey = `clients:name:${name}`;

    const cached = memoryCache.get<Client>(cacheKey);
    if (cached) {
      return cached;
    }

    const supabase = getBrowserClient();
    const { data, error } = await supabase
      .from(TABLE_NAMES.CLIENTS)
      .select('*')
      .eq('name', name)
      .eq('published', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('[ClientService] Error fetching client:', error);
      throw new Error(`Failed to fetch client: ${error.message}`);
    }

    memoryCache.set(cacheKey, data, CACHE_TIMES.CLIENTS);
    return data;
  }

  /**
   * Get client by ID
   */
  async getById(id: string): Promise<Client | null> {
    const cacheKey = `clients:id:${id}`;

    const cached = memoryCache.get<Client>(cacheKey);
    if (cached) {
      return cached;
    }

    const supabase = getBrowserClient();
    const { data, error } = await supabase
      .from(TABLE_NAMES.CLIENTS)
      .select('*')
      .eq('id', id)
      .eq('published', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('[ClientService] Error fetching client by ID:', error);
      throw new Error(`Failed to fetch client: ${error.message}`);
    }

    memoryCache.set(cacheKey, data, CACHE_TIMES.CLIENTS);
    return data;
  }

  /**
   * Invalidate all client caches
   */
  invalidateCache(): void {
    memoryCache.invalidate('clients:');
  }

  /**
   * Invalidate specific client cache
   */
  invalidateClientCache(name: string): void {
    memoryCache.invalidateKey(`clients:name:${name}`);
  }
}

export const clientService = ClientService.getInstance();
