import { MetadataRoute } from 'next';
import { locales } from '@/lib/i18n/config';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://dualyss.eu';

const routes = [
  '',
  '/about',
  '/about/team',
  '/about/partners',
  '/capabilities',
  '/capabilities/defense',
  '/capabilities/cybersecurity',
  '/capabilities/biosecurity',
  '/capabilities/dual-use',
  '/sectors',
  '/news',
  '/contact',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const sitemapEntries: MetadataRoute.Sitemap = [];

  for (const route of routes) {
    for (const locale of locales) {
      const url = `${baseUrl}/${locale}${route}`;

      // Create alternates for all languages
      const alternates: Record<string, string> = {};
      for (const altLocale of locales) {
        alternates[altLocale] = `${baseUrl}/${altLocale}${route}`;
      }
      alternates['x-default'] = `${baseUrl}/en${route}`;

      sitemapEntries.push({
        url,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'weekly' : 'monthly',
        priority: route === '' ? 1 : route.includes('/capabilities') ? 0.9 : 0.8,
        alternates: {
          languages: alternates,
        },
      });
    }
  }

  return sitemapEntries;
}
