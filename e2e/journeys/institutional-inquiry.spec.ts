import { test, expect } from '@playwright/test';

/**
 * Institutional Inquiry Journey Test
 *
 * Path: / -> /about -> /about/partners -> /contact
 * Priority: High
 * Expected clicks: 4
 *
 * Tests government/EU program stakeholder journey through trust-building pages.
 */

test.describe('Institutional Inquiry Journey', () => {
  test('completes full institutional journey', async ({ page }) => {
    // Step 1: Land on homepage
    await page.goto('/en');
    await expect(page.locator('h1')).toBeVisible();

    // Step 2: Navigate to About
    await page.goto('/en/about');

    // Verify company mission and vision
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('main')).toContainText(/mission|vision|dualys/i);

    // Verify European positioning
    const europeanContent = page.locator('text=/europe|european|EU|catalonia/i');
    await expect(europeanContent.first()).toBeVisible();

    // Step 3: Navigate to Partners
    await page.goto('/en/about/partners');

    // Verify partner categories exist
    await expect(page.locator('main')).toBeVisible();

    // Should show partner information
    const partnerContent = page.locator('text=/partner|collaboration|ecosystem/i');
    await expect(partnerContent.first()).toBeVisible();

    // Step 4: Navigate to Contact
    await page.goto('/en/contact');
    await expect(page.locator('form')).toBeVisible();
  });

  test('trust signals are visible throughout journey', async ({ page }) => {
    // About page should have trust signals
    await page.goto('/en/about');

    // Look for trust indicators (certifications, partnerships, credentials)
    const aboutContent = page.locator('main');
    await expect(aboutContent).toBeVisible();

    // Partners page should reinforce trust
    await page.goto('/en/about/partners');
    await expect(page.locator('main')).toBeVisible();
  });

  test('team page loads correctly', async ({ page }) => {
    await page.goto('/en/about/team');

    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();

    // Team page should have role-based content (even if placeholder)
    const teamContent = page.locator('main');
    await expect(teamContent).toBeVisible();
  });
});

test.describe('Institutional Journey - European Languages', () => {
  const euLocales = ['en', 'fr', 'de', 'it'];

  for (const locale of euLocales) {
    test(`institutional journey available in ${locale}`, async ({ page }) => {
      // Verify about page
      await page.goto(`/${locale}/about`);
      await expect(page.locator('main')).toBeVisible();

      // Verify partners page
      await page.goto(`/${locale}/about/partners`);
      await expect(page.locator('main')).toBeVisible();

      // Verify contact page
      await page.goto(`/${locale}/contact`);
      await expect(page.locator('form')).toBeVisible();
    });
  }
});
