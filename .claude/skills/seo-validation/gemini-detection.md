# Google Gemini Citation Detection

Hybrid detection implementation for Google Gemini citation validation. Uses Vertex AI/Generative Language API as primary method with web scraping fallback.

## Overview

Gemini supports both API access (via Google AI Studio / Vertex AI) and web interface. Unlike Claude, Gemini can provide explicit citation sources through `groundingMetadata` when using the Search grounding feature.

**Characteristics**:
- **API Available**: Yes (Google AI Studio / Vertex AI)
- **Citation Style**: Mixed (groundingMetadata sources + inline mentions)
- **Access Method**: Hybrid (API primary, scraping fallback)
- **Authentication**: API key or Google account (for scraping)

## Dependencies

```bash
# For API access
npm install @google/generative-ai

# For scraping fallback
npm install playwright
npm install playwright-extra
npm install playwright-extra-plugin-stealth
```

## GeminiDetector Class

```typescript
class GeminiDetector implements AISearchAPIClient {
  private apiKey?: string;
  private sessionPath: string;
  private rateLimiter: RateLimitTracker;
  private circuitBreaker: CircuitBreaker;
  private userAgents: string[];
  private preferAPI: boolean;

  constructor(options: GeminiDetectorOptions = {}) {
    this.apiKey = options.apiKey || process.env.GEMINI_API_KEY;
    this.sessionPath = options.sessionPath || '~/.claude-code/geo-sessions/gemini-cookies.json';
    this.userAgents = options.userAgents || DEFAULT_USER_AGENTS;
    this.preferAPI = options.preferAPI !== false;

    // Rate limiting - different for API vs scraping
    this.rateLimiter = new RateLimitTracker({
      maxRequests: this.apiKey ? 60 : 20,  // 60/min for API, 20/hour for scraping
      windowMs: this.apiKey ? 60000 : 3600000,
      minDelayMs: this.apiKey ? 1000 : 5000,
      backoff: 'exponential'
    });

    // Circuit breaker for resilience
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 3,
      resetTimeoutMs: 300000,
      halfOpenRequests: 1
    });
  }

  /**
   * Check if Gemini mentions the target domain for a keyword
   * Uses API if configured, falls back to scraping
   */
  async detectCitation(keyword: string, domain: string): Promise<CitationResult> {
    const timestamp = new Date().toISOString();

    // Circuit breaker check
    if (!this.circuitBreaker.allowRequest()) {
      return this.errorResult(keyword, 'E525', 'Circuit breaker open - too many failures', timestamp);
    }

    // Try API first if available and preferred
    if (this.apiKey && this.preferAPI) {
      const apiResult = await this.detectViaAPI(keyword, domain, timestamp);

      // If API succeeded, return result
      if (!apiResult.error) {
        this.circuitBreaker.recordSuccess();
        return apiResult;
      }

      // If API failed with quota, don't fall back
      if (apiResult.error === 'E526') {
        return apiResult;
      }

      // Fall back to scraping for other API errors
      console.warn(`Gemini API failed (${apiResult.error}), falling back to scraping`);
    }

    // Scraping path
    return this.detectViaScraping(keyword, domain, timestamp);
  }

  /**
   * Detect citation via Google Generative Language API
   */
  private async detectViaAPI(keyword: string, domain: string, timestamp: string): Promise<CitationResult> {
    // Rate limit check
    if (!this.rateLimiter.canMakeRequest()) {
      return this.errorResult(keyword, 'E526', 'Gemini API quota exceeded', timestamp);
    }

    await this.rateLimiter.enforceDelay();

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: keyword }]
            }],
            generationConfig: {
              temperature: 0,
              maxOutputTokens: 2048
            },
            // Enable grounding for citation sources (if available)
            tools: [{
              googleSearchRetrieval: {
                dynamicRetrievalConfig: {
                  mode: "MODE_DYNAMIC"
                }
              }
            }]
          })
        }
      );

      // Handle rate limiting
      if (response.status === 429) {
        return this.errorResult(keyword, 'E526', 'Gemini API rate limit exceeded', timestamp);
      }

      // Handle auth errors
      if (response.status === 401 || response.status === 403) {
        return this.errorResult(keyword, 'E529', 'Gemini API authentication failed', timestamp);
      }

      // Handle other errors
      if (!response.ok) {
        return this.errorResult(keyword, 'E525', `Gemini API error: ${response.status}`, timestamp);
      }

      const data = await response.json();

      // Extract response text
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // Check for grounding metadata (explicit citations)
      const grounding = data.candidates?.[0]?.groundingMetadata;

      // Analyze for citations
      const analysis = this.analyzeAPIResponse(text, grounding, domain);

      this.rateLimiter.recordRequest();

      return {
        keyword,
        platform: 'gemini',
        cited: analysis.cited,
        context: analysis.snippet,
        rank: analysis.rank,
        confidence: analysis.confidence,
        timestamp,
        source: 'scraping',  // Keep as 'scraping' for consistency with CitationResult type
        method: 'api',
        error: null,
        reason: analysis.cited ? null : 'not_mentioned'
      };

    } catch (error) {
      return this.handleAPIError(error, keyword, timestamp);
    }
  }

  /**
   * Detect citation via web scraping (fallback)
   */
  private async detectViaScraping(keyword: string, domain: string, timestamp: string): Promise<CitationResult> {
    // Session validity check
    if (!await this.hasValidSession()) {
      return this.errorResult(keyword, 'E529', 'Gemini authentication required', timestamp);
    }

    // Rate limit check (stricter for scraping)
    if (!this.rateLimiter.canMakeRequest()) {
      return this.errorResult(keyword, 'E522', 'Gemini scraping rate limit exceeded', timestamp);
    }

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
          '--disable-dev-shm-usage'
        ]
      });

      context = await browser.newContext({
        storageState: this.resolveSessionPath(),
        userAgent: this.getRandomUserAgent(),
        viewport: { width: 1920, height: 1080 },
        locale: 'en-US'
      });

      const page = await context.newPage();

      // Navigate to Gemini
      await page.goto('https://gemini.google.com/app', {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Check for blocking
      if (await this.detectBlocking(page)) {
        this.circuitBreaker.recordFailure();
        return this.errorResult(keyword, 'E523', 'Blocking detected', timestamp);
      }

      // Check for login requirement
      if (await this.detectLoginRequired(page)) {
        return this.errorResult(keyword, 'E529', 'Gemini session expired', timestamp);
      }

      // Submit query
      await this.submitQuery(page, keyword);

      // Wait for and extract response
      const responseText = await this.extractResponse(page);

      // Analyze response
      const analysis = this.analyzeScrapingResponse(responseText, domain);

      this.circuitBreaker.recordSuccess();
      this.rateLimiter.recordRequest();

      return {
        keyword,
        platform: 'gemini',
        cited: analysis.cited,
        context: analysis.snippet,
        rank: null,
        confidence: analysis.confidence,
        timestamp,
        source: 'scraping',
        method: 'scraping',
        error: null,
        reason: analysis.cited ? null : 'not_mentioned'
      };

    } catch (error) {
      this.circuitBreaker.recordFailure();
      return this.handleScrapingError(error, keyword, timestamp);

    } finally {
      if (context) await context.close();
      if (browser) await browser.close();
    }
  }

  /**
   * Analyze API response including groundingMetadata
   */
  private analyzeAPIResponse(text: string, grounding: any, domain: string): {
    cited: boolean;
    snippet: string | null;
    confidence: number;
    rank: number | null;
  } {
    const lowerDomain = domain.toLowerCase();

    // Check groundingMetadata for explicit citations (highest confidence)
    if (grounding?.groundingChunks) {
      let rank = 0;
      for (const chunk of grounding.groundingChunks) {
        rank++;
        if (chunk.web?.uri?.toLowerCase().includes(lowerDomain)) {
          return {
            cited: true,
            snippet: chunk.web.title || this.extractSnippet(text, domain),
            confidence: 0.95,  // Very high confidence for explicit grounding
            rank
          };
        }
      }
    }

    // Check web search queries for domain mention
    if (grounding?.webSearchQueries) {
      for (const query of grounding.webSearchQueries) {
        if (query.toLowerCase().includes(lowerDomain)) {
          return {
            cited: true,
            snippet: this.extractSnippet(text, domain),
            confidence: 0.85,
            rank: null
          };
        }
      }
    }

    // Fall back to mention detection in response text
    if (text.toLowerCase().includes(lowerDomain)) {
      return {
        cited: true,
        snippet: this.extractSnippet(text, domain),
        confidence: this.calculateMentionConfidence(text, domain),
        rank: null
      };
    }

    return {
      cited: false,
      snippet: null,
      confidence: 0,
      rank: null
    };
  }

  /**
   * Analyze scraping response (mention-based only)
   */
  private analyzeScrapingResponse(text: string, domain: string): {
    cited: boolean;
    snippet: string | null;
    confidence: number;
  } {
    if (!text) {
      return { cited: false, snippet: null, confidence: 0 };
    }

    const lowerText = text.toLowerCase();
    const lowerDomain = domain.toLowerCase();

    if (!lowerText.includes(lowerDomain)) {
      return { cited: false, snippet: null, confidence: 0 };
    }

    return {
      cited: true,
      snippet: this.extractSnippet(text, domain),
      confidence: this.calculateMentionConfidence(text, domain) * 0.9  // Slightly lower for scraping
    };
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
      if (ageHours > 24) return false;

      const data = JSON.parse(fs.readFileSync(path, 'utf8'));
      return data.cookies && data.cookies.length > 0;

    } catch {
      return false;
    }
  }

  /**
   * Refresh session via interactive login
   */
  async refreshSession(): Promise<void> {
    const { chromium } = require('playwright');

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('https://accounts.google.com/signin');

    console.log('\n📋 Gemini Session Setup');
    console.log('═══════════════════════════════════════════');
    console.log('1. Log in to your Google account');
    console.log('2. Navigate to gemini.google.com');
    console.log('3. Wait for the chat interface to load');
    console.log('4. Press Enter here when ready...');

    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });

    // Save session
    const fs = require('fs');
    const pathModule = require('path');
    const sessionPath = this.resolveSessionPath();

    fs.mkdirSync(pathModule.dirname(sessionPath), { recursive: true });
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
      tier: this.apiKey ? 'pro' : 'free',
      limit: this.apiKey ? 60 : 20,
      remaining: this.rateLimiter.getRemaining(),
      resetAt: this.rateLimiter.getResetTime(),
      period: this.apiKey ? 'minute' : 'hour'
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
    return !!this.apiKey || true;  // Scraping fallback always available
  }

  // ─────────────────────────────────────────────────────────────────
  // Private Helper Methods
  // ─────────────────────────────────────────────────────────────────

  private resolveSessionPath(): string {
    const os = require('os');
    return this.sessionPath.replace(/^~/, os.homedir());
  }

  private getRandomUserAgent(): string {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  private async detectBlocking(page: any): Promise<boolean> {
    const blockingSelectors = [
      '.cf-challenge-running',
      '#challenge-running',
      '[data-testid="captcha"]',
      '.g-recaptcha'
    ];

    for (const selector of blockingSelectors) {
      try {
        if (await page.locator(selector).isVisible({ timeout: 1000 })) {
          return true;
        }
      } catch {
        // Selector not found
      }
    }

    return false;
  }

  private async detectLoginRequired(page: any): Promise<boolean> {
    const loginSelectors = [
      '[data-testid="sign-in-button"]',
      'button:has-text("Sign in")',
      'a:has-text("Sign in")',
      '[href*="accounts.google.com/signin"]'
    ];

    for (const selector of loginSelectors) {
      try {
        if (await page.locator(selector).isVisible({ timeout: 2000 })) {
          return true;
        }
      } catch {
        // Selector not found
      }
    }

    return false;
  }

  private async submitQuery(page: any, keyword: string): Promise<void> {
    // Wait for input
    const inputSelector = 'textarea[placeholder*="Enter a prompt"], [contenteditable="true"]';
    await page.waitForSelector(inputSelector, { timeout: 10000 });

    await page.fill(inputSelector, keyword);
    await page.waitForTimeout(300);

    // Submit
    await page.keyboard.press('Enter');
  }

  private async extractResponse(page: any): Promise<string> {
    // Wait for response
    const responseSelector = '[data-message-author="1"], .model-response';

    try {
      await page.waitForSelector(responseSelector, { timeout: 60000 });

      // Wait for streaming to complete
      await page.waitForTimeout(3000);

      const responses = await page.locator(responseSelector).all();
      if (responses.length === 0) {
        throw new Error('No response found');
      }

      return await responses[responses.length - 1].textContent();

    } catch (error) {
      throw new Error(`Failed to extract response: ${error.message}`);
    }
  }

  private extractSnippet(text: string, domain: string): string {
    const lowerText = text.toLowerCase();
    const lowerDomain = domain.toLowerCase();
    const index = lowerText.indexOf(lowerDomain);

    if (index === -1) return null;

    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + domain.length + 100);
    let snippet = text.substring(start, end).trim();

    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';

    return snippet.length > 200 ? snippet.substring(0, 197) + '...' : snippet;
  }

  /**
   * Calculate confidence for mention-based detection
   */
  private calculateMentionConfidence(text: string, domain: string): number {
    let score = 0.5;  // Base score for mention
    const lowerText = text.toLowerCase();
    const lowerDomain = domain.toLowerCase();

    // Multiple mentions boost
    const regex = new RegExp(lowerDomain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const mentions = (lowerText.match(regex) || []).length;
    score += Math.min(mentions * 0.1, 0.3);

    // Recommendation context boost
    const contextTerms = ['recommend', 'suggest', 'best', 'top', 'try', 'check out'];
    const hasContext = contextTerms.some(term => {
      const termIndex = lowerText.indexOf(term);
      const domainIndex = lowerText.indexOf(lowerDomain);
      return termIndex !== -1 && Math.abs(termIndex - domainIndex) < 200;
    });

    if (hasContext) score += 0.2;

    return Math.min(score, 1.0);
  }

  private errorResult(keyword: string, code: string, reason: string, timestamp: string): CitationResult {
    return {
      keyword,
      platform: 'gemini',
      cited: false,
      context: null,
      rank: null,
      confidence: 0,
      timestamp,
      source: 'scraping',
      method: this.apiKey ? 'api' : 'scraping',
      error: code,
      reason
    };
  }

  private handleAPIError(error: Error, keyword: string, timestamp: string): CitationResult {
    if (error.message.includes('fetch')) {
      return this.errorResult(keyword, 'E525', 'Network error accessing Gemini API', timestamp);
    }
    return this.errorResult(keyword, 'E525', error.message || 'Gemini API detection failed', timestamp);
  }

  private handleScrapingError(error: Error, keyword: string, timestamp: string): CitationResult {
    if (error.name === 'TimeoutError') {
      return this.errorResult(keyword, 'E525', 'Gemini scraping timeout', timestamp);
    }
    return this.errorResult(keyword, 'E525', error.message || 'Gemini scraping failed', timestamp);
  }
}
```

