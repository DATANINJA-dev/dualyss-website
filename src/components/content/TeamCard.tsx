'use client';

import { motion } from 'framer-motion';
import { Linkedin, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeamCardProps {
  name: string;
  role: string;
  description: string;
  image?: string;
  linkedin?: string;
  email?: string;
  index?: number;
  className?: string;
}

export function TeamCard({
  name,
  role,
  description,
  image,
  linkedin,
  email,
  index = 0,
  className,
}: TeamCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        'group rounded-xl border border-neutral-200 bg-white p-6 text-center shadow-sm transition-all hover:shadow-md',
        className
      )}
    >
      <div className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full bg-neutral-100">
        {image ? (
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary-100 text-2xl font-bold text-primary-500">
            {name.split(' ').map(n => n[0]).join('')}
          </div>
        )}
      </div>
      <h3 className="text-lg font-semibold text-neutral-900">{name}</h3>
      <p className="mb-2 text-sm font-medium text-primary-500">{role}</p>
      <p className="mb-4 text-sm text-neutral-600">{description}</p>
      <div className="flex justify-center gap-3">
        {linkedin && (
          <a
            href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-400 transition-colors hover:text-primary-500"
            aria-label={`${name} on LinkedIn`}
          >
            <Linkedin className="h-5 w-5" />
          </a>
        )}
        {email && (
          <a
            href={`mailto:${email}`}
            className="text-neutral-400 transition-colors hover:text-primary-500"
            aria-label={`Email ${name}`}
          >
            <Mail className="h-5 w-5" />
          </a>
        )}
      </div>
    </motion.div>
  );
}
