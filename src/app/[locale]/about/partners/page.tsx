import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { Building2, GraduationCap, FlaskConical, Globe } from 'lucide-react';
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
  const t = await getTranslations({ locale, namespace: 'pages.partners' });

  return generatePageMetadata({
    title: t('meta.title'),
    description: t('meta.description'),
    locale: locale as Locale,
    path: '/about/partners',
  });
}

export default async function PartnersPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.partners' });
  const navT = await getTranslations({ locale, namespace: 'nav' });

  const pageSchema = getWebPageSchema({
    title: t('meta.title'),
    description: t('meta.description'),
    locale: locale as Locale,
    path: '/about/partners',
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '' },
    { name: navT('about'), url: '/about' },
    { name: t('title'), url: '/about/partners' },
  ], locale as Locale);

  const partnerCategories = [
    {
      icon: Building2,
      title: t('categories.industry.title'),
      description: t('categories.industry.description'),
      partners: [
        { name: 'Partner 1', type: 'Defense Contractor' },
        { name: 'Partner 2', type: 'Technology Provider' },
        { name: 'Partner 3', type: 'Systems Integrator' },
      ],
    },
    {
      icon: GraduationCap,
      title: t('categories.academic.title'),
      description: t('categories.academic.description'),
      partners: [
        { name: 'University 1', type: 'Research University' },
        { name: 'University 2', type: 'Technical Institute' },
        { name: 'University 3', type: 'Engineering School' },
      ],
    },
    {
      icon: FlaskConical,
      title: t('categories.research.title'),
      description: t('categories.research.description'),
      partners: [
        { name: 'Research Center 1', type: 'Defense Research' },
        { name: 'Research Center 2', type: 'Cybersecurity Lab' },
        { name: 'Research Center 3', type: 'Innovation Hub' },
      ],
    },
    {
      icon: Globe,
      title: t('categories.institutional.title'),
      description: t('categories.institutional.description'),
      partners: [
        { name: 'Institution 1', type: 'EU Agency' },
        { name: 'Institution 2', type: 'National Authority' },
        { name: 'Institution 3', type: 'Regional Government' },
      ],
    },
  ];

  return (
    <>
      <JsonLd data={pageSchema} />
      <JsonLd data={breadcrumbSchema} />

      <Breadcrumbs
        items={[
          { label: navT('about'), href: '/about' },
          { label: t('title') },
        ]}
      />

      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        variant="gradient"
      />

      {/* Ecosystem Overview */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-neutral-900">{t('ecosystem.title')}</h2>
            <p className="mt-4 text-lg text-neutral-600">{t('ecosystem.text')}</p>
          </div>
        </Container>
      </section>

      {/* Partner Categories */}
      {partnerCategories.map((category, categoryIndex) => (
        <section
          key={category.title}
          className={categoryIndex % 2 === 0 ? 'bg-neutral-50 py-16' : 'py-16'}
        >
          <Container>
            <div className="mb-8 flex items-center gap-4">
              <div className="inline-flex rounded-lg bg-primary-50 p-3 text-primary-500">
                <category.icon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">{category.title}</h2>
                <p className="text-neutral-600">{category.description}</p>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {category.partners.map((partner) => (
                <div
                  key={partner.name}
                  className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 h-16 w-full rounded-lg bg-neutral-100 flex items-center justify-center">
                    <span className="text-2xl font-bold text-neutral-300">Logo</span>
                  </div>
                  <h3 className="font-semibold text-neutral-900">{partner.name}</h3>
                  <p className="text-sm text-neutral-500">{partner.type}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      ))}

      {/* Become a Partner CTA */}
      <section className="bg-primary-500 py-16 md:py-24">
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
