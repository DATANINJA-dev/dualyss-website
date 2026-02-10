import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { PageHeader } from '@/components/content/PageHeader';
import { Breadcrumbs } from '@/components/content/Breadcrumbs';
import { TeamCard } from '@/components/content/TeamCard';
import { JsonLd } from '@/components/seo/JsonLd';
import { generatePageMetadata, getWebPageSchema, getBreadcrumbSchema } from '@/lib/seo/metadata';
import type { Locale } from '@/lib/i18n/config';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.team' });

  return generatePageMetadata({
    title: t('meta.title'),
    description: t('meta.description'),
    locale: locale as Locale,
    path: '/about/team',
  });
}

export default async function TeamPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.team' });
  const navT = await getTranslations({ locale, namespace: 'nav' });

  const pageSchema = getWebPageSchema({
    title: t('meta.title'),
    description: t('meta.description'),
    locale: locale as Locale,
    path: '/about/team',
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '' },
    { name: navT('about'), url: '/about' },
    { name: t('title'), url: '/about/team' },
  ], locale as Locale);

  // Team members - in production these would come from a CMS
  const teamMembers = [
    {
      name: t('members.member1.name'),
      role: t('members.member1.role'),
      description: t('members.member1.description'),
      linkedin: 'https://linkedin.com/in/example1',
    },
    {
      name: t('members.member2.name'),
      role: t('members.member2.role'),
      description: t('members.member2.description'),
      linkedin: 'https://linkedin.com/in/example2',
    },
    {
      name: t('members.member3.name'),
      role: t('members.member3.role'),
      description: t('members.member3.description'),
      linkedin: 'https://linkedin.com/in/example3',
    },
    {
      name: t('members.member4.name'),
      role: t('members.member4.role'),
      description: t('members.member4.description'),
      linkedin: 'https://linkedin.com/in/example4',
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

      {/* Leadership */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-neutral-900">{t('leadership.title')}</h2>
            <p className="mt-4 text-lg text-neutral-600">{t('leadership.subtitle')}</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member, index) => (
              <TeamCard
                key={member.name}
                {...member}
                index={index}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* Join Us CTA */}
      <section className="bg-neutral-50 py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-neutral-900">{t('joinUs.title')}</h2>
            <p className="mt-4 text-lg text-neutral-600">{t('joinUs.text')}</p>
            <a
              href={`/${locale}/contact`}
              className="mt-8 inline-flex items-center justify-center rounded-md bg-primary-500 px-8 py-3 text-base font-medium text-white transition-colors hover:bg-primary-600"
            >
              {t('joinUs.cta')}
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}
