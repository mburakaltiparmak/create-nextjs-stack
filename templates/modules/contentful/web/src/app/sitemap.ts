import { MetadataRoute } from 'next';
import { ProjectService } from '@/lib/services/projects.service';
import { ProductService } from '@/lib/services/products.service';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

    // Static pages - CUSTOMIZE THESE ROUTES FOR YOUR PROJECT
    const routes = [
        '',
        '/about',
        '/contact',
    ];

    const entries: MetadataRoute.Sitemap = routes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1.0 : route === '/contact' ? 0.9 : 0.8,
    }));

    // Dynamic Projects - CUSTOMIZE CONTENT TYPE AND SLUG FIELD FOR YOUR PROJECT
    try {
        const projects = await ProjectService.getAll(false);

        projects.forEach(({ slug, updated_at }) => {
            if (!slug) return;
            entries.push({
                url: `${baseUrl}/projects/${slug}`,
                lastModified: updated_at ? new Date(updated_at) : new Date(),
                changeFrequency: 'weekly',
                priority: 0.7,
            });
        });
    } catch (error) {
        console.error('[Sitemap] Error fetching project slugs:', error);
    }

    // Dynamic Products - CUSTOMIZE CONTENT TYPE AND SLUG FIELD FOR YOUR PROJECT
    try {
        const products = await ProductService.getAll(false);

        products.forEach(({ slug, updated_at }) => {
            if (!slug) return;
            entries.push({
                url: `${baseUrl}/products/${slug}`,
                lastModified: updated_at ? new Date(updated_at) : new Date(),
                changeFrequency: 'weekly',
                priority: 0.8,
            });
        });
    } catch (error) {
        console.error('[Sitemap] Error fetching product slugs:', error);
    }

    return entries;
}
