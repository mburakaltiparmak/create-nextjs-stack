import { getBrowserClient } from '@/lib/supabase/client';
import { TABLE_NAMES, CACHE_TIMES } from '@/lib/supabase/constants';
import { memoryCache } from '@/lib/utils/cache';
import { perMinuteLimiter } from '@/lib/utils/rate-limiter';
import type { Project, ProjectWithProducts } from '@/lib/supabase/types';
import { productService } from './productService';

interface GetProjectsOptions {
  limit?: number;
  offset?: number;
  year?: number;
  featured?: boolean;
}

/**
 * Project Service - Handles all project-related database operations
 * Implements singleton pattern with caching and rate limiting
 */
export class ProjectService {
  private static instance: ProjectService;

  private constructor() {}

  static getInstance(): ProjectService {
    if (!ProjectService.instance) {
      ProjectService.instance = new ProjectService();
    }
    return ProjectService.instance;
  }

  /**
   * Get all published projects with optional filtering
   */
  async getAll(options: GetProjectsOptions = {}): Promise<Project[]> {
    const { limit = 100, offset = 0, year, featured } = options;
    const cacheKey = `projects:all:${limit}:${offset}:${year || 'all'}:${featured || 'all'}`;

    const cached = memoryCache.get<Project[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const allowed = await perMinuteLimiter.checkLimit('projects:getAll');
    if (!allowed) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    const supabase = getBrowserClient();
    let query = supabase
      .from(TABLE_NAMES.PROJECTS)
      .select('*')
      .eq('published', true)
      .order('year', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (year !== undefined) {
      query = query.eq('year', year);
    }

    if (featured !== undefined) {
      query = query.eq('featured', featured);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[ProjectService] Error fetching projects:', error);
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }

    memoryCache.set(cacheKey, data, CACHE_TIMES.PROJECTS);
    return data as Project[];
  }

  /**
   * Get project by slug with related products
   */
  async getBySlug(slug: string): Promise<ProjectWithProducts | null> {
    const cacheKey = `projects:slug:${slug}`;

    const cached = memoryCache.get<ProjectWithProducts>(cacheKey);
    if (cached) {
      return cached;
    }

    const allowed = await perMinuteLimiter.checkLimit('projects:getBySlug');
    if (!allowed) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    const supabase = getBrowserClient();
    const { data, error } = await supabase
      .from(TABLE_NAMES.PROJECTS)
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('[ProjectService] Error fetching project:', error);
      throw new Error(`Failed to fetch project: ${error.message}`);
    }

    // Fetch related products
    let products: import('@/lib/supabase/types').Product[] = [];
    const projectData = data as Project;
    if (projectData.product_ids && projectData.product_ids.length > 0) {
      try {
        products = await productService.getByIds(projectData.product_ids);
      } catch (error) {
        console.error('[ProjectService] Error fetching related products:', error);
        // Continue without products rather than failing
      }
    }

    const projectWithProducts: ProjectWithProducts = {
      ...projectData,
      products,
    };

    memoryCache.set(cacheKey, projectWithProducts, CACHE_TIMES.PROJECTS);
    return projectWithProducts;
  }

  /**
   * Get featured projects
   */
  async getFeatured(): Promise<Project[]> {
    return this.getAll({ featured: true });
  }

  /**
   * Get projects by year
   */
  async getByYear(year: number): Promise<Project[]> {
    return this.getAll({ year });
  }

  /**
   * Get project by ID
   */
  async getById(id: string): Promise<Project | null> {
    const cacheKey = `projects:id:${id}`;

    const cached = memoryCache.get<Project>(cacheKey);
    if (cached) {
      return cached;
    }

    const supabase = getBrowserClient();
    const { data, error } = await supabase
      .from(TABLE_NAMES.PROJECTS)
      .select('*')
      .eq('id', id)
      .eq('published', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('[ProjectService] Error fetching project by ID:', error);
      throw new Error(`Failed to fetch project: ${error.message}`);
    }

    memoryCache.set(cacheKey, data, CACHE_TIMES.PROJECTS);
    return data;
  }

  /**
   * Get all project slugs for static generation
   */
  async getAllSlugs(): Promise<string[]> {
    const cacheKey = 'projects:slugs:all';

    const cached = memoryCache.get<string[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const supabase = getBrowserClient();
    const { data, error } = await supabase
      .from(TABLE_NAMES.PROJECTS)
      .select('slug')
      .eq('published', true);

    if (error) {
      console.error('[ProjectService] Error fetching project slugs:', error);
      throw new Error(`Failed to fetch project slugs: ${error.message}`);
    }

    const slugs = (data as { slug: string }[]).map((item) => item.slug);
    memoryCache.set(cacheKey, slugs, CACHE_TIMES.PROJECTS);
    return slugs;
  }

  /**
   * Get unique years from all projects
   */
  async getYears(): Promise<number[]> {
    const cacheKey = 'projects:years';

    const cached = memoryCache.get<number[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const projects = await this.getAll();
    const years = [...new Set(projects.map((p) => p.year))].sort((a, b) => b - a);

    memoryCache.set(cacheKey, years, CACHE_TIMES.PROJECTS);
    return years;
  }

  /**
   * Invalidate all project caches
   */
  invalidateCache(): void {
    memoryCache.invalidate('projects:');
  }

  /**
   * Invalidate specific project cache
   */
  invalidateProjectCache(slug: string): void {
    memoryCache.invalidateKey(`projects:slug:${slug}`);
  }
}

export const projectService = ProjectService.getInstance();
