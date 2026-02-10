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
  const t = await getTranslations({ locale, namespace: 'pages.privacy' });

  return generatePageMetadata({
    title: t('meta.title'),
    description: t('meta.description'),
    locale: locale as Locale,
    path: '/legal/privacy',
  });
}

export default async function PrivacyPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.privacy' });

  const pageSchema = getWebPageSchema({
    title: t('meta.title'),
    description: t('meta.description'),
    locale: locale as Locale,
    path: '/legal/privacy',
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '' },
    { name: t('title'), url: '/legal/privacy' },
  ], locale as Locale);

  const sections = [
    { id: 'introduction', title: t('sections.introduction.title'), content: t('sections.introduction.content') },
    { id: 'data-collection', title: t('sections.dataCollection.title'), content: t('sections.dataCollection.content') },
    { id: 'data-use', title: t('sections.dataUse.title'), content: t('sections.dataUse.content') },
    { id: 'data-sharing', title: t('sections.dataSharing.title'), content: t('sections.dataSharing.content') },
    { id: 'data-security', title: t('sections.dataSecurity.title'), content: t('sections.dataSecurity.content') },
    { id: 'your-rights', title: t('sections.yourRights.title'), content: t('sections.yourRights.content') },
    { id: 'cookies', title: t('sections.cookies.title'), content: t('sections.cookies.content') },
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
