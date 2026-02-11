import { MetadataRoute } from 'next';
import { projectService } from '@/lib/services/projectService';
import { productService } from '@/lib/services/productService';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://www.DOMAIN_PLACEHOLDER.com';

    // Static pages - CUSTOMIZE THESE ROUTES FOR YOUR PROJECT
    const routes = [
        '',
        '/about',
        '/products',
        '/innovation',
        '/services',
        '/investors',
        '/references',
        '/contact',
        '/impressum',
        '/datenschutz',
        '/agb'
    ];

    const sitemap: MetadataRoute.Sitemap = [];

    // Generate entries for each route
    routes.forEach((route) => {
        sitemap.push({
            url: `${baseUrl}${route}`,
            lastModified: new Date(),
            changeFrequency: route === '' ? 'daily' : 'weekly',
            priority: route === '' ? 1.0 : (route === '/contact' ? 0.9 : 0.8),
        });
    });

    // Dynamic Projects
    try {
        const projectSlugs = await projectService.getAllSlugs();
        projectSlugs.forEach((slug) => {
            sitemap.push({
                url: `${baseUrl}/references/${slug}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.7,
            });
        });
    } catch (error) {
        console.error('[Sitemap] Error fetching project slugs:', error);
    }

    // Dynamic Products
    try {
        const productSlugs = await productService.getAllSlugs();
        productSlugs.forEach((slug) => {
            sitemap.push({
                url: `${baseUrl}/products/${slug}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.8,
            });
        });
    } catch (error) {
        console.error('[Sitemap] Error fetching product slugs:', error);
    }

    return sitemap;
}
