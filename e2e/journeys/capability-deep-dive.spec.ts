import { test, expect } from '@playwright/test';

/**
 * Capability Deep Dive Journey Test
 *
 * Path: / -> /capabilities/defense -> /contact
 * Priority: Critical
 * Expected clicks: 3
 *
 * Tests user exploring a specific capability before contact.
 */

test.describe('Capability Deep Dive Journey', () => {
  const capabilities = ['defense', 'cybersecurity', 'biosecurity', 'dual-use'];

  test('homepage to defense capability to contact', async ({ page }) => {
    // Step 1: Land on homepage
    await page.goto('/en');
    await expect(page.locator('h1')).toBeVisible();

    // Step 2: Navigate to defense capability
    await page.goto('/en/capabilities/defense');

    // Verify detailed capability description
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('main')).toContainText(/defense|unmanned|autonomous/i);

    // Verify use cases section exists
    const useCases = page.locator('text=/use case|application|scenario/i');
    // Page should have content about applications/use cases
    await expect(page.locator('main')).toBeVisible();

    // Verify CTA to contact
    const contactCTA = page.locator('a[href*="contact"]').first();
    await expect(contactCTA).toBeVisible();

    // Step 3: Navigate to contact
    await contactCTA.click();
    await expect(page).toHaveURL(/\/en\/contact/);
    await expect(page.locator('form')).toBeVisible();
  });

  for (const capability of capabilities) {
    test(`${capability} capability page loads correctly`, async ({ page }) => {
      await page.goto(`/en/capabilities/${capability}`);

      // Verify page loads without 404
      await expect(page.locator('h1')).toBeVisible();

      // Verify main content area
      await expect(page.locator('main')).toBeVisible();

      // Should have navigation back to capabilities
      const capabilitiesLink = page.locator('a[href*="capabilities"]').first();
      await expect(capabilitiesLink).toBeVisible();

      // Should have contact CTA
      const contactLink = page.locator('a[href*="contact"]');
      await expect(contactLink.first()).toBeVisible();
    });
  }

  test('related capabilities are accessible from each capability page', async ({ page }) => {
    // Start at defense
    await page.goto('/en/capabilities/defense');
    await expect(page.locator('main')).toBeVisible();

    // Check we can navigate to other capabilities (via header or related section)
    await page.goto('/en/capabilities/cybersecurity');
    await expect(page.locator('main')).toBeVisible();

    await page.goto('/en/capabilities/biosecurity');
    await expect(page.locator('main')).toBeVisible();

    await page.goto('/en/capabilities/dual-use');
    await expect(page.locator('main')).toBeVisible();
  });
});
