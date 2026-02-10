'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  organization: z.string().optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactFormProps {
  className?: string;
}

export function ContactForm({ className }: ContactFormProps) {
  const t = useTranslations('contact.form');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      // Simulate form submission - in production, this would call an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Form submitted:', data);
      setSubmitStatus('success');
      reset();
    } catch {
      setSubmitStatus('error');
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className={cn('rounded-xl border border-green-200 bg-green-50 p-8 text-center', className)}>
        <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
        <h3 className="mb-2 text-xl font-semibold text-green-900">Message Sent!</h3>
        <p className="text-green-700">Thank you for contacting us. We will get back to you shortly.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => setSubmitStatus('idle')}
        >
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn('space-y-6', className)}
    >
      {submitStatus === 'error' && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>Something went wrong. Please try again.</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-neutral-700">
            {t('name')} *
          </label>
          <input
            {...register('name')}
            type="text"
            id="name"
            className={cn(
              'w-full rounded-lg border px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500',
              errors.name ? 'border-red-300' : 'border-neutral-200'
            )}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-neutral-700">
            {t('email')} *
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            className={cn(
              'w-full rounded-lg border px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500',
              errors.email ? 'border-red-300' : 'border-neutral-200'
            )}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="organization" className="mb-2 block text-sm font-medium text-neutral-700">
          {t('organization')}
        </label>
        <input
          {...register('organization')}
          type="text"
          id="organization"
          className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div>
        <label htmlFor="subject" className="mb-2 block text-sm font-medium text-neutral-700">
          {t('subject')} *
        </label>
        <input
          {...register('subject')}
          type="text"
          id="subject"
          className={cn(
            'w-full rounded-lg border px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500',
            errors.subject ? 'border-red-300' : 'border-neutral-200'
          )}
        />
        {errors.subject && (
          <p className="mt-1 text-sm text-red-500">{errors.subject.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="mb-2 block text-sm font-medium text-neutral-700">
          {t('message')} *
        </label>
        <textarea
          {...register('message')}
          id="message"
          rows={5}
          className={cn(
            'w-full resize-none rounded-lg border px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500',
            errors.message ? 'border-red-300' : 'border-neutral-200'
          )}
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="w-full md:w-auto"
      >
        {isSubmitting ? (
          'Sending...'
        ) : (
          <>
            {t('submit')}
            <Send className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}
