import { describe, it, expect } from 'vitest';
import {
  generatePageMetadata,
  getOrganizationSchema,
  getWebSiteSchema,
  getWebPageSchema,
  getBreadcrumbSchema,
} from '@/lib/seo/metadata';

describe('SEO Metadata', () => {
  describe('generatePageMetadata', () => {
    it('generates correct metadata structure', () => {
      const metadata = generatePageMetadata({
        title: 'Test Page',
        description: 'Test description',
        locale: 'en',
        path: '/test',
      });

      expect(metadata.title).toBe('Test Page');
      expect(metadata.description).toBe('Test description');
      expect(metadata.openGraph?.title).toBe('Test Page');
      expect(metadata.twitter?.title).toBe('Test Page');
    });

    it('generates alternates for all locales', () => {
      const metadata = generatePageMetadata({
        title: 'Test',
        description: 'Test',
        locale: 'en',
        path: '/test',
      });

      const languages = metadata.alternates?.languages;
      expect(languages?.en).toContain('/en/test');
      expect(languages?.fr).toContain('/fr/test');
      expect(languages?.es).toContain('/es/test');
      expect(languages?.de).toContain('/de/test');
      expect(languages?.it).toContain('/it/test');
      expect(languages?.ca).toContain('/ca/test');
      expect(languages?.['x-default']).toContain('/en/test');
    });
  });

  describe('getOrganizationSchema', () => {
    it('returns valid Organization schema', () => {
      const schema = getOrganizationSchema();

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Organization');
      expect(schema.name).toBe('Dualyss');
      expect(schema.url).toBeDefined();
      expect(schema.logo).toBeDefined();
    });

    it('includes required organization fields', () => {
      const schema = getOrganizationSchema();

      expect(schema.address).toBeDefined();
      expect(schema.address['@type']).toBe('PostalAddress');
      expect(schema.knowsAbout).toBeInstanceOf(Array);
      expect(schema.knowsAbout.length).toBeGreaterThan(0);
    });
  });

  describe('getWebSiteSchema', () => {
    it('returns valid WebSite schema', () => {
      const schema = getWebSiteSchema('en');

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('WebSite');
      expect(schema.name).toBe('Dualyss');
      expect(schema.inLanguage).toBe('en');
    });

    it('includes search action', () => {
      const schema = getWebSiteSchema('en');

      expect(schema.potentialAction).toBeDefined();
      expect(schema.potentialAction['@type']).toBe('SearchAction');
    });
  });

  describe('getWebPageSchema', () => {
    it('returns valid WebPage schema', () => {
      const schema = getWebPageSchema({
        title: 'Test Page',
        description: 'Test description',
        locale: 'en',
        path: '/test',
      });

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('WebPage');
      expect(schema.name).toBe('Test Page');
      expect(schema.description).toBe('Test description');
      expect(schema.inLanguage).toBe('en');
    });

    it('includes isPartOf reference to WebSite', () => {
      const schema = getWebPageSchema({
        title: 'Test',
        description: 'Test',
        locale: 'en',
        path: '/test',
      });

      expect(schema.isPartOf).toBeDefined();
      expect(schema.isPartOf['@type']).toBe('WebSite');
    });
  });

  describe('getBreadcrumbSchema', () => {
    it('returns valid BreadcrumbList schema', () => {
      const schema = getBreadcrumbSchema([
        { name: 'Home', url: '' },
        { name: 'About', url: '/about' },
      ], 'en');

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('BreadcrumbList');
      expect(schema.itemListElement).toHaveLength(2);
    });

    it('creates correct positions', () => {
      const schema = getBreadcrumbSchema([
        { name: 'Home', url: '' },
        { name: 'About', url: '/about' },
        { name: 'Team', url: '/about/team' },
      ], 'en');

      expect(schema.itemListElement[0].position).toBe(1);
      expect(schema.itemListElement[1].position).toBe(2);
      expect(schema.itemListElement[2].position).toBe(3);
    });
  });
});
