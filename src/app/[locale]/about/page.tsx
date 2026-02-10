import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { Users, Target, Lightbulb, Handshake, Globe, Award } from 'lucide-react';
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
  const t = await getTranslations({ locale, namespace: 'pages.about' });

  return generatePageMetadata({
    title: t('meta.title'),
    description: t('meta.description'),
    locale: locale as Locale,
    path: '/about',
  });
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.about' });

  const pageSchema = getWebPageSchema({
    title: t('meta.title'),
    description: t('meta.description'),
    locale: locale as Locale,
    path: '/about',
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '' },
    { name: t('title'), url: '/about' },
  ], locale as Locale);

  const values = [
    {
      icon: Target,
      title: t('values.deterrence'),
      description: t('values.deterrenceDesc'),
    },
    {
      icon: Globe,
      title: t('values.autonomy'),
      description: t('values.autonomyDesc'),
    },
    {
      icon: Lightbulb,
      title: t('values.innovation'),
      description: t('values.innovationDesc'),
    },
    {
      icon: Handshake,
      title: t('values.collaboration'),
      description: t('values.collaborationDesc'),
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

      {/* Mission & Vision */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="grid gap-12 md:grid-cols-2">
            <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
              <div className="mb-4 inline-flex rounded-lg bg-primary-50 p-3 text-primary-500">
                <Target className="h-6 w-6" />
              </div>
              <h2 className="mb-4 text-2xl font-bold text-neutral-900">{t('mission.title')}</h2>
              <p className="text-neutral-600">{t('mission.text')}</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
              <div className="mb-4 inline-flex rounded-lg bg-accent-50 p-3 text-accent-600">
                <Lightbulb className="h-6 w-6" />
              </div>
              <h2 className="mb-4 text-2xl font-bold text-neutral-900">{t('vision.title')}</h2>
              <p className="text-neutral-600">{t('vision.text')}</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Values */}
      <section className="bg-neutral-50 py-16 md:py-24">
        <Container>
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-neutral-900">{t('values.title')}</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <div
                key={value.title}
                className="rounded-xl border border-neutral-200 bg-white p-6 text-center shadow-sm"
              >
                <div className="mx-auto mb-4 inline-flex rounded-lg bg-primary-50 p-3 text-primary-500">
                  <value.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-neutral-900">{value.title}</h3>
                <p className="text-sm text-neutral-600">{value.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* European Context */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 inline-flex rounded-lg bg-primary-50 p-4 text-primary-500">
              <Award className="h-8 w-8" />
            </div>
            <h2 className="mb-6 text-3xl font-bold text-neutral-900">{t('european.title')}</h2>
            <p className="text-lg text-neutral-600">{t('european.text')}</p>
          </div>
        </Container>
      </section>

      {/* Quick Links */}
      <section className="bg-primary-500 py-16">
        <Container>
          <div className="grid gap-8 md:grid-cols-2">
            <a
              href={`/${locale}/about/team`}
              className="group rounded-xl bg-white/10 p-8 transition-colors hover:bg-white/20"
            >
              <Users className="mb-4 h-8 w-8 text-white" />
              <h3 className="mb-2 text-xl font-semibold text-white">{t('links.team')}</h3>
              <p className="text-white/80">{t('links.teamDesc')}</p>
            </a>
            <a
              href={`/${locale}/about/partners`}
              className="group rounded-xl bg-white/10 p-8 transition-colors hover:bg-white/20"
            >
              <Handshake className="mb-4 h-8 w-8 text-white" />
              <h3 className="mb-2 text-xl font-semibold text-white">{t('links.partners')}</h3>
              <p className="text-white/80">{t('links.partnersDesc')}</p>
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}
