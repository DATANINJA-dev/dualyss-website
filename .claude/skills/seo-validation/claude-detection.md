# Claude AI Citation Detection

Web scraping implementation for Claude AI citation validation. Claude has no public API for response analysis, so scraping is the only detection method available.

## Overview

Playwright-based detector with stealth mode to extract and analyze Claude AI responses for brand/domain mentions. Unlike Perplexity, Claude does not provide explicit citations - detection is based on mention analysis.

**Characteristics**:
- **API Available**: No (scraping only)
- **Citation Style**: Inline mentions (no explicit source links)
- **Access Method**: Web scraping via Playwright
- **Authentication**: Required (free tier account minimum)

## Dependencies

```bash
# Required packages (user responsibility to install)
npm install playwright
npm install playwright-extra
npm install playwright-extra-plugin-stealth
```

## ClaudeDetector Class

```typescript
class ClaudeDetector implements AISearchAPIClient {
  private sessionPath: string;
  private rateLimiter: RateLimitTracker;
  private circuitBreaker: CircuitBreaker;
  private userAgents: string[];

  constructor(options: ClaudeDetectorOptions = {}) {
    this.sessionPath = options.sessionPath || '~/.claude-code/geo-sessions/claude-cookies.json';
    this.userAgents = options.userAgents || DEFAULT_USER_AGENTS;

    // Conservative rate limiting - scraping only
    this.rateLimiter = new RateLimitTracker({
      maxRequests: 20,           // 20 requests per hour
      windowMs: 3600000,         // 1 hour window
      minDelayMs: 5000,          // 5s minimum between requests
      backoff: 'exponential'
    });

    // Circuit breaker for resilience
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 3,       // Open after 3 consecutive failures
      resetTimeoutMs: 300000,    // Try again after 5 minutes
      halfOpenRequests: 1        // Allow 1 test request when half-open
    });
  }

  /**
   * Check if Claude mentions the target domain for a keyword
   * @param keyword - Search query to submit to Claude
   * @param domain - Target domain to detect mentions of
   * @returns CitationResult with confidence score
   */
  async detectCitation(keyword: string, domain: string): Promise<CitationResult> {
    const timestamp = new Date().toISOString();

    // Circuit breaker check
    if (!this.circuitBreaker.allowRequest()) {
      return this.errorResult(keyword, 'E524', 'Circuit breaker open - too many failures', timestamp);
    }

    // Session validity check
    if (!await this.hasValidSession()) {
      return this.errorResult(keyword, 'E529', 'Claude authentication required', timestamp);
    }

    // Rate limit check
    if (!this.rateLimiter.canMakeRequest()) {
      return this.errorResult(keyword, 'E522', 'Claude rate limit exceeded', timestamp);
    }

    // Enforce minimum delay
    await this.rateLimiter.enforceDelay();

    let browser = null;
    let context = null;

    try {
      // Launch browser with stealth mode
      const { chromium } = require('playwright-extra');
      const stealth = require('playwright-extra-plugin-stealth');
      chromium.use(stealth());

      browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu'
        ]
      });

      context = await browser.newContext({
        storageState: this.resolveSessionPath(),
        userAgent: this.getRandomUserAgent(),
        viewport: { width: 1920, height: 1080 },
        locale: 'en-US',
        timezoneId: 'America/New_York'
      });

      const page = await context.newPage();

      // Navigate to Claude
      await page.goto('https://claude.ai/new', {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Check for blocking
      if (await this.detectBlocking(page)) {
        this.circuitBreaker.recordFailure();
        return this.errorResult(keyword, 'E523', 'Blocking detected (CAPTCHA/ban)', timestamp);
      }

      // Check for login requirement (session expired)
      if (await this.detectLoginRequired(page)) {
        return this.errorResult(keyword, 'E529', 'Claude session expired - re-authentication required', timestamp);
      }

      // Submit query
      await this.submitQuery(page, keyword);

      // Wait for and extract response
      const responseText = await this.extractResponse(page);

      // Analyze response for domain mentions
      const analysis = this.analyzeResponse(responseText, domain, keyword);

      // Record success
      this.circuitBreaker.recordSuccess();
      this.rateLimiter.recordRequest();

      return {
        keyword,
        platform: 'claude',
        cited: analysis.cited,
        context: analysis.snippet,
        rank: null,  // Claude doesn't provide ranking
        confidence: analysis.confidence,
        timestamp,
        source: 'scraping',
        method: 'scraping',
        error: null,
        reason: analysis.cited ? null : 'not_mentioned'
      };

    } catch (error) {
      this.circuitBreaker.recordFailure();
      return this.handleError(error, keyword, timestamp);

    } finally {
      if (context) await context.close();
      if (browser) await browser.close();
    }
  }

  /**
   * Check if valid session cookies exist
   */
  async hasValidSession(): Promise<boolean> {
    const fs = require('fs');
    const path = this.resolveSessionPath();

    try {
      if (!fs.existsSync(path)) return false;

      const stats = fs.statSync(path);
      const ageHours = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60);

      // Sessions expire after 24 hours
      if (ageHours > 24) {
        console.warn('Claude session expired (>24h old)');
        return false;
      }

      // Validate JSON structure
      const data = JSON.parse(fs.readFileSync(path, 'utf8'));
      return data.cookies && data.cookies.length > 0;

    } catch {
      return false;
    }
  }

  /**
   * Refresh session by launching interactive browser
   * User must manually log in
   */
  async refreshSession(): Promise<void> {
    const { chromium } = require('playwright');

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('https://claude.ai/login');

    console.log('\n📋 Claude Session Setup');
    console.log('═══════════════════════════════════════════');
    console.log('1. Log in to Claude in the browser window');
    console.log('2. Wait for the main chat interface to load');
    console.log('3. Press Enter here when ready...');

    // Wait for user to complete login
    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });

    // Save session
    const fs = require('fs');
    const path = require('path');
    const sessionPath = this.resolveSessionPath();

    // Ensure directory exists
    fs.mkdirSync(path.dirname(sessionPath), { recursive: true });

    // Save cookies
    const storage = await context.storageState();
    fs.writeFileSync(sessionPath, JSON.stringify(storage, null, 2));

    await browser.close();
    console.log('✓ Session saved to', sessionPath);
  }

  /**
   * Get rate limit status
   */
  getRateLimit(): RateLimitInfo {
    return {
      tier: 'free',
      limit: 20,
      remaining: this.rateLimiter.getRemaining(),
      resetAt: this.rateLimiter.getResetTime(),
      period: 'hour'
    };
  }

  /**
   * Get remaining quota
   */
  getQuotaRemaining(): number {
    return this.rateLimiter.getRemaining();
  }

  /**
   * Check if detector is properly configured
   */
  isConfigured(): boolean {
    return true;  // Scraping doesn't require API key
  }

  // ─────────────────────────────────────────────────────────────────
  // Private Methods
  // ─────────────────────────────────────────────────────────────────

  private resolveSessionPath(): string {
    const os = require('os');
    return this.sessionPath.replace(/^~/, os.homedir());
  }

  private getRandomUserAgent(): string {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  /**
   * Detect CAPTCHA or blocking
   */
  private async detectBlocking(page: any): Promise<boolean> {
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
    const blockedTitles = ['access denied', 'blocked', 'verification', 'captcha', 'security'];
    if (blockedTitles.some(t => title.toLowerCase().includes(t))) {
      return true;
    }

    return false;
  }

  /**
   * Detect if login is required (session invalid)
   */
  private async detectLoginRequired(page: any): Promise<boolean> {
    const loginSelectors = [
      '[data-testid="login-button"]',
      'button:has-text("Log in")',
      'button:has-text("Sign in")',
      'a:has-text("Sign up")',
      '.auth-page',
      '[href="/login"]'
    ];

    for (const selector of loginSelectors) {
      try {
        if (await page.locator(selector).isVisible({ timeout: 2000 })) {
          return true;
        }
      } catch {
        // Selector not found, continue
      }
    }

    return false;
  }

  /**
   * Submit query to Claude
   */
  private async submitQuery(page: any, keyword: string): Promise<void> {
    // Wait for composer input
    const inputSelector = '[data-testid="composer-input"], textarea[placeholder*="Message"]';
    await page.waitForSelector(inputSelector, { timeout: 10000 });

    // Type query
    await page.fill(inputSelector, keyword);

    // Small delay to simulate human
    await page.waitForTimeout(300);

    // Submit
    const sendSelector = '[data-testid="send-button"], button[aria-label="Send"]';
    await page.click(sendSelector);
  }

  /**
   * Extract response text from Claude
   */
  private async extractResponse(page: any): Promise<string> {
    // Wait for response to appear
    const responseSelector = '[data-testid="assistant-message"], .assistant-message';

    try {
      await page.waitForSelector(responseSelector, { timeout: 60000 });

      // Wait for streaming to complete
      await this.waitForStreamComplete(page);

      // Extract text from last assistant message
      const responses = await page.locator(responseSelector).all();
      if (responses.length === 0) {
        throw new Error('No response found');
      }

      const lastResponse = responses[responses.length - 1];
      return await lastResponse.textContent();

    } catch (error) {
      throw new Error(`Failed to extract response: ${error.message}`);
    }
  }

  /**
   * Wait for Claude's streaming response to complete
   */
  private async waitForStreamComplete(page: any): Promise<void> {
    try {
      // Wait for stop button to disappear (indicates streaming done)
      await page.waitForFunction(() => {
        const stopButton = document.querySelector('[data-testid="stop-button"]');
        return !stopButton || stopButton.style.display === 'none' ||
               getComputedStyle(stopButton).display === 'none';
      }, { timeout: 60000 });

      // Additional small delay to ensure text is stable
      await page.waitForTimeout(500);

    } catch {
      // Timeout waiting for stream - response might be complete
      console.warn('Timeout waiting for stream completion');
    }
  }

  /**
   * Analyze response for domain mentions
   */
  private analyzeResponse(responseText: string, domain: string, keyword: string): {
    cited: boolean;
    snippet: string | null;
    confidence: number;
  } {
    if (!responseText) {
      return { cited: false, snippet: null, confidence: 0 };
    }

    const lowerResponse = responseText.toLowerCase();
    const lowerDomain = domain.toLowerCase();

    // Check for domain mention
    const mentioned = lowerResponse.includes(lowerDomain);

    if (!mentioned) {
      return { cited: false, snippet: null, confidence: 0 };
    }

    // Extract context snippet
    const snippet = this.extractSnippet(responseText, domain);

    // Calculate confidence score
    const confidence = this.calculateConfidence(responseText, domain);

    return {
      cited: true,
      snippet,
      confidence
    };
  }

  /**
   * Extract snippet around domain mention
   */
  private extractSnippet(text: string, domain: string): string {
    const lowerText = text.toLowerCase();
    const lowerDomain = domain.toLowerCase();
    const index = lowerText.indexOf(lowerDomain);

    if (index === -1) return null;

    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + domain.length + 100);
    let snippet = text.substring(start, end).trim();

    // Add ellipsis if truncated
    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';

    return snippet.length > 200 ? snippet.substring(0, 197) + '...' : snippet;
  }

  /**
   * Calculate confidence score for mention
   *
   * Scoring factors:
   * - Base: 0.5 for any mention
   * - +0.1 per additional mention (max +0.3)
   * - +0.2 for relevant context (near recommendation terms)
   *
   * Max confidence: 1.0
   */
  private calculateConfidence(text: string, domain: string): number {
    let score = 0;
    const lowerText = text.toLowerCase();
    const lowerDomain = domain.toLowerCase();

    // Base score for any mention
    if (lowerText.includes(lowerDomain)) {
      score += 0.5;
    }

    // Multiple mentions boost
    const regex = new RegExp(this.escapeRegex(lowerDomain), 'g');
    const mentions = (lowerText.match(regex) || []).length;
    score += Math.min(mentions * 0.1, 0.3);

    // Relevant context boost
    if (this.hasRelevantContext(text, domain)) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Check if mention is in relevant context (recommendation, comparison, etc.)
   */
  private hasRelevantContext(text: string, domain: string): boolean {
    const lowerText = text.toLowerCase();
    const lowerDomain = domain.toLowerCase();

    // Find position of domain mention
    const domainIndex = lowerText.indexOf(lowerDomain);
    if (domainIndex === -1) return false;

    // Check surrounding text for recommendation keywords
    const contextStart = Math.max(0, domainIndex - 100);
    const contextEnd = Math.min(lowerText.length, domainIndex + domain.length + 100);
    const context = lowerText.substring(contextStart, contextEnd);

    const relevantTerms = [
      'recommend', 'suggest', 'best', 'top', 'leading', 'popular',
      'excellent', 'great', 'consider', 'check out', 'try',
      'useful', 'helpful', 'notable', 'well-known', 'trusted'
    ];

    return relevantTerms.some(term => context.includes(term));
  }

  /**
   * Escape special regex characters
   */
  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Create error result
   */
  private errorResult(keyword: string, code: string, reason: string, timestamp: string): CitationResult {
    return {
      keyword,
      platform: 'claude',
      cited: false,
      context: null,
      rank: null,
      confidence: 0,
      timestamp,
      source: 'scraping',
      method: 'scraping',
      error: code,
      reason
    };
  }

  /**
   * Handle errors and map to error codes
   */
  private handleError(error: Error, keyword: string, timestamp: string): CitationResult {
    if (error.name === 'TimeoutError') {
      return this.errorResult(keyword, 'E524', 'Claude response timeout', timestamp);
    }

    if (error.message.includes('net::ERR_')) {
      return this.errorResult(keyword, 'E524', 'Network error accessing Claude', timestamp);
    }

    return this.errorResult(keyword, 'E524', error.message || 'Claude detection failed', timestamp);
  }
}
```

