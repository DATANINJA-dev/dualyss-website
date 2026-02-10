import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { HeroSection } from '@/components/sections/HeroSection';
import { CapabilitiesSection } from '@/components/sections/CapabilitiesSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { CTASection } from '@/components/sections/CTASection';
import { JsonLd } from '@/components/seo/JsonLd';
import { generatePageMetadata, getOrganizationSchema, getWebSiteSchema } from '@/lib/seo/metadata';
import type { Locale } from '@/lib/i18n/config';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return generatePageMetadata({
    title: t('title'),
    description: t('description'),
    locale: locale as Locale,
    path: '',
  });
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const organizationSchema = getOrganizationSchema();
  const websiteSchema = getWebSiteSchema(locale as Locale);

  return (
    <>
      <JsonLd data={organizationSchema} />
      <JsonLd data={websiteSchema} />
      <HeroSection />
      <CapabilitiesSection />
      <AboutSection />
      <CTASection />
    </>
  );
}
