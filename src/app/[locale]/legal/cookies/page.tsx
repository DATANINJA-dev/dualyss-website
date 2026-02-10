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
  const t = await getTranslations({ locale, namespace: 'pages.cookies' });

  return generatePageMetadata({
    title: t('meta.title'),
    description: t('meta.description'),
    locale: locale as Locale,
    path: '/legal/cookies',
  });
}

export default async function CookiesPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.cookies' });

  const pageSchema = getWebPageSchema({
    title: t('meta.title'),
    description: t('meta.description'),
    locale: locale as Locale,
    path: '/legal/cookies',
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '' },
    { name: t('title'), url: '/legal/cookies' },
  ], locale as Locale);

  const sections = [
    { id: 'what-are-cookies', title: t('sections.whatAreCookies.title'), content: t('sections.whatAreCookies.content') },
    { id: 'how-we-use', title: t('sections.howWeUse.title'), content: t('sections.howWeUse.content') },
    { id: 'types', title: t('sections.types.title'), content: t('sections.types.content') },
    { id: 'third-party', title: t('sections.thirdParty.title'), content: t('sections.thirdParty.content') },
    { id: 'manage', title: t('sections.manage.title'), content: t('sections.manage.content') },
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
