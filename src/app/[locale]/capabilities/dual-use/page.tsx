import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { Layers, ArrowLeftRight, Flame, Mountain, Waves, Building2 } from 'lucide-react';
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
  const t = await getTranslations({ locale, namespace: 'pages.dualUse' });

  return generatePageMetadata({
    title: t('meta.title'),
    description: t('meta.description'),
    locale: locale as Locale,
    path: '/capabilities/dual-use',
  });
}

export default async function DualUsePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.dualUse' });
  const navT = await getTranslations({ locale, namespace: 'nav' });

  const pageSchema = getWebPageSchema({
    title: t('meta.title'),
    description: t('meta.description'),
    locale: locale as Locale,
    path: '/capabilities/dual-use',
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '' },
    { name: navT('capabilities'), url: '/capabilities' },
    { name: t('title'), url: '/capabilities/dual-use' },
  ], locale as Locale);

  const applications = [
    { icon: Flame, title: t('applications.firefighting.title'), description: t('applications.firefighting.description'), civil: true },
    { icon: Mountain, title: t('applications.rescue.title'), description: t('applications.rescue.description'), civil: true },
    { icon: Waves, title: t('applications.maritime.title'), description: t('applications.maritime.description'), civil: true },
    { icon: Building2, title: t('applications.infrastructure.title'), description: t('applications.infrastructure.description'), civil: true },
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
              <ArrowLeftRight className="h-32 w-32 text-primary-200" />
            </div>
          </div>
        </Container>
      </section>

      {/* Dual-Use Concept */}
      <section className="bg-neutral-50 py-16 md:py-24">
        <Container>
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-neutral-900">{t('concept.title')}</h2>
            <p className="mt-4 text-lg text-neutral-600">{t('concept.text')}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-xl border border-primary-200 bg-primary-50 p-8">
              <h3 className="mb-4 text-xl font-semibold text-primary-900">{t('concept.defense.title')}</h3>
              <ul className="space-y-2 text-primary-700">
                <li>{t('concept.defense.item1')}</li>
                <li>{t('concept.defense.item2')}</li>
                <li>{t('concept.defense.item3')}</li>
              </ul>
            </div>
            <div className="rounded-xl border border-accent-200 bg-accent-50 p-8">
              <h3 className="mb-4 text-xl font-semibold text-accent-900">{t('concept.civil.title')}</h3>
              <ul className="space-y-2 text-accent-700">
                <li>{t('concept.civil.item1')}</li>
                <li>{t('concept.civil.item2')}</li>
                <li>{t('concept.civil.item3')}</li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* Civil Applications */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-neutral-900">{t('civilApps.title')}</h2>
            <p className="mt-4 text-lg text-neutral-600">{t('civilApps.subtitle')}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {applications.map((app) => (
              <div
                key={app.title}
                className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 inline-flex rounded-lg bg-accent-50 p-3 text-accent-600">
                  <app.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold text-neutral-900">{app.title}</h3>
                <p className="text-sm text-neutral-600">{app.description}</p>
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
