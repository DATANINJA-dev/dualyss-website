import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { MapPin, Mail, Phone, Clock } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { PageHeader } from '@/components/content/PageHeader';
import { Breadcrumbs } from '@/components/content/Breadcrumbs';
import { ContactForm } from '@/components/forms/ContactForm';
import { JsonLd } from '@/components/seo/JsonLd';
import { generatePageMetadata, getWebPageSchema, getBreadcrumbSchema } from '@/lib/seo/metadata';
import type { Locale } from '@/lib/i18n/config';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.contact' });

  return generatePageMetadata({
    title: t('meta.title'),
    description: t('meta.description'),
    locale: locale as Locale,
    path: '/contact',
  });
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.contact' });

  const pageSchema = getWebPageSchema({
    title: t('meta.title'),
    description: t('meta.description'),
    locale: locale as Locale,
    path: '/contact',
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '' },
    { name: t('title'), url: '/contact' },
  ], locale as Locale);

  const contactInfo = [
    {
      icon: MapPin,
      title: t('info.address.title'),
      lines: [t('info.address.line1'), t('info.address.line2')],
    },
    {
      icon: Mail,
      title: t('info.email.title'),
      lines: [t('info.email.general'), t('info.email.press')],
    },
    {
      icon: Phone,
      title: t('info.phone.title'),
      lines: [t('info.phone.main')],
    },
    {
      icon: Clock,
      title: t('info.hours.title'),
      lines: [t('info.hours.weekdays'), t('info.hours.weekend')],
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

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-3">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <h2 className="mb-6 text-2xl font-bold text-neutral-900">{t('info.title')}</h2>
              <div className="space-y-6">
                {contactInfo.map((info) => (
                  <div key={info.title} className="flex gap-4">
                    <div className="flex-shrink-0 rounded-lg bg-primary-50 p-3 text-primary-500">
                      <info.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">{info.title}</h3>
                      {info.lines.map((line, index) => (
                        <p key={index} className="text-sm text-neutral-600">{line}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div className="mt-8">
                <h3 className="mb-4 font-semibold text-neutral-900">{t('social.title')}</h3>
                <div className="flex gap-3">
                  <a
                    href="https://linkedin.com/company/dualyss"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-neutral-100 p-3 text-neutral-600 transition-colors hover:bg-primary-50 hover:text-primary-500"
                    aria-label="LinkedIn"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>
                  <a
                    href="https://twitter.com/dualyss"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-neutral-100 p-3 text-neutral-600 transition-colors hover:bg-primary-50 hover:text-primary-500"
                    aria-label="Twitter/X"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
                <h2 className="mb-6 text-2xl font-bold text-neutral-900">{t('form.title')}</h2>
                <ContactForm />
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
