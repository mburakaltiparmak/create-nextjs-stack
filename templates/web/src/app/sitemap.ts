import { MetadataRoute } from 'next';
import { getAdminClient } from '@/lib/supabase/server';

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

    const supabase = await getAdminClient();

    // Dynamic Projects - CUSTOMIZE TABLE AND SLUG FIELD FOR YOUR PROJECT
    try {
        const { data: projects } = await supabase
            .from('projects')
            .select('slug')
            .eq('published', true);

        projects?.forEach(({ slug }) => {
            entries.push({
                url: `${baseUrl}/projects/${slug}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.7,
            });
        });
    } catch (error) {
        console.error('[Sitemap] Error fetching project slugs:', error);
    }

    // Dynamic Products - CUSTOMIZE TABLE AND SLUG FIELD FOR YOUR PROJECT
    try {
        const { data: products } = await supabase
            .from('products')
            .select('slug')
            .eq('published', true);

        products?.forEach(({ slug }) => {
            entries.push({
                url: `${baseUrl}/products/${slug}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.8,
            });
        });
    } catch (error) {
        console.error('[Sitemap] Error fetching product slugs:', error);
    }

    return entries;
}
