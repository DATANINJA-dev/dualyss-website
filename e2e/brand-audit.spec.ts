import { test, expect } from '@playwright/test';

/**
 * Brand Visual Audit Tests
 *
 * Captures full-page screenshots for visual brand verification.
 * Use these screenshots to verify:
 * - 40/40/20 color distribution (black/white/blue)
 * - Outfit font rendering on headings
 * - Accent dot placement
 * - Trust signals in footer
 *
 * Run with: npx playwright test e2e/brand-audit.spec.ts
 */

test.describe('Brand Visual Audit', () => {
  test('capture homepage brand audit screenshots', async ({ page }) => {
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    // Full page screenshot
    await page.screenshot({
      path: 'test-screenshots/brand-audit-homepage-full.png',
      fullPage: true,
    });

    // Hero section screenshot
    const hero = page.locator('section').first();
    await hero.screenshot({
      path: 'test-screenshots/brand-audit-hero.png',
    });

    // Verify brand colors are present
    const heroSection = page.locator('section').first();
    await expect(heroSection).toBeVisible();

    // Verify Outfit font is applied to headings
    const h1 = page.locator('h1').first();
    const fontFamily = await h1.evaluate((el) =>
      window.getComputedStyle(el).fontFamily
    );
    expect(fontFamily.toLowerCase()).toContain('outfit');

    // Verify accent button exists
    const accentButton = page.locator('a[href="/en/capabilities"]').first();
    await expect(accentButton).toBeVisible();
  });

  test('capture capabilities section audit', async ({ page }) => {
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    // Scroll to capabilities section and capture
    const capabilitiesHeading = page.getByRole('heading', {
      name: 'Our Capabilities',
    });
    await capabilitiesHeading.scrollIntoViewIfNeeded();

    await page.screenshot({
      path: 'test-screenshots/brand-audit-capabilities.png',
    });

    // Verify card hover states work
    const firstCard = page.locator('a[href="/en/capabilities/defense"]');
    await firstCard.hover();

    await page.screenshot({
      path: 'test-screenshots/brand-audit-card-hover.png',
    });
  });

  test('capture footer with trust signals', async ({ page }) => {
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    // Scroll to footer
    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();

    await footer.screenshot({
      path: 'test-screenshots/brand-audit-footer.png',
    });

    // Verify trust signals are present
    await expect(page.getByText('EU Security Standards')).toBeVisible();
    await expect(page.getByText('ISO 27001')).toBeVisible();
    await expect(page.getByText('NATO Compatible')).toBeVisible();
  });

  test('verify brand colors in CSS', async ({ page }) => {
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    // Get computed styles to verify brand colors
    const brandColors = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      return {
        // Check if accent button has correct blue
        accentButton: (() => {
          const btn = document.querySelector('a[href="/en/capabilities"]');
          if (btn) {
            return getComputedStyle(btn).backgroundColor;
          }
          return null;
        })(),
        // Check hero background
        heroBackground: (() => {
          const hero = document.querySelector('section');
          if (hero) {
            return getComputedStyle(hero).backgroundColor;
          }
          return null;
        })(),
      };
    });

    // Log colors for manual verification
    console.log('Brand Colors Audit:', brandColors);

    // Hero should be black
    expect(brandColors.heroBackground).toBe('rgb(0, 0, 0)');
  });

  test('multi-language brand consistency', async ({ page }) => {
    const languages = ['en', 'es', 'fr', 'de', 'it', 'ca'];

    for (const lang of languages) {
      await page.goto(`/${lang}`);
      await page.waitForLoadState('networkidle');

      await page.screenshot({
        path: `test-screenshots/brand-audit-${lang}.png`,
        fullPage: true,
      });

      // Verify heading font is Outfit for all languages
      const h1 = page.locator('h1').first();
      const fontFamily = await h1.evaluate((el) =>
        window.getComputedStyle(el).fontFamily
      );
      expect(fontFamily.toLowerCase()).toContain('outfit');
    }
  });
});
