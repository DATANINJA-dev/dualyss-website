import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { Building, Landmark, GraduationCap, Factory, Globe, Users } from 'lucide-react';
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
  const t = await getTranslations({ locale, namespace: 'pages.sectors' });

  return generatePageMetadata({
    title: t('meta.title'),
    description: t('meta.description'),
    locale: locale as Locale,
    path: '/sectors',
  });
}

export default async function SectorsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.sectors' });

  const pageSchema = getWebPageSchema({
    title: t('meta.title'),
    description: t('meta.description'),
    locale: locale as Locale,
    path: '/sectors',
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '' },
    { name: t('title'), url: '/sectors' },
  ], locale as Locale);

  const sectors = [
    {
      icon: Landmark,
      title: t('sectors.institutional.title'),
      description: t('sectors.institutional.description'),
      services: [
        t('sectors.institutional.service1'),
        t('sectors.institutional.service2'),
        t('sectors.institutional.service3'),
      ],
    },
    {
      icon: Factory,
      title: t('sectors.industrial.title'),
      description: t('sectors.industrial.description'),
      services: [
        t('sectors.industrial.service1'),
        t('sectors.industrial.service2'),
        t('sectors.industrial.service3'),
      ],
    },
    {
      icon: GraduationCap,
      title: t('sectors.academic.title'),
      description: t('sectors.academic.description'),
      services: [
        t('sectors.academic.service1'),
        t('sectors.academic.service2'),
        t('sectors.academic.service3'),
      ],
    },
    {
      icon: Building,
      title: t('sectors.public.title'),
      description: t('sectors.public.description'),
      services: [
        t('sectors.public.service1'),
        t('sectors.public.service2'),
        t('sectors.public.service3'),
      ],
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

      {/* Sectors Grid */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="space-y-12">
            {sectors.map((sector, index) => (
              <div
                key={sector.title}
                className={`grid gap-8 lg:grid-cols-2 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
              >
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="mb-4 inline-flex rounded-lg bg-primary-50 p-3 text-primary-500">
                    <sector.icon className="h-8 w-8" />
                  </div>
                  <h2 className="mb-4 text-2xl font-bold text-neutral-900">{sector.title}</h2>
                  <p className="mb-6 text-neutral-600">{sector.description}</p>
                  <ul className="space-y-2">
                    {sector.services.map((service) => (
                      <li key={service} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-500" />
                        <span className="text-neutral-600">{service}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`rounded-xl bg-neutral-100 p-8 flex items-center justify-center ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <sector.icon className="h-32 w-32 text-primary-200" />
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* European Focus */}
      <section className="bg-neutral-50 py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Globe className="mx-auto mb-6 h-12 w-12 text-primary-500" />
            <h2 className="text-3xl font-bold text-neutral-900">{t('european.title')}</h2>
            <p className="mt-4 text-lg text-neutral-600">{t('european.text')}</p>
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
