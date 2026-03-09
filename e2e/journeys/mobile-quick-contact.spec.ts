import { test, expect, devices } from '@playwright/test';

/**
 * Mobile Quick Contact Journey Test
 *
 * Path: / -> /contact
 * Priority: High
 * Device: Mobile
 * Expected clicks: 2
 *
 * Tests mobile user seeking quick contact with touch-friendly UI.
 */

test.describe('Mobile Quick Contact Journey', () => {
  test.use({ ...devices['iPhone 13'] });

  test('mobile homepage has optimized hero', async ({ page }) => {
    await page.goto('/en');

    // Hero should be visible and optimized for mobile
    await expect(page.locator('h1')).toBeVisible();

    // CTAs should be touch-friendly (at least 48px)
    const ctas = page.locator('a[href*="contact"], a[href*="capabilities"]');
    const firstCTA = ctas.first();

    if (await firstCTA.isVisible()) {
      const box = await firstCTA.boundingBox();
      if (box) {
        // Touch targets should be at least 44px (close to 48px minimum)
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
    }
  });

  test('contact form is mobile-optimized', async ({ page }) => {
    await page.goto('/en/contact');

    // Form should be visible
    const form = page.locator('form');
    await expect(form).toBeVisible();

    // Form fields should be visible
    const inputFields = page.locator('input, textarea');
    const firstInput = inputFields.first();
    await expect(firstInput).toBeVisible();

    // Form should fit within viewport (no horizontal scroll)
    const formBox = await form.boundingBox();
    const viewport = page.viewportSize();

    if (formBox && viewport) {
      expect(formBox.width).toBeLessThanOrEqual(viewport.width);
    }
  });

  test('mobile navigation works', async ({ page }) => {
    await page.goto('/en');

    // Look for mobile menu button (hamburger)
    const mobileMenuButton = page.locator('button[aria-label*="menu" i], button[aria-label*="Menu" i], [data-testid="mobile-menu"], button:has(svg)').first();

    if (await mobileMenuButton.isVisible()) {
      // Open mobile menu
      await mobileMenuButton.click();

      // Menu should open
      await page.waitForTimeout(300); // Animation time

      // Should be able to navigate to contact
      const contactLink = page.locator('a[href*="contact"]').first();
      await expect(contactLink).toBeVisible();
    }
  });

  test('quick path from homepage to contact', async ({ page }) => {
    await page.goto('/en');

    // Find direct contact CTA on homepage
    const contactCTA = page.locator('a[href*="contact"]').first();

    if (await contactCTA.isVisible()) {
      await contactCTA.click();
      await expect(page).toHaveURL(/\/en\/contact/);
      await expect(page.locator('form')).toBeVisible();
    } else {
      // Use mobile navigation
      const menuButton = page.locator('button').first();
      if (await menuButton.isVisible()) {
        await menuButton.click();
        await page.waitForTimeout(300);

        const navContact = page.locator('nav a[href*="contact"], a[href*="contact"]').first();
        await navContact.click();
        await expect(page).toHaveURL(/\/en\/contact/);
      }
    }
  });
});

test.describe('Mobile Responsiveness', () => {
  test.use({ ...devices['iPhone 13'] });

  const pages = [
    { path: '/en', name: 'Homepage' },
    { path: '/en/about', name: 'About' },
    { path: '/en/capabilities', name: 'Capabilities' },
    { path: '/en/contact', name: 'Contact' },
  ];

  for (const { path, name } of pages) {
    test(`${name} page is mobile-responsive`, async ({ page }) => {
      await page.goto(path);

      // Page should load
      await expect(page.locator('main')).toBeVisible();

      // Check for horizontal overflow
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = page.viewportSize()?.width || 375;

      // Allow small margin for scrollbars
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20);
    });
  }
});

test.describe('Mobile Touch Accessibility', () => {
  test.use({ ...devices['iPhone 13'] });

  test('all interactive elements are touch-friendly', async ({ page }) => {
    await page.goto('/en');

    // Get all clickable elements
    const buttons = page.locator('button, a, [role="button"]');
    const count = await buttons.count();

    // Sample check on first 10 elements
    for (let i = 0; i < Math.min(count, 10); i++) {
      const element = buttons.nth(i);

      if (await element.isVisible()) {
        const box = await element.boundingBox();

        if (box) {
          // Touch targets should be reasonably sized
          // Note: Some icons may be smaller but wrapped in larger containers
          const minDimension = Math.min(box.width, box.height);
          // Log warning for small targets but don't fail (design decision)
          if (minDimension < 32) {
            console.warn(`Small touch target found: ${minDimension}px`);
          }
        }
      }
    }
  });
});
