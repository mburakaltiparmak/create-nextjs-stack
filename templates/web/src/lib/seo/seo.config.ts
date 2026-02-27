import { SEOConfig } from './seo.types';

/**
 * Centralized SEO Configuration
 * Tüm sayfa SEO ayarları burada yönetilir
 */
export const seoConfig: SEOConfig = {
    site: {
        siteName: 'Your Company Name',
        siteUrl: 'https://www.yourdomain.com',
        defaultLocale: 'en',
        locales: ['en', 'de'],
        defaultOGImage: '/images/og-default.jpg',
        twitterHandle: '@yourhandle', // Placeholder handle
    },

    pages: {
        // Home Page SEO
        home: {
            title: 'Your Company Name - Catchy Slogan Here',
            description:
                'Your company description goes here. Explain what you do, who you serve, and why you are the best choice for your customers.',
            keywords: [
                'Keyword 1',
                'Keyword 2',
                'Keyword 3',
                'Keyword 4',
                'Keyword 5',
            ],
            openGraph: {
                title: 'Your Company Name - Catchy Slogan Here',
                description:
                    'Your short company description for social media sharing goes here.',
                images: ['/images/og-home.jpg'],
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title: 'Your Company Name - Catchy Slogan Here',
                description:
                    'Your short company description for Twitter sharing goes here.',
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
            title: 'About Us - Your Company Name',
            description:
                'Learn more about Your Company Name, our mission, vision, and the technology behind our products and services.',
            keywords: [
                'About Us',
                'Company Mission',
                'Company Vision',
                'Our Technology',
                'Company Profile',
            ],
            canonical: 'https://www.yourdomain.com/about',
            openGraph: {
                title: 'About Us - Your Company Name',
                description:
                    'Learn more about Your Company Name and our innovative solutions.',
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
            title: 'Our Work - Your Company Name',
            description:
                'Discover our successful projects and references across various industries and domains.',
            keywords: [
                'References',
                'Projects',
                'Our Work',
                'Portfolio',
                'Case Studies',
            ],
            canonical: 'https://www.yourdomain.com/references',
            openGraph: {
                title: 'Our Work - Your Company Name',
                description:
                    'Discover our successful projects and references.',
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
            title: 'Blog - Your Company Name',
            description:
                'News, trends, and insights about our industry and innovations from Your Company Name.',
            keywords: [
                'Company News',
                'Industry Trends',
                'Innovations',
                'Blog',
            ],
            canonical: 'https://www.yourdomain.com/blog',
            openGraph: {
                title: 'Blog - Your Company Name',
                description:
                    'News, trends, and insights about our industry and architecture.',
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
            title: 'Contact - Your Company Name',
            description:
                'Contact Your Company Name for your next project. We look forward to hearing from you.',
            keywords: [
                'Contact Us',
                'Inquiry',
                'Start Project',
                'Company Address',
                'Company Email',
            ],
            canonical: 'https://www.yourdomain.com/contact',
            openGraph: {
                title: 'Contact - Your Company Name',
                description:
                    'Contact us for your next project.',
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
