# ChatGPT Scraper

Web scraping implementation for ChatGPT citation validation. Used as fallback when API is unavailable or for 10% sample validation per TASK-136 hybrid approach.

## Overview

Playwright-based scraper with stealth mode to extract citations from ChatGPT interface. Designed for validation purposes, not high-volume scraping.

**Use Cases**:
- API rate limit exceeded (E522) - fallback to scraping
- Low confidence API result (<0.7) - validate via scraping
- 10% random sample validation - cross-check API accuracy
- API authentication failure (E529) - temporary fallback

## Dependencies

```bash
# Required packages (not installed in framework - user responsibility)
npm install playwright
npm install playwright-extra
npm install playwright-extra-plugin-stealth
```

## Scraper Implementation

### ChatGPTScraper Class

```javascript
class ChatGPTScraper {
  constructor(options = {}) {
    this.headless = options.headless !== false;
    this.timeout = options.timeout || 60000;
    this.minDelay = options.minDelay || 5000;  // Min 5s between requests
    this.userAgents = options.userAgents || DEFAULT_USER_AGENTS;
    this.lastRequestTime = 0;
  }

  /**
   * Random user agent for rotation
   */
  getRandomUserAgent() {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  /**
   * Enforce minimum delay between requests
   */
  async enforceRateLimit() {
    const elapsed = Date.now() - this.lastRequestTime;
    if (elapsed < this.minDelay) {
      const waitTime = this.minDelay - elapsed;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * Check for citation via web scraping
   * @param {string} keyword - Keyword to search for
   * @returns {Promise<CitationResult>}
   */
  async checkCitation(keyword) {
    const timestamp = new Date().toISOString();

    // Enforce rate limiting
    await this.enforceRateLimit();

    let browser = null;
    let context = null;

    try {
      // Launch browser with stealth mode
      const { chromium } = require('playwright-extra');
      const stealth = require('playwright-extra-plugin-stealth');
      chromium.use(stealth());

      browser = await chromium.launch({
        headless: this.headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu'
        ]
      });

      context = await browser.newContext({
        userAgent: this.getRandomUserAgent(),
        viewport: { width: 1920, height: 1080 },
        locale: 'en-US',
        timezoneId: 'America/New_York'
      });

      const page = await context.newPage();

      // Navigate to ChatGPT
      await page.goto('https://chat.openai.com', {
        waitUntil: 'networkidle',
        timeout: this.timeout
      });

      // Check for CAPTCHA or blocking (E523)
      if (await this.detectBlocking(page)) {
        return {
          platform: 'chatgpt',
          cited: false,
          context_snippet: null,
          rank: null,
          confidence: 0,
          method: 'scraping',
          validated: true,
          error: 'E523',
          reason: 'captcha_or_blocking_detected',
          timestamp
        };
      }

      // Check for login requirement
      if (await this.detectLoginRequired(page)) {
        return {
          platform: 'chatgpt',
          cited: false,
          context_snippet: null,
          rank: null,
          confidence: 0,
          method: 'scraping',
          validated: true,
          error: 'E529',
          reason: 'login_required',
          timestamp
        };
      }

      // Submit query
      await this.submitQuery(page, keyword);

      // Wait for and extract response
      const response = await this.extractResponse(page);

      // Analyze response for citation
      const citationData = this.analyzeCitation(response, keyword);

      return {
        platform: 'chatgpt',
        cited: citationData.cited,
        context_snippet: citationData.snippet,
        rank: null,  // Scraping can't reliably determine rank
        confidence: citationData.confidence,
        method: 'scraping',
        validated: true,
        error: null,
        reason: citationData.cited ? null : 'not_mentioned',
        timestamp
      };

    } catch (error) {
      // Handle specific error types
      if (error.name === 'TimeoutError') {
        return {
          platform: 'chatgpt',
          cited: false,
          context_snippet: null,
          rank: null,
          confidence: 0,
          method: 'scraping',
          validated: true,
          error: 'E526',
          reason: 'scraping_timeout',
          timestamp
        };
      }

      return {
        platform: 'chatgpt',
        cited: false,
        context_snippet: null,
        rank: null,
        confidence: 0,
        method: 'scraping',
        validated: true,
        error: 'E520',
        reason: error.message || 'scraping_failed',
        timestamp
      };

    } finally {
      // Clean up browser resources
      if (context) await context.close();
      if (browser) await browser.close();
    }
  }

  /**
   * Detect CAPTCHA or other blocking mechanisms
   */
  async detectBlocking(page) {
    const blockingSelectors = [
      '.cf-challenge-running',      // Cloudflare challenge
      '#challenge-running',         // Generic challenge
      '[data-testid="captcha"]',    // CAPTCHA element
      '.g-recaptcha',               // Google reCAPTCHA
      '#px-captcha',                // PerimeterX
      '.challenge-form'             // Challenge form
    ];

    for (const selector of blockingSelectors) {
      try {
        if (await page.locator(selector).isVisible({ timeout: 1000 })) {
          return true;
        }
      } catch {
        // Selector not found, continue
      }
    }

    // Check page title for blocked indicators
    const title = await page.title();
    const blockedTitles = ['access denied', 'blocked', 'verification', 'captcha'];
    if (blockedTitles.some(t => title.toLowerCase().includes(t))) {
      return true;
    }

    return false;
  }

  /**
   * Detect if login is required
   */
  async detectLoginRequired(page) {
    const loginSelectors = [
      '[data-testid="login-button"]',
      'button:has-text("Log in")',
      'a:has-text("Sign up")',
      '.auth-page'
    ];

    for (const selector of loginSelectors) {
      try {
        if (await page.locator(selector).isVisible({ timeout: 1000 })) {
          return true;
        }
      } catch {
        // Selector not found, continue
      }
    }

    return false;
  }

  /**
   * Submit query to ChatGPT
   */
  async submitQuery(page, keyword) {
    // Wait for input field
    const inputSelector = 'textarea[data-id="root"]';
    await page.waitForSelector(inputSelector, { timeout: 10000 });

    // Type query (simulate human typing)
    await page.fill(inputSelector, keyword);

    // Small delay before submit
    await page.waitForTimeout(500);

    // Submit query
    await page.keyboard.press('Enter');
  }

  /**
   * Extract response text from ChatGPT
   */
  async extractResponse(page) {
    // Wait for response to appear
    const responseSelector = '[data-message-author-role="assistant"]';

    try {
      await page.waitForSelector(responseSelector, { timeout: 30000 });

      // Wait for response to complete (no more streaming)
      await page.waitForFunction(() => {
        const responses = document.querySelectorAll('[data-message-author-role="assistant"]');
        if (responses.length === 0) return false;
        const lastResponse = responses[responses.length - 1];
        // Check if still streaming (button state changes when done)
        const stopButton = document.querySelector('[data-testid="stop-button"]');
        return !stopButton || stopButton.style.display === 'none';
      }, { timeout: 60000 });

      // Extract text content
      const responses = await page.locator(responseSelector).all();
      const lastResponse = responses[responses.length - 1];
      return await lastResponse.textContent();

    } catch (error) {
      throw new Error(`Failed to extract response: ${error.message}`);
    }
  }

  /**
   * Analyze response for keyword citation
   */
  analyzeCitation(responseText, keyword) {
    if (!responseText) {
      return { cited: false, snippet: null, confidence: 0.3 };
    }

    const normalizedResponse = responseText.toLowerCase();
    const normalizedKeyword = keyword.toLowerCase();

    // Direct mention check
    const directMatch = normalizedResponse.includes(normalizedKeyword);

    if (directMatch) {
      // Extract snippet around the mention
      const index = normalizedResponse.indexOf(normalizedKeyword);
      const start = Math.max(0, index - 50);
      const end = Math.min(responseText.length, index + keyword.length + 100);
      const snippet = responseText.substring(start, end).trim();

      return {
        cited: true,
        snippet: snippet.length > 200 ? snippet.substring(0, 197) + '...' : snippet,
        confidence: 0.75  // Scraping provides lower confidence than API
      };
    }

    // Fuzzy match for partial mentions (brand variations)
    const keywordWords = normalizedKeyword.split(/\s+/);
    if (keywordWords.length > 1) {
      const allWordsPresent = keywordWords.every(word =>
        normalizedResponse.includes(word)
      );

      if (allWordsPresent) {
        // Find first word occurrence for snippet
        const firstWordIndex = normalizedResponse.indexOf(keywordWords[0]);
        const start = Math.max(0, firstWordIndex - 30);
        const end = Math.min(responseText.length, firstWordIndex + 150);
        const snippet = responseText.substring(start, end).trim();

        return {
          cited: true,
          snippet: snippet.length > 200 ? snippet.substring(0, 197) + '...' : snippet,
          confidence: 0.5  // Lower confidence for fuzzy match
        };
      }
    }

    return { cited: false, snippet: null, confidence: 0.3 };
  }
}
```

