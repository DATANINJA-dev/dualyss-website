import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { Shield, Plane, Radio, Target, Eye, Cpu } from 'lucide-react';
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
  const t = await getTranslations({ locale, namespace: 'pages.defense' });

  return generatePageMetadata({
    title: t('meta.title'),
    description: t('meta.description'),
    locale: locale as Locale,
    path: '/capabilities/defense',
  });
}

export default async function DefensePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.defense' });
  const navT = await getTranslations({ locale, namespace: 'nav' });

  const pageSchema = getWebPageSchema({
    title: t('meta.title'),
    description: t('meta.description'),
    locale: locale as Locale,
    path: '/capabilities/defense',
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '' },
    { name: navT('capabilities'), url: '/capabilities' },
    { name: t('title'), url: '/capabilities/defense' },
  ], locale as Locale);

  const technologies = [
    { icon: Plane, title: t('tech.uav.title'), description: t('tech.uav.description') },
    { icon: Radio, title: t('tech.comms.title'), description: t('tech.comms.description') },
    { icon: Target, title: t('tech.sensors.title'), description: t('tech.sensors.description') },
    { icon: Eye, title: t('tech.surveillance.title'), description: t('tech.surveillance.description') },
    { icon: Cpu, title: t('tech.autonomous.title'), description: t('tech.autonomous.description') },
    { icon: Shield, title: t('tech.protection.title'), description: t('tech.protection.description') },
  ];

  const useCases = [
    { title: t('useCases.case1.title'), description: t('useCases.case1.description'), type: t('useCases.defense') },
    { title: t('useCases.case2.title'), description: t('useCases.case2.description'), type: t('useCases.civil') },
    { title: t('useCases.case3.title'), description: t('useCases.case3.description'), type: t('useCases.defense') },
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
              <Shield className="h-32 w-32 text-primary-200" />
            </div>
          </div>
        </Container>
      </section>

      {/* Technologies */}
      <section className="bg-neutral-50 py-16 md:py-24">
        <Container>
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-neutral-900">{t('technologies.title')}</h2>
            <p className="mt-4 text-lg text-neutral-600">{t('technologies.subtitle')}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {technologies.map((tech, index) => (
              <div
                key={tech.title}
                className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary-50 p-3 text-primary-500">
                  <tech.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold text-neutral-900">{tech.title}</h3>
                <p className="text-sm text-neutral-600">{tech.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Use Cases */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-neutral-900">{t('useCases.title')}</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {useCases.map((useCase, index) => (
              <div
                key={useCase.title}
                className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
              >
                <span className={`mb-4 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                  useCase.type === t('useCases.defense')
                    ? 'bg-primary-50 text-primary-600'
                    : 'bg-accent-50 text-accent-600'
                }`}>
                  {useCase.type}
                </span>
                <h3 className="mb-2 font-semibold text-neutral-900">{useCase.title}</h3>
                <p className="text-sm text-neutral-600">{useCase.description}</p>
              </div>
            ))}
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
