'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Target, Eye, Sparkles, Users } from 'lucide-react';
import { Container } from '@/components/ui/container';

const values = [
  { key: 'deterrence', icon: Target },
  { key: 'autonomy', icon: Eye },
  { key: 'innovation', icon: Sparkles },
  { key: 'collaboration', icon: Users },
];

export function AboutSection() {
  const t = useTranslations('about');

  return (
    <section className="bg-neutral-50 py-20 md:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Mission & Vision */}
          <div>
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

            <motion.div
              className="mt-10 space-y-8"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div>
                <h3 className="text-xl font-semibold text-neutral-900">
                  {t('mission.title')}
                </h3>
                <p className="mt-2 text-neutral-600">{t('mission.text')}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-neutral-900">
                  {t('vision.title')}
                </h3>
                <p className="mt-2 text-neutral-600">{t('vision.text')}</p>
              </div>
            </motion.div>
          </div>

          {/* Right: Values */}
          <div>
            <motion.h3
              className="text-xl font-semibold text-neutral-900"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {t('values.title')}
            </motion.h3>

            <div className="mt-6 grid gap-6 sm:grid-cols-2 card-grid">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={value.key}
                    className="rounded-lg border border-neutral-200 bg-white p-5 transition-all duration-300 hover:border-accent-200 hover:shadow-md card-equal"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="inline-flex rounded-lg bg-accent-50 p-2 text-accent-500">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h4 className="mt-3 font-semibold text-neutral-900">
                      {t(`values.${value.key}`)}
                    </h4>
                    <p className="mt-1 text-sm text-neutral-600">
                      {t(`values.${value.key}Desc`)}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
