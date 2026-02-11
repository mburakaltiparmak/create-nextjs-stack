import { SEOConfig } from './seo.types';

/**
 * Centralized SEO Configuration
 * Tüm sayfa SEO ayarları burada yönetilir
 */
export const seoConfig: SEOConfig = {
    site: {
        siteName: 'Eurodeco Panel Systems GmbH',
        siteUrl: 'https://www.eurodecopanel.de',
        defaultLocale: 'de',
        locales: ['de', 'en'],
        defaultOGImage: '/images/og-default.jpg',
        twitterHandle: '@eurodecopanel', // Placeholder handle
    },

    pages: {
        // Home Page SEO
        home: {
            title: 'Eurodeco Panel Systems GmbH - Innovative Panel-Systeme',
            description:
                'Eurodeco Panel Systems GmbH entwickelt und vertreibt moderne Hochleistungs-Paneelsysteme für anspruchsvolle Architektur, Innenausbau und Gewerbeprojekte.',
            keywords: [
                'Eurodeco',
                'Panel-Systeme',
                'Wandpaneele',
                'Deckenpaneele',
                'Brandschutz',
                'Leichtbau',
                'Architektur',
                'Gewerbeprojekte',
            ],
            openGraph: {
                title: 'Eurodeco Panel Systems GmbH - Innovative Panel-Systeme',
                description:
                    'Entwickelt und vertreibt moderne Hochleistungs-Paneelsysteme für anspruchsvolle Architektur.',
                images: ['/images/og-home.jpg'],
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title: 'Eurodeco Panel Systems GmbH - Innovative Panel-Systeme',
                description:
                    'Entwickelt und vertreibt moderne Hochleistungs-Paneelsysteme für anspruchsvolle Architektur.',
                images: ['/images/twitter-home.jpg'],
            },
            robots: {
                index: true,
                follow: true,
                googleBot: {
                    index: true,
                    follow: true,
                },
            },
        },

        // About Page SEO
        about: {
            title: 'Über Uns - Eurodeco Panel Systems GmbH',
            description:
                'Erfahren Sie mehr über Eurodeco Panel Systems GmbH, unsere Mission, Vision und Technologie für moderne Paneelsysteme.',
            keywords: [
                'Über Eurodeco',
                'Mission',
                'Vision',
                'Technologie',
                'Paneelsysteme',
                'Unternehmensprofil',
            ],
            canonical: 'https://www.eurodecopanel.de/about',
            openGraph: {
                title: 'Über Uns - Eurodeco Panel Systems GmbH',
                description:
                    'Erfahren Sie mehr über Eurodeco Panel Systems GmbH und unsere innovativen Lösungen.',
                images: ['/images/og-about.jpg'],
                type: 'website',
            },
            robots: {
                index: true,
                follow: true,
            },
        },

        // Works/Projects Page SEO
        works: {
            title: 'Referenzen - Eurodeco Panel Systems GmbH',
            description:
                'Entdecken Sie unsere erfolgreichen Projekte und Referenzen in den Bereichen Gewerbe, Büro, Hotel und öffentliche Gebäude.',
            keywords: [
                'Referenzen',
                'Projekte',
                'Eurodeco Projekte',
                'Architektur Referenzen',
                'Bauprojekte',
            ],
            canonical: 'https://www.eurodecopanel.de/references',
            openGraph: {
                title: 'Referenzen - Eurodeco Panel Systems GmbH',
                description:
                    'Entdecken Sie unsere erfolgreichen Projekte und Referenzen.',
                images: ['/images/og-works.jpg'],
                type: 'website',
            },
            robots: {
                index: true,
                follow: true,
            },
        },

        // Blog Page SEO (Keeping structurally but updating content generic/german if needed, or removing if not in list. Task.md didn't ask to remove, just update config. I'll translate to German generic).
        blog: {
            title: 'Aktuelles - Eurodeco Panel Systems GmbH',
            description:
                'Neuigkeiten und Trends zu Paneelsystemen, Architektur und Innovationen von Eurodeco.',
            keywords: [
                'Eurodeco News',
                'Architektur Trends',
                'Paneel Innovationen',
                'Baubranche',
            ],
            canonical: 'https://www.eurodecopanel.de/blog',
            openGraph: {
                title: 'Aktuelles - Eurodeco Panel Systems GmbH',
                description:
                    'Neuigkeiten und Trends zu Paneelsystemen und Architektur.',
                images: ['/images/og-blog.jpg'],
                type: 'website',
            },
            robots: {
                index: true,
                follow: true,
            },
        },

        // Contact Page SEO
        contact: {
            title: 'Kontakt - Eurodeco Panel Systems GmbH',
            description:
                'Kontaktieren Sie Eurodeco Panel Systems GmbH für Ihr nächstes Architektur- oder Bauprojekt. Wir freuen uns auf den Austausch.',
            keywords: [
                'Kontakt Eurodeco',
                'Anfrage',
                'Projekt starten',
                'Eurodeco Adresse',
                'Eurodeco Email',
            ],
            canonical: 'https://www.eurodecopanel.de/contact',
            openGraph: {
                title: 'Kontakt - Eurodeco Panel Systems GmbH',
                description:
                    'Kontaktieren Sie uns für Ihr nächstes Projekt.',
                images: ['/images/og-contact.jpg'],
                type: 'website',
            },
            robots: {
                index: true,
                follow: true,
            },
        },
    },
};
