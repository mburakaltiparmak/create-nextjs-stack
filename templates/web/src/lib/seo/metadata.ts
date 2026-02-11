import { Metadata } from 'next';
import { PageSEOConfig } from './seo.types';
import { seoConfig } from './seo.config';

/**
 * Generate Next.js Metadata from SEO Config
 * @param pageConfig - Page-specific SEO configuration
 * @returns Next.js Metadata object
 */
export function generateMetadata(pageConfig: PageSEOConfig): Metadata {
    const { site } = seoConfig;

    const metadata: Metadata = {
        title: pageConfig.title,
        description: pageConfig.description,
        keywords: pageConfig.keywords,

        // Robots
        robots: pageConfig.robots
            ? {
                index: pageConfig.robots.index ?? true,
                follow: pageConfig.robots.follow ?? true,
                googleBot: pageConfig.robots.googleBot,
            }
            : undefined,

        // Open Graph
        openGraph: {
            title: pageConfig.openGraph?.title || pageConfig.title,
            description: pageConfig.openGraph?.description || pageConfig.description,
            siteName: site.siteName,
            locale: site.defaultLocale,
            type: pageConfig.openGraph?.type || 'website',
            url: pageConfig.canonical || site.siteUrl,
            images: pageConfig.openGraph?.images?.map((img) => ({
                url: img,
                width: 1200,
                height: 630,
                alt: site.siteName,
            })) || [
                    {
                        url: site.defaultOGImage,
                        width: 1200,
                        height: 630,
                        alt: site.siteName,
                    },
                ],
        },

        // Twitter
        twitter: {
            card: pageConfig.twitter?.card || 'summary_large_image',
            title: pageConfig.twitter?.title || pageConfig.title,
            description: pageConfig.twitter?.description || pageConfig.description,
            creator: site.twitterHandle,
            images: pageConfig.twitter?.images?.[0] || site.defaultOGImage,
        },

        // Alternates
        alternates: pageConfig.alternates
            ? {
                canonical: pageConfig.canonical,
                languages: pageConfig.alternates.languages,
            }
            : pageConfig.canonical
                ? { canonical: pageConfig.canonical }
                : undefined,

        // Additional Meta Tags
        other: {
            'fb:app_id': site.facebookAppId || '',
        },
    };

    return metadata;
}

/**
 * Generate JSON-LD Structured Data for Organization
 */
export function generateOrganizationSchema() {
    const { site } = seoConfig;

    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: site.siteName,
        url: site.siteUrl,
        logo: `${site.siteUrl}/images/logo.png`,
        description:
            'Eurodeco Panel Systems GmbH - Innovative Panel-Systeme für Architektur der Zukunft',
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Sales',
            availableLanguage: ['German', 'English'],
        },
        sameAs: [
            // Sosyal medya linklerinizi buraya ekleyin
            // 'https://www.linkedin.com/company/eurodeco-panel-systems',
            // 'https://www.instagram.com/eurodeco',
        ],
    };
}
