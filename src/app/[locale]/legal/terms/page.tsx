import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
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
  const t = await getTranslations({ locale, namespace: 'pages.terms' });

  return generatePageMetadata({
    title: t('meta.title'),
    description: t('meta.description'),
    locale: locale as Locale,
    path: '/legal/terms',
  });
}

export default async function TermsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.terms' });

  const pageSchema = getWebPageSchema({
    title: t('meta.title'),
    description: t('meta.description'),
    locale: locale as Locale,
    path: '/legal/terms',
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '' },
    { name: t('title'), url: '/legal/terms' },
  ], locale as Locale);

  const sections = [
    { id: 'acceptance', title: t('sections.acceptance.title'), content: t('sections.acceptance.content') },
    { id: 'use', title: t('sections.use.title'), content: t('sections.use.content') },
    { id: 'intellectual-property', title: t('sections.intellectualProperty.title'), content: t('sections.intellectualProperty.content') },
    { id: 'user-conduct', title: t('sections.userConduct.title'), content: t('sections.userConduct.content') },
    { id: 'disclaimers', title: t('sections.disclaimers.title'), content: t('sections.disclaimers.content') },
    { id: 'limitation', title: t('sections.limitation.title'), content: t('sections.limitation.content') },
    { id: 'governing-law', title: t('sections.governingLaw.title'), content: t('sections.governingLaw.content') },
    { id: 'changes', title: t('sections.changes.title'), content: t('sections.changes.content') },
    { id: 'contact', title: t('sections.contact.title'), content: t('sections.contact.content') },
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
        subtitle={t('lastUpdated')}
      />

      <section className="py-16">
        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="prose prose-neutral max-w-none">
              {sections.map((section) => (
                <div key={section.id} className="mb-8">
                  <h2 className="text-xl font-semibold text-neutral-900">{section.title}</h2>
                  <p className="mt-4 text-neutral-600 whitespace-pre-line">{section.content}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
