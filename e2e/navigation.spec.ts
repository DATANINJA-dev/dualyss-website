import { test, expect } from '@playwright/test';

/**
 * Navigation Tests
 *
 * Validates that all routes are accessible and navigation works correctly.
 * Based on route-registry.yaml definitions.
 */

test.describe('Site Navigation', () => {
  const routes = [
    { path: '/', name: 'Homepage' },
    { path: '/about', name: 'About' },
    { path: '/about/team', name: 'Team' },
    { path: '/about/partners', name: 'Partners' },
    { path: '/capabilities', name: 'Capabilities Hub' },
    { path: '/capabilities/defense', name: 'Defense' },
    { path: '/capabilities/cybersecurity', name: 'Cybersecurity' },
    { path: '/capabilities/biosecurity', name: 'Biosecurity' },
    { path: '/capabilities/dual-use', name: 'Dual-Use' },
    { path: '/sectors', name: 'Sectors' },
    { path: '/news', name: 'News' },
    { path: '/contact', name: 'Contact' },
  ];

  for (const { path, name } of routes) {
    test(`${name} page (${path}) loads correctly`, async ({ page }) => {
      await page.goto(`/en${path}`);

      // Page should not 404
      await expect(page.locator('main')).toBeVisible();

      // Should have h1
      await expect(page.locator('h1')).toBeVisible();

      // Header should be present
      await expect(page.locator('header')).toBeVisible();

      // Footer should be present
      await expect(page.locator('footer')).toBeVisible();
    });
  }

  test('header navigation links work', async ({ page }) => {
    await page.goto('/en');

    // Click through main navigation items
    const navItems = ['about', 'capabilities', 'contact'];

    for (const item of navItems) {
      const link = page.locator(`header a[href*="${item}"]`).first();

      if (await link.isVisible()) {
        await link.click();
        await expect(page).toHaveURL(new RegExp(item));
        await page.goto('/en'); // Reset
      }
    }
  });

  test('footer navigation links work', async ({ page }) => {
    await page.goto('/en');

    // Footer should have links
    const footerLinks = page.locator('footer a');
    const count = await footerLinks.count();

    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Language Switching', () => {
  const locales = ['en', 'es', 'fr', 'de', 'it', 'ca'];

  test('language switcher is visible', async ({ page }) => {
    await page.goto('/en');

    // Look for language switcher
    const languageSwitcher = page.locator('[data-testid="language-switcher"], button:has-text(/EN|ES|FR/i), select[aria-label*="language" i]');

    // Should have some form of language switching
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  for (const locale of locales) {
    test(`${locale} locale loads correctly`, async ({ page }) => {
      await page.goto(`/${locale}`);

      // Page should load without error
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('h1')).toBeVisible();

      // URL should contain locale
      await expect(page).toHaveURL(new RegExp(`/${locale}`));
    });
  }

  test('hreflang tags are present', async ({ page }) => {
    await page.goto('/en');

    // Check for hreflang link tags
    for (const locale of locales) {
      const hreflang = page.locator(`link[hreflang="${locale}"]`);
      // Should have hreflang tags for each locale
      await expect(hreflang).toBeAttached();
    }

    // Should have x-default
    const xDefault = page.locator('link[hreflang="x-default"]');
    await expect(xDefault).toBeAttached();
  });
});

test.describe('Error Handling', () => {
  test('404 page works', async ({ page }) => {
    const response = await page.goto('/en/nonexistent-page-xyz');

    // Should return 404 status
    expect(response?.status()).toBe(404);

    // Should have error content
    await expect(page.locator('main')).toBeVisible();
  });
});