## User Agent Rotation

```javascript
const DEFAULT_USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];
```

## Rate Limiting

Scraping has stricter rate limits than API to avoid detection:

| Setting | Value | Rationale |
|---------|-------|-----------|
| Min delay | 5000ms | Prevent rapid-fire requests |
| Max concurrent | 1 | Single browser instance |
| Daily limit | 50 | Conservative to avoid blocks |
| Timeout | 60s | Account for slow responses |

## Error Handling

### Error Code Mapping

| Scenario | Error Code | Action |
|----------|------------|--------|
| CAPTCHA detected | E523 | Return immediately, suggest API |
| Page blocked | E523 | Return immediately, wait before retry |
| Login required | E529 | Cannot scrape without auth |
| Timeout | E526 | Return partial result if available |
| Network error | E520 | General failure |
| Selector not found | E520 | Page structure changed |

### Recovery Strategies

```javascript
// Exponential backoff for rate limits
const SCRAPER_RETRY_CONFIG = {
  maxRetries: 2,
  initialDelayMs: 10000,  // 10s initial delay
  maxDelayMs: 60000,      // 1 min max delay
  backoffMultiplier: 2
};

// If blocked, increase delay significantly
async function handleBlocking(scraper) {
  scraper.minDelay = Math.min(scraper.minDelay * 2, 30000);
  console.warn(`Scraper delay increased to ${scraper.minDelay}ms due to blocking`);
}
```

