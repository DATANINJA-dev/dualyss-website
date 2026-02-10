import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { Calendar, ArrowRight } from 'lucide-react';
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
  const t = await getTranslations({ locale, namespace: 'pages.news' });

  return generatePageMetadata({
    title: t('meta.title'),
    description: t('meta.description'),
    locale: locale as Locale,
    path: '/news',
  });
}

export default async function NewsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.news' });

  const pageSchema = getWebPageSchema({
    title: t('meta.title'),
    description: t('meta.description'),
    locale: locale as Locale,
    path: '/news',
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '' },
    { name: t('title'), url: '/news' },
  ], locale as Locale);

  // Placeholder news items - in production these would come from a CMS
  const newsItems = [
    {
      id: '1',
      title: t('articles.article1.title'),
      excerpt: t('articles.article1.excerpt'),
      date: '2026-01-15',
      category: t('categories.announcement'),
    },
    {
      id: '2',
      title: t('articles.article2.title'),
      excerpt: t('articles.article2.excerpt'),
      date: '2026-01-10',
      category: t('categories.partnership'),
    },
    {
      id: '3',
      title: t('articles.article3.title'),
      excerpt: t('articles.article3.excerpt'),
      date: '2026-01-05',
      category: t('categories.technology'),
    },
    {
      id: '4',
      title: t('articles.article4.title'),
      excerpt: t('articles.article4.excerpt'),
      date: '2025-12-20',
      category: t('categories.event'),
    },
    {
      id: '5',
      title: t('articles.article5.title'),
      excerpt: t('articles.article5.excerpt'),
      date: '2025-12-15',
      category: t('categories.announcement'),
    },
    {
      id: '6',
      title: t('articles.article6.title'),
      excerpt: t('articles.article6.excerpt'),
      date: '2025-12-10',
      category: t('categories.technology'),
    },
  ];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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

      {/* News Grid */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {newsItems.map((item) => (
              <article
                key={item.id}
                className="group rounded-xl border border-neutral-200 bg-white shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
              >
                <div className="aspect-video w-full rounded-t-xl bg-neutral-100 flex items-center justify-center">
                  <span className="text-4xl font-bold text-neutral-200">News</span>
                </div>
                <div className="p-6">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-600">
                      {item.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-neutral-500">
                      <Calendar className="h-3 w-3" />
                      {formatDate(item.date)}
                    </span>
                  </div>
                  <h2 className="mb-2 text-lg font-semibold text-neutral-900 group-hover:text-primary-500">
                    {item.title}
                  </h2>
                  <p className="mb-4 text-sm text-neutral-600 line-clamp-2">
                    {item.excerpt}
                  </p>
                  <span className="inline-flex items-center text-sm font-medium text-primary-500 transition-colors group-hover:text-primary-600">
                    {t('readMore')}
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-neutral-50 py-16">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-neutral-900">{t('newsletter.title')}</h2>
            <p className="mt-2 text-neutral-600">{t('newsletter.text')}</p>
            <form className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <input
                type="email"
                placeholder={t('newsletter.placeholder')}
                className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:max-w-xs"
              />
              <button
                type="submit"
                className="rounded-lg bg-primary-500 px-6 py-3 font-medium text-white transition-colors hover:bg-primary-600"
              >
                {t('newsletter.button')}
              </button>
            </form>
          </div>
        </Container>
      </section>
    </>
  );
}
