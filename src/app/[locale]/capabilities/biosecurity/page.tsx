import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { HeartPulse, FlaskConical, Microscope, Activity, Syringe, ShieldCheck } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { PageHeader } from '@/components/content/PageHeader';
import { Breadcrumbs } from '@/components/content/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { generatePageMetadata, getWebPageSchema, getBreadcrumbSchema } from '@/lib/seo/metadata';
import type { Locale } from '@/lib/i18n/config';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.biosecurity' });

  return generatePageMetadata({
    title: t('meta.title'),
    description: t('meta.description'),
    locale: locale as Locale,
    path: '/capabilities/biosecurity',
  });
}

export default async function BiosecurityPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.biosecurity' });
  const navT = await getTranslations({ locale, namespace: 'nav' });

  const pageSchema = getWebPageSchema({
    title: t('meta.title'),
    description: t('meta.description'),
    locale: locale as Locale,
    path: '/capabilities/biosecurity',
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '' },
    { name: navT('capabilities'), url: '/capabilities' },
    { name: t('title'), url: '/capabilities/biosecurity' },
  ], locale as Locale);

  const capabilities = [
    { icon: Microscope, title: t('capabilities.detection.title'), description: t('capabilities.detection.description') },
    { icon: Activity, title: t('capabilities.monitoring.title'), description: t('capabilities.monitoring.description') },
    { icon: FlaskConical, title: t('capabilities.response.title'), description: t('capabilities.response.description') },
    { icon: Syringe, title: t('capabilities.medical.title'), description: t('capabilities.medical.description') },
    { icon: ShieldCheck, title: t('capabilities.protection.title'), description: t('capabilities.protection.description') },
    { icon: HeartPulse, title: t('capabilities.health.title'), description: t('capabilities.health.description') },
  ];

  return (
    <>
      <JsonLd data={pageSchema} />
      <JsonLd data={breadcrumbSchema} />

      <Breadcrumbs
        items={[
          { label: navT('capabilities'), href: '/capabilities' },
          { label: t('title') },
        ]}
      />

      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        variant="gradient"
      />

      {/* Overview */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold text-neutral-900">{t('overview.title')}</h2>
              <p className="mt-4 text-lg text-neutral-600">{t('overview.text1')}</p>
              <p className="mt-4 text-neutral-600">{t('overview.text2')}</p>
            </div>
            <div className="rounded-xl bg-neutral-100 p-8 flex items-center justify-center">
              <HeartPulse className="h-32 w-32 text-primary-200" />
            </div>
          </div>
        </Container>
      </section>

      {/* Capabilities */}
      <section className="bg-neutral-50 py-16 md:py-24">
        <Container>
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-neutral-900">{t('capabilities.title')}</h2>
            <p className="mt-4 text-lg text-neutral-600">{t('capabilities.subtitle')}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((cap) => (
              <div
                key={cap.title}
                className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary-50 p-3 text-primary-500">
                  <cap.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold text-neutral-900">{cap.title}</h3>
                <p className="text-sm text-neutral-600">{cap.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Applications */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-neutral-900">{t('applications.title')}</h2>
            <p className="mt-4 text-lg text-neutral-600">{t('applications.text')}</p>
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
