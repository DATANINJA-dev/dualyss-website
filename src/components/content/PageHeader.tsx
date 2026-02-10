'use client';

import { motion } from 'framer-motion';
import { Container } from '@/components/ui/container';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  variant?: 'default' | 'dark' | 'gradient';
}

export function PageHeader({
  title,
  subtitle,
  className,
  variant = 'default'
}: PageHeaderProps) {
  const variants = {
    default: 'bg-neutral-50 text-neutral-900',
    dark: 'bg-primary-500 text-white',
    gradient: 'bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white',
  };

  const subtitleColors = {
    default: 'text-neutral-600',
    dark: 'text-white/80',
    gradient: 'text-white/80',
  };

  return (
    <section className={cn('py-16 md:py-24', variants[variant], className)}>
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <motion.h1
            className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p
              className={cn('mt-4 text-lg sm:text-xl', subtitleColors[variant])}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {subtitle}
            </motion.p>
          )}
        </div>
      </Container>
    </section>
  );
}