## User Agent Rotation

```javascript
const DEFAULT_USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
];
```

## Rate Limiting

Claude scraping uses conservative rate limits to avoid detection:

| Setting | Value | Rationale |
|---------|-------|-----------|
| Max requests | 20/hour | Prevent account flagging |
| Min delay | 5000ms | Simulate human behavior |
| Max concurrent | 1 | Single browser instance |
| Timeout | 60s | Account for slow responses |
| Session TTL | 24h | Re-authenticate daily |

## Error Codes

| Code | Message | Recovery |
|------|---------|----------|
| E522 | Rate limit exceeded | Wait for rate limit reset |
| E523 | Blocking detected | Increase delays, check manually |
| E524 | Claude detection failed | General failure, retry later |
| E529 | Authentication required | Run `refreshSession()` |

## Session Management

Sessions are stored as Playwright storage state (cookies + localStorage):

```
~/.claude-code/geo-sessions/
└── claude-cookies.json    # Session storage (24h TTL)
```

### Initial Setup

```bash
# First-time setup requires interactive login
const detector = new ClaudeDetector();
await detector.refreshSession();
```

### Session Refresh

Sessions automatically expire after 24 hours. When expired:
1. `hasValidSession()` returns `false`
2. Detection returns `E529` error
3. User must run `refreshSession()` for interactive re-login

