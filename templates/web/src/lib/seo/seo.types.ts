

/**
 * SEO Configuration for individual pages
 */
export interface PageSEOConfig {
    /** Page title */
    title: string;
    /** Page description */
    description: string;
    /** Page keywords */
    keywords?: string[];
    /** Canonical URL */
    canonical?: string;
    /** Open Graph specific overrides */
    openGraph?: {
        title?: string;
        description?: string;
        images?: string[];
        type?: 'website' | 'article';
    };
    /** Twitter Card specific overrides */
    twitter?: {
        card?: 'summary' | 'summary_large_image' | 'app' | 'player';
        title?: string;
        description?: string;
        images?: string[];
    };
    /** Robots meta tag */
    robots?: {
        index?: boolean;
        follow?: boolean;
        googleBot?: {
            index?: boolean;
            follow?: boolean;
        };
    };
    /** Alternate languages */
    alternates?: {
        languages?: Record<string, string>;
    };
}

/**
 * Site-wide SEO Configuration
 */
export interface SiteSEOConfig {
    /** Site name */
    siteName: string;
    /** Base URL */
    siteUrl: string;
    /** Default locale */
    defaultLocale: string;
    /** Available locales */
    locales: string[];
    /** Default OG image */
    defaultOGImage: string;
    /** Twitter handle */
    twitterHandle?: string;
    /** Facebook App ID */
    facebookAppId?: string;
}

/**
 * Complete SEO Configuration including site config and page configs
 */
export interface SEOConfig {
    site: SiteSEOConfig;
    pages: {
        home: PageSEOConfig;
        about: PageSEOConfig;
        works: PageSEOConfig;
        blog: PageSEOConfig;
        contact: PageSEOConfig;
    };
}
