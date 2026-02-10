'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/lib/i18n/navigation';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';

export function CTASection() {
  const t = useTranslations('cta');

  return (
    <section className="py-20 md:py-28">
      <Container>
        <motion.div
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 px-6 py-16 text-center sm:px-12 md:py-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Background decoration */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/5" />

          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t('title')}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
              {t('subtitle')}
            </p>
            <div className="mt-8">
              <Button asChild size="xl" variant="accent">
                <Link href="/contact">
                  {t('button')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
