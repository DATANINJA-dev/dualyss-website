import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { PageHeader } from '@/components/content/PageHeader';
import { Breadcrumbs } from '@/components/content/Breadcrumbs';
import { CapabilityCard } from '@/components/content/CapabilityCard';
import { JsonLd } from '@/components/seo/JsonLd';
import { generatePageMetadata, getWebPageSchema, getBreadcrumbSchema } from '@/lib/seo/metadata';
import type { Locale } from '@/lib/i18n/config';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.capabilities' });

  return generatePageMetadata({
    title: t('meta.title'),
    description: t('meta.description'),
    locale: locale as Locale,
    path: '/capabilities',
  });
}

export default async function CapabilitiesPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.capabilities' });
  const capT = await getTranslations({ locale, namespace: 'capabilities' });

  const pageSchema = getWebPageSchema({
    title: t('meta.title'),
    description: t('meta.description'),
    locale: locale as Locale,
    path: '/capabilities',
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '' },
    { name: t('title'), url: '/capabilities' },
  ], locale as Locale);

  const capabilities = [
    {
      iconName: 'Shield',
      title: capT('defense.title'),
      description: capT('defense.description'),
      href: '/capabilities/defense',
    },
    {
      iconName: 'Lock',
      title: capT('cybersecurity.title'),
      description: capT('cybersecurity.description'),
      href: '/capabilities/cybersecurity',
    },
    {
      iconName: 'HeartPulse',
      title: capT('biosecurity.title'),
      description: capT('biosecurity.description'),
      href: '/capabilities/biosecurity',
    },
    {
      iconName: 'Layers',
      title: capT('dualUse.title'),
      description: capT('dualUse.description'),
      href: '/capabilities/dual-use',
    },
  ];

  return (
    <>
      <JsonLd data={pageSchema} />
      <JsonLd data={breadcrumbSchema} />

      <Breadcrumbs
        items={[{ label: t('title') }]}
      />

      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        variant="gradient"
      />

      {/* Capabilities Grid */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="grid gap-8 md:grid-cols-2">
            {capabilities.map((capability, index) => (
              <CapabilityCard
                key={capability.title}
                {...capability}
                index={index}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* Our Approach */}
      <section className="bg-neutral-50 py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-neutral-900">{t('approach.title')}</h2>
            <p className="mt-4 text-lg text-neutral-600">{t('approach.text')}</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-2xl font-bold text-primary-500">
                1
              </div>
              <h3 className="mb-2 font-semibold text-neutral-900">{t('approach.step1.title')}</h3>
              <p className="text-sm text-neutral-600">{t('approach.step1.text')}</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-2xl font-bold text-primary-500">
                2
              </div>
              <h3 className="mb-2 font-semibold text-neutral-900">{t('approach.step2.title')}</h3>
              <p className="text-sm text-neutral-600">{t('approach.step2.text')}</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-2xl font-bold text-primary-500">
                3
              </div>
              <h3 className="mb-2 font-semibold text-neutral-900">{t('approach.step3.title')}</h3>
              <p className="text-sm text-neutral-600">{t('approach.step3.text')}</p>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="bg-primary-500 py-16">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-white">{t('cta.title')}</h2>
            <p className="mt-4 text-lg text-white/80">{t('cta.text')}</p>
            <a
              href={`/${locale}/contact`}
              className="mt-8 inline-flex items-center justify-center rounded-md bg-white px-8 py-3 text-base font-medium text-primary-500 transition-colors hover:bg-neutral-100"
            >
              {t('cta.button')}
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}
