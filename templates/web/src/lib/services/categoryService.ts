import { getBrowserClient } from '@/lib/supabase/client';
import { TABLE_NAMES, CACHE_TIMES } from '@/lib/supabase/constants';
import { memoryCache } from '@/lib/utils/cache';
import { perMinuteLimiter } from '@/lib/utils/rate-limiter';
import type { Category, CategoryWithChildren } from '@/lib/supabase/types';

/**
 * Category Service - Handles all category-related database operations
 * Implements singleton pattern with caching and rate limiting
 */
export class CategoryService {
  private static instance: CategoryService;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): CategoryService {
    if (!CategoryService.instance) {
      CategoryService.instance = new CategoryService();
    }
    return CategoryService.instance;
  }

  /**
   * Get all published categories
   */
  async getAll(): Promise<Category[]> {
    const cacheKey = 'categories:all';

    // Check memory cache
    const cached = memoryCache.get<Category[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Rate limiting
    const allowed = await perMinuteLimiter.checkLimit('categories:getAll');
    if (!allowed) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    // Fetch from database
    const supabase = getBrowserClient();
    const { data, error } = await supabase
      .from(TABLE_NAMES.CATEGORIES)
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[CategoryService] Error fetching categories:', error);
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    // Cache result
    memoryCache.set(cacheKey, data, CACHE_TIMES.CATEGORIES);

    return data;
  }

  /**
   * Get category by slug
   */
  async getBySlug(slug: string): Promise<Category | null> {
    const cacheKey = `categories:slug:${slug}`;

    const cached = memoryCache.get<Category>(cacheKey);
    if (cached) {
      return cached;
    }

    const allowed = await perMinuteLimiter.checkLimit('categories:getBySlug');
    if (!allowed) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    const supabase = getBrowserClient();
    const { data, error } = await supabase
      .from(TABLE_NAMES.CATEGORIES)
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      console.error('[CategoryService] Error fetching category:', error);
      throw new Error(`Failed to fetch category: ${error.message}`);
    }

    memoryCache.set(cacheKey, data, CACHE_TIMES.CATEGORIES);
    return data;
  }

  /**
   * Get featured categories
   */
  async getFeatured(): Promise<Category[]> {
    const cacheKey = 'categories:featured';

    const cached = memoryCache.get<Category[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const allowed = await perMinuteLimiter.checkLimit('categories:getFeatured');
    if (!allowed) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    const supabase = getBrowserClient();
    const { data, error } = await supabase
      .from(TABLE_NAMES.CATEGORIES)
      .select('*')
      .eq('published', true)
      .eq('featured', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[CategoryService] Error fetching featured categories:', error);
      throw new Error(`Failed to fetch featured categories: ${error.message}`);
    }

    memoryCache.set(cacheKey, data, CACHE_TIMES.CATEGORIES);
    return data;
  }

  /**
   * Get sub-categories of a parent category
   */
  async getSubCategories(parentId: string): Promise<Category[]> {
    const cacheKey = `categories:parent:${parentId}`;

    const cached = memoryCache.get<Category[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const supabase = getBrowserClient();
    const { data, error } = await supabase
      .from(TABLE_NAMES.CATEGORIES)
      .select('*')
      .eq('parent_id', parentId)
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[CategoryService] Error fetching sub-categories:', error);
      throw new Error(`Failed to fetch sub-categories: ${error.message}`);
    }

    memoryCache.set(cacheKey, data, CACHE_TIMES.CATEGORIES);
    return data;
  }

  /**
   * Build hierarchical category tree
   */
  async getTree(): Promise<CategoryWithChildren[]> {
    const cacheKey = 'categories:tree';

    const cached = memoryCache.get<CategoryWithChildren[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Get all categories
    const categories = await this.getAll();

    // Build category map
    const categoryMap = new Map<string, CategoryWithChildren>();
    categories.forEach((cat) => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Build tree structure
    const tree: CategoryWithChildren[] = [];
    categories.forEach((cat) => {
      const category = categoryMap.get(cat.id)!;
      
      if (cat.parent_id) {
        const parent = categoryMap.get(cat.parent_id);
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(category);
        }
      } else {
        // Root level category
        tree.push(category);
      }
    });

    memoryCache.set(cacheKey, tree, CACHE_TIMES.CATEGORIES);
    return tree;
  }

  /**
   * Get category by ID
   */
  async getById(id: string): Promise<Category | null> {
    const cacheKey = `categories:id:${id}`;

    const cached = memoryCache.get<Category>(cacheKey);
    if (cached) {
      return cached;
    }

    const supabase = getBrowserClient();
    const { data, error } = await supabase
      .from(TABLE_NAMES.CATEGORIES)
      .select('*')
      .eq('id', id)
      .eq('published', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('[CategoryService] Error fetching category by ID:', error);
      throw new Error(`Failed to fetch category: ${error.message}`);
    }

    memoryCache.set(cacheKey, data, CACHE_TIMES.CATEGORIES);
    return data;
  }

  /**
   * Invalidate all category caches
   */
  invalidateCache(): void {
    memoryCache.invalidate('categories:');
  }

  /**
   * Invalidate specific category cache
   */
  invalidateCategoryCache(slug: string): void {
    memoryCache.invalidateKey(`categories:slug:${slug}`);
  }
}

// Export singleton instance
export const categoryService = CategoryService.getInstance();
