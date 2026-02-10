import { describe, it, expect } from 'vitest';
import * as en from '@/messages/en.json';
import * as es from '@/messages/es.json';
import * as ca from '@/messages/ca.json';
import * as fr from '@/messages/fr.json';
import * as de from '@/messages/de.json';
import * as itJson from '@/messages/it.json';
import { locales } from '@/lib/i18n/config';

type TranslationObject = Record<string, unknown>;

const translations: Record<string, TranslationObject> = {
  en: en as unknown as TranslationObject,
  es: es as unknown as TranslationObject,
  ca: ca as unknown as TranslationObject,
  fr: fr as unknown as TranslationObject,
  de: de as unknown as TranslationObject,
  it: itJson as unknown as TranslationObject,
};

/**
 * Recursively get all keys from a nested object
 */
function getAllKeys(obj: TranslationObject, prefix = ''): string[] {
  const keys: string[] = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...getAllKeys(value as TranslationObject, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

/**
 * Get value from nested object by dot-notation key
 */
function getValueByKey(obj: TranslationObject, key: string): unknown {
  const keys = key.split('.');
  let value: unknown = obj;
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as TranslationObject)[k];
    } else {
      return undefined;
    }
  }
  return value;
}

describe('i18n Translations', () => {
  const enKeys = getAllKeys(en);

  describe('Completeness - All keys exist in all languages', () => {
    locales.forEach((locale) => {
      if (locale === 'en') return;

      it(`${locale} has all keys from en.json`, () => {
        const localeKeys = getAllKeys(translations[locale]);
        const missingKeys = enKeys.filter((key) => !localeKeys.includes(key));

        expect(missingKeys, `Missing keys in ${locale}: ${missingKeys.join(', ')}`).toHaveLength(0);
      });

      it(`${locale} has no extra keys not in en.json`, () => {
        const localeKeys = getAllKeys(translations[locale]);
        const extraKeys = localeKeys.filter((key) => !enKeys.includes(key));

        expect(extraKeys, `Extra keys in ${locale}: ${extraKeys.join(', ')}`).toHaveLength(0);
      });
    });
  });

  describe('No duplicates - Content differs from en.json', () => {
    locales.forEach((locale) => {
      if (locale === 'en') return;

      it(`${locale} has translated content (not just English)`, () => {
        const localeTranslation = translations[locale];
        let translatedCount = 0;
        let sameAsEnglishCount = 0;
        const sameAsEnglish: string[] = [];

        // Check key sections that should definitely be translated
        const criticalKeys = [
          'metadata.title',
          'metadata.description',
          'nav.home',
          'nav.about',
          'nav.capabilities',
          'nav.contact',
          'hero.title',
          'hero.subtitle',
          'about.title',
          'footer.description',
        ];

        criticalKeys.forEach((key) => {
          const enValue = getValueByKey(en, key);
          const localeValue = getValueByKey(localeTranslation, key);

          if (typeof enValue === 'string' && typeof localeValue === 'string') {
            if (enValue === localeValue) {
              sameAsEnglishCount++;
              sameAsEnglish.push(key);
            } else {
              translatedCount++;
            }
          }
        });

        // At least 80% of critical keys should be translated
        const translationRate = translatedCount / criticalKeys.length;
        expect(
          translationRate,
          `${locale} has too many untranslated critical keys: ${sameAsEnglish.join(', ')}`
        ).toBeGreaterThanOrEqual(0.8);
      });
    });
  });

  describe('Format - Placeholders are preserved', () => {
    it('All languages preserve {year} placeholder in copyright', () => {
      locales.forEach((locale) => {
        const copyright = getValueByKey(translations[locale], 'footer.copyright');
        expect(
          copyright,
          `${locale}: footer.copyright should contain {year} placeholder`
        ).toContain('{year}');
      });
    });
  });

  describe('SEO - Metadata length validation', () => {
    locales.forEach((locale) => {
      describe(`${locale} metadata`, () => {
        it('title is between 30 and 70 characters', () => {
          const title = getValueByKey(translations[locale], 'metadata.title') as string;
          expect(title.length, `${locale} title is ${title.length} chars: "${title}"`).toBeGreaterThanOrEqual(30);
          expect(title.length, `${locale} title is ${title.length} chars: "${title}"`).toBeLessThanOrEqual(70);
        });

        it('description is between 100 and 200 characters', () => {
          const description = getValueByKey(translations[locale], 'metadata.description') as string;
          expect(description.length, `${locale} description is ${description.length} chars`).toBeGreaterThanOrEqual(100);
          expect(description.length, `${locale} description is ${description.length} chars`).toBeLessThanOrEqual(200);
        });
      });
    });
  });

  describe('Special characters - Language-specific validation', () => {
    it('Spanish contains Spanish special characters', () => {
      const title = getValueByKey(es, 'metadata.title') as string;
      const description = getValueByKey(es, 'metadata.description') as string;
      const content = title + description;

      // Spanish should have accents (á, é, í, ó, ú) or ñ somewhere
      const hasSpanishChars = /[áéíóúñ¿¡]/i.test(content);
      expect(hasSpanishChars, 'Spanish content should contain Spanish accents or characters').toBe(true);
    });

    it('Catalan contains Catalan special characters', () => {
      const title = getValueByKey(ca, 'metadata.title') as string;
      const description = getValueByKey(ca, 'metadata.description') as string;
      const content = title + description;

      // Catalan should have special chars like à, è, é, í, ï, ò, ó, ú, ü, ç, l·l
      const hasCatalanChars = /[àèéíïòóúüç·]/i.test(content);
      expect(hasCatalanChars, 'Catalan content should contain Catalan accents or characters').toBe(true);
    });

    it('French contains French special characters', () => {
      const title = getValueByKey(fr, 'metadata.title') as string;
      const description = getValueByKey(fr, 'metadata.description') as string;
      const content = title + description;

      // French should have accents or special chars
      const hasFrenchChars = /[àâäéèêëîïôùûüç]/i.test(content);
      expect(hasFrenchChars, 'French content should contain French accents or characters').toBe(true);
    });

    it('German contains German special characters', () => {
      const title = getValueByKey(de, 'metadata.title') as string;
      const description = getValueByKey(de, 'metadata.description') as string;
      const content = title + description;

      // German should have umlauts or ß somewhere
      const hasGermanChars = /[äöüßÄÖÜ]/i.test(content);
      expect(hasGermanChars, 'German content should contain German umlauts or ß').toBe(true);
    });

    it('Italian contains Italian special characters', () => {
      const title = getValueByKey(itJson as unknown as TranslationObject, 'metadata.title') as string;
      const description = getValueByKey(itJson as unknown as TranslationObject, 'metadata.description') as string;
      const content = title + description;

      // Italian should have accents
      const hasItalianChars = /[àèéìíîòóùú]/i.test(content);
      expect(hasItalianChars, 'Italian content should contain Italian accents').toBe(true);
    });
  });

  describe('Consistency - Same structure across languages', () => {
    it('All languages have the same number of translation keys', () => {
      const enKeyCount = enKeys.length;

      locales.forEach((locale) => {
        const localeKeyCount = getAllKeys(translations[locale]).length;
        expect(
          localeKeyCount,
          `${locale} has ${localeKeyCount} keys, en has ${enKeyCount}`
        ).toBe(enKeyCount);
      });
    });
  });

  describe('Content integrity - No empty strings', () => {
    locales.forEach((locale) => {
      it(`${locale} has no empty string values`, () => {
        const emptyKeys: string[] = [];

        enKeys.forEach((key) => {
          const value = getValueByKey(translations[locale], key);
          if (typeof value === 'string' && value.trim() === '') {
            emptyKeys.push(key);
          }
        });

        expect(emptyKeys, `${locale} has empty values at: ${emptyKeys.join(', ')}`).toHaveLength(0);
      });
    });
  });
});
