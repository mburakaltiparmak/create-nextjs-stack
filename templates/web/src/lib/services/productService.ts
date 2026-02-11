import { getBrowserClient } from '@/lib/supabase/client';
import { TABLE_NAMES, CACHE_TIMES } from '@/lib/supabase/constants';
import { memoryCache } from '@/lib/utils/cache';
import { perMinuteLimiter } from '@/lib/utils/rate-limiter';
import type { Product, ProductWithCategory } from '@/lib/supabase/types';

interface GetProductsOptions {
  limit?: number;
  offset?: number;
  categoryId?: string;
  featured?: boolean;
}

/**
 * Product Service - Handles all product-related database operations
 * Implements singleton pattern with caching and rate limiting
 */
export class ProductService {
  private static instance: ProductService;

  private constructor() {}

  static getInstance(): ProductService {
    if (!ProductService.instance) {
      ProductService.instance = new ProductService();
    }
    return ProductService.instance;
  }

  /**
   * Get all published products with optional filtering
   */
  async getAll(options: GetProductsOptions = {}): Promise<Product[]> {
    const { limit = 100, offset = 0, categoryId, featured } = options;
    const cacheKey = `products:all:${limit}:${offset}:${categoryId || 'none'}:${featured || 'all'}`;

    const cached = memoryCache.get<Product[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const allowed = await perMinuteLimiter.checkLimit('products:getAll');
    if (!allowed) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    const supabase = getBrowserClient();
    let query = supabase
      .from(TABLE_NAMES.PRODUCTS)
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (featured !== undefined) {
      query = query.eq('featured', featured);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[ProductService] Error fetching products:', error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    memoryCache.set(cacheKey, data, CACHE_TIMES.PRODUCTS);
    return data;
  }

  /**
   * Get product by slug with category information
   */
  async getBySlug(slug: string): Promise<ProductWithCategory | null> {
    const cacheKey = `products:slug:${slug}`;

    const cached = memoryCache.get<ProductWithCategory>(cacheKey);
    if (cached) {
      return cached;
    }

    const allowed = await perMinuteLimiter.checkLimit('products:getBySlug');
    if (!allowed) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    const supabase = getBrowserClient();
    const { data, error } = await supabase
      .from(TABLE_NAMES.PRODUCTS)
      .select(`
        *,
        category:categories(*)
      `)
      .eq('slug', slug)
      .eq('published', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('[ProductService] Error fetching product:', error);
      throw new Error(`Failed to fetch product: ${error.message}`);
    }

    const productWithCategory = data as unknown as ProductWithCategory;
    memoryCache.set(cacheKey, productWithCategory, CACHE_TIMES.PRODUCTS);
    return productWithCategory;
  }

  /**
   * Get featured products
   */
  async getFeatured(): Promise<Product[]> {
    return this.getAll({ featured: true });
  }

  /**
   * Get products by category
   */
  async getByCategory(categoryId: string, limit = 100): Promise<Product[]> {
    return this.getAll({ categoryId, limit });
  }

  /**
   * Get related products (same category, excluding current product)
   */
  async getRelated(productId: string, categoryId: string, limit = 4): Promise<Product[]> {
    const cacheKey = `products:related:${productId}:${limit}`;

    const cached = memoryCache.get<Product[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const supabase = getBrowserClient();
    const { data, error } = await supabase
      .from(TABLE_NAMES.PRODUCTS)
      .select('*')
      .eq('category_id', categoryId)
      .eq('published', true)
      .neq('id', productId)
      .limit(limit);

    if (error) {
      console.error('[ProductService] Error fetching related products:', error);
      throw new Error(`Failed to fetch related products: ${error.message}`);
    }

    memoryCache.set(cacheKey, data, CACHE_TIMES.PRODUCTS);
    return data;
  }

  /**
   * Get product by ID
   */
  async getById(id: string): Promise<Product | null> {
    const cacheKey = `products:id:${id}`;

    const cached = memoryCache.get<Product>(cacheKey);
    if (cached) {
      return cached;
    }

    const supabase = getBrowserClient();
    const { data, error } = await supabase
      .from(TABLE_NAMES.PRODUCTS)
      .select('*')
      .eq('id', id)
      .eq('published', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('[ProductService] Error fetching product by ID:', error);
      throw new Error(`Failed to fetch product: ${error.message}`);
    }

    memoryCache.set(cacheKey, data, CACHE_TIMES.PRODUCTS);
    return data;
  }

  /**
   * Get multiple products by IDs
   */
  async getByIds(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) {
      return [];
    }

    const cacheKey = `products:ids:${ids.sort().join(',')}`;

    const cached = memoryCache.get<Product[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const supabase = getBrowserClient();
    const { data, error } = await supabase
      .from(TABLE_NAMES.PRODUCTS)
      .select('*')
      .in('id', ids)
      .eq('published', true);

    if (error) {
      console.error('[ProductService] Error fetching products by IDs:', error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    memoryCache.set(cacheKey, data, CACHE_TIMES.PRODUCTS);
    return data;
  }

  /**
   * Get all product slugs for static generation
   */
  async getAllSlugs(): Promise<string[]> {
    const cacheKey = 'products:slugs:all';

    const cached = memoryCache.get<string[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const supabase = getBrowserClient();
    const { data, error } = await supabase
      .from(TABLE_NAMES.PRODUCTS)
      .select('slug')
      .eq('published', true);

    if (error) {
      console.error('[ProductService] Error fetching product slugs:', error);
      throw new Error(`Failed to fetch product slugs: ${error.message}`);
    }

    const slugs = (data as { slug: string }[]).map((item) => item.slug);
    memoryCache.set(cacheKey, slugs, CACHE_TIMES.PRODUCTS);
    return slugs;
  }

  /**
   * Invalidate all product caches
   */
  invalidateCache(): void {
    memoryCache.invalidate('products:');
  }

  /**
   * Invalidate specific product cache
   */
  invalidateProductCache(slug: string): void {
    memoryCache.invalidateKey(`products:slug:${slug}`);
  }
}

export const productService = ProductService.getInstance();
