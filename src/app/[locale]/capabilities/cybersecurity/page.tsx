import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { Lock, Shield, Server, Network, Key, AlertTriangle } from 'lucide-react';
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
  const t = await getTranslations({ locale, namespace: 'pages.cybersecurity' });

  return generatePageMetadata({
    title: t('meta.title'),
    description: t('meta.description'),
    locale: locale as Locale,
    path: '/capabilities/cybersecurity',
  });
}

export default async function CybersecurityPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.cybersecurity' });
  const navT = await getTranslations({ locale, namespace: 'nav' });

  const pageSchema = getWebPageSchema({
    title: t('meta.title'),
    description: t('meta.description'),
    locale: locale as Locale,
    path: '/capabilities/cybersecurity',
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '' },
    { name: navT('capabilities'), url: '/capabilities' },
    { name: t('title'), url: '/capabilities/cybersecurity' },
  ], locale as Locale);

  const services = [
    { icon: Shield, title: t('services.protection.title'), description: t('services.protection.description') },
    { icon: Server, title: t('services.infrastructure.title'), description: t('services.infrastructure.description') },
    { icon: Network, title: t('services.network.title'), description: t('services.network.description') },
    { icon: Key, title: t('services.crypto.title'), description: t('services.crypto.description') },
    { icon: AlertTriangle, title: t('services.threat.title'), description: t('services.threat.description') },
    { icon: Lock, title: t('services.compliance.title'), description: t('services.compliance.description') },
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
              <Lock className="h-32 w-32 text-primary-200" />
            </div>
          </div>
        </Container>
      </section>

      {/* Services */}
      <section className="bg-neutral-50 py-16 md:py-24">
        <Container>
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-neutral-900">{t('services.title')}</h2>
            <p className="mt-4 text-lg text-neutral-600">{t('services.subtitle')}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.title}
                className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary-50 p-3 text-primary-500">
                  <service.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold text-neutral-900">{service.title}</h3>
                <p className="text-sm text-neutral-600">{service.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Standards & Compliance */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-neutral-900">{t('standards.title')}</h2>
            <p className="mt-4 text-lg text-neutral-600">{t('standards.text')}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {['ISO 27001', 'NIS2', 'GDPR', 'ENS', 'NIST'].map((standard) => (
                <span
                  key={standard}
                  className="rounded-full bg-primary-50 px-4 py-2 text-sm font-medium text-primary-600"
                >
                  {standard}
                </span>
              ))}
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
