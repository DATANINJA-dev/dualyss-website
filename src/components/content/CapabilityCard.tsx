'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Shield, Lock, HeartPulse, Layers, Target, Globe, Lightbulb, Handshake, type LucideIcon } from 'lucide-react';
import { Link } from '@/lib/i18n/navigation';
import { cn } from '@/lib/utils';

// Map of icon names to components
const iconMap: Record<string, LucideIcon> = {
  Shield,
  Lock,
  HeartPulse,
  Layers,
  Target,
  Globe,
  Lightbulb,
  Handshake,
};

interface CapabilityCardProps {
  title: string;
  description: string;
  href: string;
  iconName: string;
  index?: number;
  className?: string;
}

export function CapabilityCard({
  title,
  description,
  href,
  iconName,
  index = 0,
  className,
}: CapabilityCardProps) {
  const Icon = iconMap[iconName] || Shield;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        'group relative rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:border-primary-200 hover:shadow-md',
        className
      )}
    >
      <div className="mb-4 inline-flex rounded-lg bg-primary-50 p-3 text-primary-500">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-neutral-900">{title}</h3>
      <p className="mb-4 text-neutral-600">{description}</p>
      <Link
        href={href}
        className="inline-flex items-center text-sm font-medium text-primary-500 transition-colors hover:text-primary-600"
      >
        Learn more
        <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </motion.div>
  );
}