## User Agent Rotation

```javascript
const DEFAULT_USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15'
];
```

## Rate Limiting

| Mode | Max Requests | Window | Min Delay |
|------|-------------|--------|-----------|
| API | 60/minute | 60s | 1s |
| Scraping | 20/hour | 3600s | 5s |

## Error Codes

| Code | Message | Recovery |
|------|---------|----------|
| E522 | Scraping rate limit exceeded | Wait for reset |
| E523 | Blocking detected | Check manually |
| E525 | Gemini detection failed | Retry later |
| E526 | API quota exceeded | Upgrade or wait |
| E529 | Authentication required | Refresh session or API key |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | No* | Google AI Studio API key |

*API key recommended but not required (scraping fallback available).

## groundingMetadata Structure

When using Google Search grounding, the API returns citation sources:

```json
{
  "candidates": [{
    "content": { "parts": [{ "text": "..." }] },
    "groundingMetadata": {
      "groundingChunks": [
        {
          "web": {
            "uri": "https://example.com/page",
            "title": "Page Title"
          }
        }
      ],
      "webSearchQueries": ["search query used"]
    }
  }]
}
```

This provides explicit citation sources with high confidence (0.95).

## Usage in /seo-validate-geo

```javascript
// Phase 3: Platform Detection
async function detectGeminiCitation(keyword: string, domain: string) {
  const detector = new GeminiDetector({
    apiKey: process.env.GEMINI_API_KEY,
    preferAPI: true
  });

  const result = await detector.detectCitation(keyword, domain);

  if (result.error) {
    console.warn(`Gemini detection failed: ${result.error} - ${result.reason}`);
  }

  return result;
}
```

## Compliance Notes

**API Access**: Using the Generative Language API is subject to Google's Terms of Service and usage policies.

**Scraping**: Web scraping gemini.google.com may violate Google's Terms of Service. Use for:
- Personal brand visibility checks
- Low-volume testing
- Fallback when API unavailable

Users are responsible for compliance with Google's Terms of Service.

## Integration Points

- **Command**: `/seo-validate-geo` Phase 3 (platform: 'gemini')
- **API Interface**: Implements `AISearchAPIClient` from `api-clients.md`
- **Error Codes**: `.claude/skills/error-handling/error-codes.md` (E522, E523, E525, E526, E529)
- **Rate Limiting**: Uses patterns from `rate-limiting.md`
- **Similar**: `chatgpt-scraper.md`, `claude-detection.md` (pattern precedents)
