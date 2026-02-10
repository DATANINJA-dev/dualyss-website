import type { Metadata } from 'next';
import { locales, type Locale } from '@/lib/i18n/config';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://dualyss.eu';

interface GenerateMetadataProps {
  title: string;
  description: string;
  locale: Locale;
  path?: string;
  image?: string;
}

export function generatePageMetadata({
  title,
  description,
  locale,
  path = '',
  image = '/og-image.png',
}: GenerateMetadataProps): Metadata {
  const url = `${baseUrl}/${locale}${path}`;

  // Generate alternates for all languages
  const languages: Record<string, string> = {};
  for (const loc of locales) {
    languages[loc] = `${baseUrl}/${loc}${path}`;
  }
  languages['x-default'] = `${baseUrl}/en${path}`;

  return {
    title,
    description,
    metadataBase: new URL(baseUrl),
    icons: {
      icon: [
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
    },
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Dualyss',
      locale,
      type: 'website',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// Organization schema for JSON-LD
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Dualyss',
    alternateName: 'Dualyss AIE',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'Protecting democracy with dual deterrence technologies. Enabling capabilities in defense, cybersecurity, and biosecurity for European strategic autonomy.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Barcelona',
      addressRegion: 'Catalonia',
      addressCountry: 'ES',
    },
    sameAs: [
      'https://linkedin.com/company/dualyss',
      'https://twitter.com/dualyss',
    ],
    areaServed: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: 48.8566,
        longitude: 2.3522,
      },
      geoRadius: '2000 km',
      name: 'Europe',
    },
    knowsAbout: [
      'Dual-use technologies',
      'Defense technologies',
      'Cybersecurity',
      'Biosecurity',
      'European strategic autonomy',
      'Unmanned systems',
    ],
  };
}

// WebSite schema for JSON-LD
export function getWebSiteSchema(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Dualyss',
    url: `${baseUrl}/${locale}`,
    inLanguage: locale,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/${locale}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// WebPage schema for JSON-LD
interface WebPageSchemaProps {
  title: string;
  description: string;
  locale: Locale;
  path: string;
}

export function getWebPageSchema({ title, description, locale, path }: WebPageSchemaProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url: `${baseUrl}/${locale}${path}`,
    inLanguage: locale,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Dualyss',
      url: `${baseUrl}/${locale}`,
    },
  };
}

// BreadcrumbList schema for JSON-LD
interface BreadcrumbItem {
  name: string;
  url: string;
}

export function getBreadcrumbSchema(items: BreadcrumbItem[], locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}/${locale}${item.url}`,
    })),
  };
}
