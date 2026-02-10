'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { Container } from '@/components/ui/container';
import { Linkedin, Twitter } from 'lucide-react';

export function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: tNav('about'), href: '/about' },
    { name: tNav('capabilities'), href: '/capabilities' },
    { name: tNav('sectors'), href: '/sectors' },
    { name: tNav('news'), href: '/news' },
    { name: tNav('contact'), href: '/contact' },
  ];

  const legalLinks = [
    { name: t('privacy'), href: '/legal/privacy' },
    { name: t('terms'), href: '/legal/terms' },
    { name: t('cookies'), href: '/legal/cookies' },
  ];

  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      <Container className="py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="text-xl font-bold text-primary-500">
              Dualyss
            </Link>
            <p className="mt-4 max-w-md text-sm text-neutral-600">
              {t('description')}
            </p>
            <div className="mt-6 flex gap-4">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 transition-colors hover:text-primary-500"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 transition-colors hover:text-primary-500"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">{t('quickLinks')}</h3>
            <ul className="mt-4 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-600 transition-colors hover:text-primary-500"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">{t('legal')}</h3>
            <ul className="mt-4 space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-600 transition-colors hover:text-primary-500"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-neutral-200 pt-8">
          <p className="text-center text-sm text-neutral-500">
            {t('copyright', { year: currentYear })}
          </p>
        </div>
      </Container>
    </footer>
  );
}
