'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Shield, Lock, Microscope, Layers } from 'lucide-react';
import { Link } from '@/lib/i18n/navigation';
import { Container } from '@/components/ui/container';
import { cn } from '@/lib/utils';

const capabilities = [
  {
    key: 'defense',
    icon: Shield,
    href: '/capabilities/defense',
    color: 'bg-accent-50 text-accent-600',
  },
  {
    key: 'cybersecurity',
    icon: Lock,
    href: '/capabilities/cybersecurity',
    color: 'bg-accent-100 text-accent-700',
  },
  {
    key: 'biosecurity',
    icon: Microscope,
    href: '/capabilities/biosecurity',
    color: 'bg-accent-50 text-accent-600',
  },
  {
    key: 'dualUse',
    icon: Layers,
    href: '/capabilities/dual-use',
    color: 'bg-accent-100 text-accent-700',
  },
];

export function CapabilitiesSection() {
  const t = useTranslations('capabilities');

  return (
    <section className="py-20 md:py-28">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {t('title')}
          </motion.h2>
          <motion.p
            className="mt-4 text-lg text-neutral-600"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            {t('subtitle')}
          </motion.p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 card-grid">
          {capabilities.map((capability, index) => {
            const Icon = capability.icon;
            return (
              <motion.div
                key={capability.key}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.15 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href={capability.href}
                  className="group rounded-xl border border-neutral-200 bg-white p-6 transition-all duration-300 ease-out hover:border-accent-300 hover:shadow-xl hover:-translate-y-1 card-equal"
                >
                  <div className={cn('inline-flex rounded-lg p-3', capability.color)}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-neutral-900 group-hover:text-accent-500">
                    {t(`${capability.key}.title`)}
                  </h3>
                  <p className="mt-2 text-sm text-neutral-600">
                    {t(`${capability.key}.description`)}
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
