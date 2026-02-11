import { RATE_LIMITS } from '@/lib/supabase/constants';

interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

/**
 * Token Bucket Rate Limiter
 * Implements the token bucket algorithm for rate limiting
 */
class RateLimiter {
  private buckets: Map<string, RateLimitEntry> = new Map();
  private maxTokens: number;
  private refillRate: number; // tokens per second

  /**
   * @param maxTokens - Maximum number of tokens in the bucket
   * @param refillRate - Number of tokens added per second
   */
  constructor(maxTokens: number, refillRate: number) {
    this.maxTokens = maxTokens;
    this.refillRate = refillRate;
  }

  /**
   * Check if request is allowed under rate limit
   * @param key - Unique identifier for the rate limit bucket (e.g., user ID, IP, endpoint)
   * @returns true if request is allowed, false if rate limited
   */
  async checkLimit(key: string): Promise<boolean> {
    const now = Date.now();
    let bucket = this.buckets.get(key);

    // Initialize bucket if it doesn't exist
    if (!bucket) {
      bucket = {
        tokens: this.maxTokens - 1,
        lastRefill: now,
      };
      this.buckets.set(key, bucket);
      return true;
    }

    // Refill tokens based on time passed
    const timePassed = (now - bucket.lastRefill) / 1000; // in seconds
    const tokensToAdd = timePassed * this.refillRate;
    bucket.tokens = Math.min(this.maxTokens, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;

    // Check if we have tokens available
    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return true;
    }

    // Rate limit exceeded
    return false;
  }

  /**
   * Get remaining tokens for a key
   * @param key - Rate limit bucket key
   */
  getRemainingTokens(key: string): number {
    const bucket = this.buckets.get(key);
    if (!bucket) {
      return this.maxTokens;
    }

    const now = Date.now();
    const timePassed = (now - bucket.lastRefill) / 1000;
    const tokensToAdd = timePassed * this.refillRate;
    return Math.min(this.maxTokens, bucket.tokens + tokensToAdd);
  }

  /**
   * Reset rate limit for a specific key
   * @param key - Rate limit bucket key
   */
  reset(key: string): void {
    this.buckets.delete(key);
  }

  /**
   * Clear all rate limit buckets
   */
  clearAll(): void {
    this.buckets.clear();
  }
}

// Global rate limiters
export const perMinuteLimiter = new RateLimiter(
  RATE_LIMITS.REQUESTS_PER_MINUTE,
  RATE_LIMITS.REQUESTS_PER_MINUTE / 60 // tokens per second
);

export const perHourLimiter = new RateLimiter(
  RATE_LIMITS.REQUESTS_PER_HOUR,
  RATE_LIMITS.REQUESTS_PER_HOUR / 3600 // tokens per second
);
