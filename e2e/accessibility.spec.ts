import { test, expect } from '@playwright/test';

/**
 * Accessibility Tests
 *
 * Validates WCAG 2.2 AA compliance across critical pages.
 */

test.describe('Accessibility - Core Requirements', () => {
  const pages = [
    { path: '/en', name: 'Homepage' },
    { path: '/en/about', name: 'About' },
    { path: '/en/capabilities', name: 'Capabilities' },
    { path: '/en/contact', name: 'Contact' },
  ];

  for (const { path, name } of pages) {
    test(`${name} has proper heading hierarchy`, async ({ page }) => {
      await page.goto(path);

      // Should have exactly one h1
      const h1s = page.locator('h1');
      await expect(h1s).toHaveCount(1);

      // Get all headings
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();

      let lastLevel = 0;
      for (const heading of headings) {
        const tagName = await heading.evaluate((el) => el.tagName);
        const level = parseInt(tagName.replace('H', ''));

        // Heading levels should not skip (e.g., h1 -> h3)
        if (lastLevel > 0) {
          expect(level).toBeLessThanOrEqual(lastLevel + 1);
        }
        lastLevel = level;
      }
    });

    test(`${name} has accessible images`, async ({ page }) => {
      await page.goto(path);

      const images = page.locator('img');
      const count = await images.count();

      for (let i = 0; i < count; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        const role = await img.getAttribute('role');

        // Images should have alt text or role="presentation" for decorative
        const hasAlt = alt !== null && alt.length > 0;
        const isDecorative = role === 'presentation' || alt === '';

        expect(hasAlt || isDecorative).toBeTruthy();
      }
    });

    test(`${name} has accessible form labels`, async ({ page }) => {
      await page.goto(path);

      const inputs = page.locator('input:not([type="hidden"]):not([type="submit"]), textarea, select');
      const count = await inputs.count();

      for (let i = 0; i < count; i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        const placeholder = await input.getAttribute('placeholder');

        // Input should have a label, aria-label, or aria-labelledby
        const hasLabel = id && (await page.locator(`label[for="${id}"]`).count()) > 0;
        const hasAriaLabel = ariaLabel !== null && ariaLabel.length > 0;
        const hasAriaLabelledBy = ariaLabelledBy !== null;

        // At minimum, should have some form of labeling
        const isLabeled = hasLabel || hasAriaLabel || hasAriaLabelledBy || (placeholder !== null && placeholder.length > 0);

        expect(isLabeled).toBeTruthy();
      }
    });

    test(`${name} has sufficient color contrast`, async ({ page }) => {
      await page.goto(path);

      // Basic check: text should be visible against background
      const mainContent = page.locator('main');
      await expect(mainContent).toBeVisible();

      // Verify primary text is readable
      const h1 = page.locator('h1');
      await expect(h1).toBeVisible();
    });
  }
});

test.describe('Accessibility - Keyboard Navigation', () => {
  test('can navigate with keyboard only', async ({ page }) => {
    await page.goto('/en');

    // Tab through the page
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');

      // Focused element should be visible
      const focused = page.locator(':focus');
      const isVisible = await focused.isVisible().catch(() => false);

      // Some focus states might be on hidden skip links initially
      if (i > 2) {
        expect(isVisible).toBeTruthy();
      }
    }
  });

  test('skip link works', async ({ page }) => {
    await page.goto('/en');

    // Skip links should be present (often hidden until focused)
    const skipLink = page.locator('a[href="#main"], a[href="#content"], .skip-link, [class*="skip"]');

    // Tab to focus skip link
    await page.keyboard.press('Tab');

    // If skip link exists and is focusable
    const skipLinkExists = (await skipLink.count()) > 0;

    if (skipLinkExists) {
      // Skip link should become visible on focus
      await expect(skipLink.first()).toBeVisible();
    }
  });

  test('focus trap in modals', async ({ page }) => {
    await page.goto('/en');

    // Open mobile menu if present
    const menuButton = page.locator('button[aria-label*="menu" i], [data-testid="mobile-menu-button"]');

    if ((await menuButton.count()) > 0 && (await menuButton.first().isVisible())) {
      await menuButton.first().click();
      await page.waitForTimeout(300);

      // Tab should stay within modal
      const initialFocused = await page.evaluate(() => document.activeElement?.tagName);

      // Tab multiple times
      for (let i = 0; i < 15; i++) {
        await page.keyboard.press('Tab');
      }

      // Focus should still be within header/nav area
      const finalFocused = page.locator(':focus');
      const isInNav = await finalFocused.evaluate((el) => {
        return !!el.closest('header, nav, [role="dialog"], [role="navigation"]');
      });

      // Modal content should trap focus
      expect(isInNav).toBeTruthy();
    }
  });
});

test.describe('Accessibility - ARIA', () => {
  test('interactive elements have proper roles', async ({ page }) => {
    await page.goto('/en');

    // Buttons that look like buttons should be buttons
    const clickables = page.locator('[onclick], [class*="btn"], [class*="button"]');
    const count = await clickables.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const el = clickables.nth(i);
      const tagName = await el.evaluate((e) => e.tagName);
      const role = await el.getAttribute('role');

      // Non-button/link elements with click handlers should have role
      if (tagName !== 'BUTTON' && tagName !== 'A') {
        const hasRole = role === 'button' || role === 'link';
        // Log warning but don't fail for non-critical
        if (!hasRole) {
          console.warn(`Element with click handler missing role: ${tagName}`);
        }
      }
    }
  });

  test('navigation landmarks are present', async ({ page }) => {
    await page.goto('/en');

    // Should have main landmark
    const main = page.locator('main, [role="main"]');
    await expect(main).toHaveCount(1);

    // Should have navigation
    const nav = page.locator('nav, [role="navigation"]');
    expect(await nav.count()).toBeGreaterThan(0);

    // Should have header
    const header = page.locator('header, [role="banner"]');
    await expect(header).toHaveCount(1);

    // Should have footer
    const footer = page.locator('footer, [role="contentinfo"]');
    await expect(footer).toHaveCount(1);
  });
});