## Usage in /seo-validate-geo

```javascript
// In Phase 3: Platform Detection
async function detectClaudeCitation(keyword: string, domain: string) {
  const detector = new ClaudeDetector();

  // Check if session is valid
  if (!await detector.hasValidSession()) {
    console.warn('Claude session required. Run: claude.refreshSession()');
    return null;
  }

  // Perform detection
  const result = await detector.detectCitation(keyword, domain);

  // Handle result
  if (result.error) {
    console.warn(`Claude detection failed: ${result.error} - ${result.reason}`);
  }

  return result;
}
```

## Compliance Notes

**Important**: Web scraping Claude may violate Anthropic's Terms of Service. This implementation is provided for:

1. **Research purposes** - Academic analysis of AI citation patterns
2. **Personal use** - Checking your own brand visibility
3. **Low volume** - Conservative rate limits to minimize impact

Users are responsible for ensuring compliance with Anthropic's Terms of Service.

## Integration Points

- **Command**: `/seo-validate-geo` Phase 3 (platform: 'claude')
- **API Interface**: Implements `AISearchAPIClient` from `api-clients.md`
- **Error Codes**: `.claude/skills/error-handling/error-codes.md` (E522, E523, E524, E529)
- **Rate Limiting**: Uses patterns from `rate-limiting.md`
- **Similar**: `chatgpt-scraper.md` (scraping pattern precedent)
