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
    color: 'bg-blue-50 text-blue-600',
  },
  {
    key: 'cybersecurity',
    icon: Lock,
    href: '/capabilities/cybersecurity',
    color: 'bg-green-50 text-green-600',
  },
  {
    key: 'biosecurity',
    icon: Microscope,
    href: '/capabilities/biosecurity',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    key: 'dualUse',
    icon: Layers,
    href: '/capabilities/dual-use',
    color: 'bg-amber-50 text-amber-600',
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
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {t('title')}
          </motion.h2>
          <motion.p
            className="mt-4 text-lg text-neutral-600"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {t('subtitle')}
          </motion.p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((capability, index) => {
            const Icon = capability.icon;
            return (
              <motion.div
                key={capability.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  href={capability.href}
                  className="group block rounded-xl border border-neutral-200 bg-white p-6 transition-all hover:border-primary-200 hover:shadow-lg"
                >
                  <div className={cn('inline-flex rounded-lg p-3', capability.color)}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-neutral-900 group-hover:text-primary-500">
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