## Usage in Hybrid Detection

```javascript
// In /seo-validate-geo Phase 3
async function hybridDetection(keyword, apiResult) {
  const scraper = new ChatGPTScraper();

  // Determine if scraping needed
  const needsScraping =
    apiResult.error ||                    // API failed
    apiResult.confidence < 0.7 ||         // Low confidence
    Math.random() < 0.1;                  // 10% sample

  if (!needsScraping) {
    return { ...apiResult, validated: false };
  }

  // Run scraping validation
  const scrapingResult = await scraper.checkCitation(keyword);

  // Reconcile results (see reconciliation-logic.md)
  return reconcileResults(apiResult, scrapingResult);
}
```

## Compliance Notes

**Important**: Web scraping ChatGPT may violate their Terms of Service. This implementation is provided for:

1. **Testing purposes** - Validate API accuracy against real interface
2. **Fallback only** - When API is genuinely unavailable
3. **Low volume** - 10% sampling, not bulk extraction

Users are responsible for ensuring compliance with ChatGPT's Terms of Service.

## Test Fixtures

Test HTML pages in `tests/fixtures/chatgpt/`:

| File | Scenario |
|------|----------|
| `scraping-cited.html` | Response containing keyword |
| `scraping-not-found.html` | Response without keyword |
| `scraping-captcha.html` | CAPTCHA challenge page |
| `scraping-login.html` | Login required page |
| `scraping-timeout.html` | Slow loading simulation |

## Integration Points

- **Command**: `/seo-validate-geo` Phase 3 fallback handling
- **Error Codes**: `.claude/skills/error-handling/error-codes.md` (E520, E523, E526, E529)
- **Hybrid Logic**: TASK-136 Step 4 (hybrid detection)
- **Reconciliation**: TASK-136 Step 5 (result merging)
