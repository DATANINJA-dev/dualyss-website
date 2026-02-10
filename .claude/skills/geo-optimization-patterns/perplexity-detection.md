# Perplexity Detection Logic

Hybrid detection implementation combining Perplexity API + Playwright scraping for Perplexity citation detection. Part of TASK-139.

## Architecture Overview

```
detectCitationPerplexity(keyword)
    │
    ├── [1] Check Cache (24h TTL)
    │       └── Cache hit? → Return cached result
    │
    ├── [2] Call Perplexity API (primary)
    │       └── Uses return_citations: true parameter
    │       └── Returns: cited, sources[], rank, confidence
    │
    ├── [3] Validation Trigger?
    │       ├── API failed (E520, E522, E526, E529)? → Scrape
    │       ├── Confidence < 0.7? → Scrape
    │       └── Random 10% sample? → Scrape
    │
    ├── [4] Playwright Scraper (validation)
    │       └── Extracts numbered citations [1][2][3]
    │       └── Stealth mode + rate limiting (50 req/sec)
    │
    ├── [5] Reconcile Results
    │       └── Merge API + scraping with confidence adjustment
    │
    └── [6] Cache Result
            └── Store with 24h TTL
```

## Perplexity-Specific Characteristics

Unlike ChatGPT, Perplexity provides **explicit numbered citations**:

| Feature | ChatGPT | Perplexity |
|---------|---------|------------|
| Citation Format | Embedded links | Numbered [1][2][3] |
| Source Visibility | Sometimes hidden | Always visible |
| Citation Rank | Implicit | Explicit (1-N) |
| API Parameter | N/A | `return_citations: true` |
| Rate Limit | Monthly quota | 50 req/sec burst |

## Hybrid Detection Logic

### Main Entry Point

```javascript
/**
 * Detect Perplexity citation using hybrid API + scraping approach
 * @param {string} keyword - Keyword to check for citation
 * @param {Object} options - Detection options
 * @returns {Promise<CitationResult>}
 */
async function detectCitationPerplexity(keyword, options = {}) {
  const {
    forceApi = false,       // Skip scraping validation
    forceScraping = false,  // Skip API, use scraping only
    skipCache = false,      // Bypass cache check
    sampleRate = 0.1        // 10% validation sampling
  } = options;

  const timestamp = new Date().toISOString();

  // Phase 1: Check cache (unless bypassed)
  if (!skipCache) {
    const cached = await getCachedResult(keyword, 'perplexity');
    if (cached) {
      return { ...cached, from_cache: true };
    }
  }

  let apiResult = null;
  let scrapingResult = null;

  // Phase 2: API-based check (unless scraping-only mode)
  if (!forceScraping) {
    const client = new PerplexityClient();

    if (client.isConfigured()) {
      apiResult = await client.checkCitation(keyword, {
        return_citations: true  // Perplexity-specific parameter
      });
    } else {
      // No API configured - fall back to scraping
      apiResult = {
        platform: 'perplexity',
        cited: false,
        error: 'E529',
        reason: 'api_not_configured',
        timestamp
      };
    }
  }

  // Phase 3: Determine if scraping validation needed
  const needsScraping = determineScrapingNeed(apiResult, {
    forceApi,
    forceScraping,
    sampleRate
  });

  // Phase 4: Scraping validation (if needed)
  if (needsScraping) {
    const scraper = new PerplexityScraper();
    scrapingResult = await scraper.checkCitation(keyword);
  }

  // Phase 5: Reconcile results
  const finalResult = reconcileResults(apiResult, scrapingResult);

  // Phase 6: Cache result
  await cacheResult(keyword, 'perplexity', finalResult);

  return finalResult;
}

/**
 * Determine if scraping validation is needed
 */
function determineScrapingNeed(apiResult, options) {
  const { forceApi, forceScraping, sampleRate } = options;

  // Force modes override normal logic
  if (forceApi) return false;
  if (forceScraping) return true;

  // No API result - must scrape
  if (!apiResult) return true;

  // API failed - try scraping as fallback
  if (apiResult.error) return true;

  // Low confidence - validate with scraping
  if (apiResult.confidence < 0.7) return true;

  // Random sampling for validation (default 10%)
  if (Math.random() < sampleRate) return true;

  return false;
}
```

## Perplexity API Client

### Configuration

```javascript
const PERPLEXITY_API_CONFIG = {
  baseUrl: 'https://api.perplexity.ai',
  timeout: 10000,           // 10 second timeout
  maxRetries: 2,
  rateLimit: {
    requestsPerSecond: 50,  // Perplexity burst limit
    backoffMs: 1000,        // Wait after 429
    maxBackoffMs: 30000     // Max wait time
  }
};

/**
 * Perplexity API Client for citation detection
 */
class PerplexityClient {
  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY;
  }

  isConfigured() {
    return !!this.apiKey;
  }

  /**
   * Check if keyword's target domain is cited in Perplexity response
   */
  async checkCitation(keyword, options = {}) {
    const { return_citations = true, targetDomain } = options;

    if (!this.isConfigured()) {
      return {
        platform: 'perplexity',
        cited: false,
        error: 'E529',
        reason: 'api_key_missing',
        timestamp: new Date().toISOString()
      };
    }

    try {
      const response = await this.query(keyword, { return_citations });
      return this.parseResponse(response, targetDomain);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Query Perplexity API with citation parameter
   */
  async query(keyword, options) {
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };

    const body = {
      model: 'sonar',  // Perplexity's search model
      messages: [
        { role: 'user', content: keyword }
      ],
      return_citations: options.return_citations
    };

    const response = await fetch(`${PERPLEXITY_API_CONFIG.baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      timeout: PERPLEXITY_API_CONFIG.timeout
    });

    if (!response.ok) {
      throw new PerplexityAPIError(response.status, await response.text());
    }

    return response.json();
  }

  /**
   * Parse Perplexity API response into CitationResult
   */
  parseResponse(response, targetDomain) {
    const timestamp = new Date().toISOString();

    // Extract citations from response
    const citations = response.citations || [];

    // Find target domain in citations
    const matchingSources = citations
      .map((citation, index) => ({
        url: citation.url,
        title: citation.title || '',
        rank: index + 1,  // 1-indexed rank
        context: citation.snippet || ''
      }))
      .filter(source =>
        targetDomain ? source.url.includes(targetDomain) : true
      );

    const cited = matchingSources.length > 0;
    const primarySource = matchingSources[0] || null;

    return {
      platform: 'perplexity',
      cited,
      context_snippet: primarySource?.context || null,
      rank: primarySource?.rank || null,
      confidence: cited ? 0.85 : 0.80,  // API confidence levels
      method: 'api',
      validated: false,
      error: null,
      reason: cited ? null : 'not_mentioned',
      timestamp,
      from_cache: false,
      sources: matchingSources,
      total_sources: citations.length
    };
  }

  /**
   * Handle API errors with appropriate error codes
   */
  handleError(error) {
    const timestamp = new Date().toISOString();

    // Rate limit exceeded
    if (error.status === 429) {
      return {
        platform: 'perplexity',
        cited: false,
        error: 'E522',
        reason: 'rate_limit_exceeded',
        timestamp,
        retryAfter: error.headers?.['retry-after'] || 60
      };
    }

    // Authentication failed
    if (error.status === 401 || error.status === 403) {
      return {
        platform: 'perplexity',
        cited: false,
        error: 'E529',
        reason: 'authentication_failed',
        timestamp
      };
    }

    // Server error
    if (error.status >= 500) {
      return {
        platform: 'perplexity',
        cited: false,
        error: 'E520',
        reason: 'service_unavailable',
        timestamp
      };
    }

    // Network timeout
    if (error.name === 'TimeoutError' || error.code === 'ETIMEDOUT') {
      return {
        platform: 'perplexity',
        cited: false,
        error: 'E526',
        reason: 'network_timeout',
        timestamp
      };
    }

    // Generic error
    return {
      platform: 'perplexity',
      cited: false,
      error: 'E520',
      reason: error.message || 'unknown_error',
      timestamp
    };
  }
}
```

## Scraping Fallback

### Perplexity Page Structure

Perplexity displays numbered citations in a consistent format:

```html
<!-- Citation in answer text -->
<span class="citation">[1]</span>
<span class="citation">[2]</span>

<!-- Source list at bottom -->
<div class="source-list">
  <div class="source-item" data-index="1">
    <a href="https://example.com/article">Article Title</a>
    <span class="source-snippet">Context snippet...</span>
  </div>
</div>
```

### Scraper Implementation

```javascript
/**
 * Perplexity web scraper for citation detection fallback
 */
class PerplexityScraper {
  constructor() {
    this.baseUrl = 'https://www.perplexity.ai';
    this.userAgent = 'Mozilla/5.0 (compatible; GEO-Validator/1.0)';
  }

  /**
   * Check citation via web scraping
   */
  async checkCitation(keyword, targetDomain) {
    const timestamp = new Date().toISOString();

    try {
      // Check rate limit before scraping
      const rateLimit = await checkRateLimit('scraping');
      if (!rateLimit.allowed) {
        return {
          platform: 'perplexity',
          cited: false,
          error: 'E522',
          reason: 'scraping_rate_limit',
          timestamp
        };
      }

      const browser = await playwright.chromium.launch({
        headless: true,
        args: ['--no-sandbox']
      });

      const context = await browser.newContext({
        userAgent: this.userAgent
      });

      const page = await context.newPage();

      // Navigate to Perplexity search
      const searchUrl = `${this.baseUrl}/search?q=${encodeURIComponent(keyword)}`;
      await page.goto(searchUrl, {
        waitUntil: 'networkidle',
        timeout: 15000
      });

      // Wait for citations to load
      await page.waitForSelector('.source-list', { timeout: 10000 })
        .catch(() => null);  // Graceful if no citations

      // Extract citations
      const sources = await this.extractSources(page);

      await browser.close();

      // Find matching domain
      const matchingSources = sources.filter(source =>
        targetDomain ? source.url.includes(targetDomain) : true
      );

      const cited = matchingSources.length > 0;
      const primarySource = matchingSources[0] || null;

      // Increment rate limit counter
      await incrementRateLimit('scraping');

      return {
        platform: 'perplexity',
        cited,
        context_snippet: primarySource?.context || null,
        rank: primarySource?.rank || null,
        confidence: cited ? 0.75 : 0.70,  // Scraping confidence (lower than API)
        method: 'scraping',
        validated: true,
        error: null,
        reason: cited ? null : 'not_mentioned',
        timestamp,
        from_cache: false,
        sources: matchingSources,
        total_sources: sources.length
      };

    } catch (error) {
      return this.handleScrapingError(error);
    }
  }

  /**
   * Extract sources from Perplexity page
   */
  async extractSources(page) {
    return page.evaluate(() => {
      const sources = [];

      // Primary selector: source list items
      const sourceItems = document.querySelectorAll('.source-item, [data-testid="source-item"]');

      sourceItems.forEach((item, index) => {
        const link = item.querySelector('a');
        const snippet = item.querySelector('.source-snippet, .snippet');

        if (link?.href) {
          sources.push({
            url: link.href,
            title: link.textContent?.trim() || '',
            rank: index + 1,
            context: snippet?.textContent?.trim() || ''
          });
        }
      });

      // Fallback: find numbered citation references
      if (sources.length === 0) {
        const citations = document.querySelectorAll('[class*="citation"], .ref-link');
        citations.forEach((citation, index) => {
          const href = citation.getAttribute('href') || citation.dataset?.url;
          if (href) {
            sources.push({
              url: href,
              title: citation.textContent?.trim() || '',
              rank: index + 1,
              context: ''
            });
          }
        });
      }

      return sources;
    });
  }

  /**
   * Handle scraping errors
   */
  handleScrapingError(error) {
    const timestamp = new Date().toISOString();

    // Timeout
    if (error.name === 'TimeoutError') {
      return {
        platform: 'perplexity',
        cited: false,
        error: 'E526',
        reason: 'scraping_timeout',
        timestamp
      };
    }

    // Navigation failed (blocked, CAPTCHA, etc.)
    if (error.message?.includes('net::ERR') || error.message?.includes('Navigation')) {
      return {
        platform: 'perplexity',
        cited: false,
        error: 'E523',
        reason: 'scraping_blocked',
        timestamp
      };
    }

    return {
      platform: 'perplexity',
      cited: false,
      error: 'E520',
      reason: error.message || 'scraping_failed',
      timestamp
    };
  }
}
```

## Result Reconciliation

### Reconciliation Logic

```javascript
/**
 * Reconcile API and scraping results for Perplexity
 * @param {CitationResult|null} apiResult - Result from Perplexity API
 * @param {CitationResult|null} scrapingResult - Result from Playwright scraper
 * @returns {CitationResult} - Merged result with adjusted confidence
 */
function reconcileResults(apiResult, scrapingResult) {
  const timestamp = new Date().toISOString();

  // Case 1: Only scraping result (API unavailable or failed)
  if (!apiResult || apiResult.error) {
    if (scrapingResult && !scrapingResult.error) {
      return {
        ...scrapingResult,
        method: 'scraping',
        validated: true,
        note: 'API unavailable, used scraping only',
        timestamp
      };
    }

    // Both failed - return error
    return {
      platform: 'perplexity',
      cited: false,
      context_snippet: null,
      rank: null,
      confidence: 0,
      method: 'scraping',
      validated: false,
      error: scrapingResult?.error || apiResult?.error || 'E520',
      reason: scrapingResult?.reason || apiResult?.reason || 'detection_failed',
      timestamp,
      from_cache: false
    };
  }

  // Case 2: Only API result (scraping not needed or failed)
  if (!scrapingResult || scrapingResult.error) {
    return {
      ...apiResult,
      method: 'api',
      validated: false,
      note: scrapingResult?.error ? 'Scraping validation failed' : 'Scraping not needed',
      timestamp
    };
  }

  // Case 3: Both results available - reconcile
  return reconcileBothResults(apiResult, scrapingResult);
}

/**
 * Reconcile when both API and scraping results are available
 */
function reconcileBothResults(apiResult, scrapingResult) {
  const timestamp = new Date().toISOString();

  // Agreement: Both say cited or both say not cited
  if (apiResult.cited === scrapingResult.cited) {
    // Boost confidence when both methods agree
    const avgConfidence = (apiResult.confidence + scrapingResult.confidence) / 2;
    const boostedConfidence = Math.min(1.0, avgConfidence + 0.1);

    return {
      platform: 'perplexity',
      cited: apiResult.cited,
      context_snippet: apiResult.context_snippet || scrapingResult.context_snippet,
      rank: apiResult.rank || scrapingResult.rank,  // API provides reliable rank
      confidence: boostedConfidence,
      method: 'hybrid',
      validated: true,
      error: null,
      reason: apiResult.cited ? null : 'not_mentioned',
      note: 'API and scraping agree',
      sources: apiResult.sources || scrapingResult.sources,
      total_sources: apiResult.total_sources || scrapingResult.total_sources,
      timestamp,
      from_cache: false
    };
  }

  // Disagreement: Results conflict
  // Prefer scraping result (real interface) but lower confidence
  const adjustedConfidence = Math.max(0.3, apiResult.confidence - 0.2);

  return {
    platform: 'perplexity',
    cited: scrapingResult.cited,  // Trust real interface
    context_snippet: scrapingResult.context_snippet,
    rank: scrapingResult.rank,  // Use scraping rank when results differ
    confidence: adjustedConfidence,
    method: 'hybrid',
    validated: true,
    error: null,
    reason: scrapingResult.cited ? null : 'not_mentioned',
    note: 'API/scraping disagreement, preferred scraping result',
    sources: scrapingResult.sources,
    total_sources: scrapingResult.total_sources,
    timestamp,
    from_cache: false
  };
}
```

### Reconciliation Decision Matrix

| API Result | Scraping Result | Final Result | Confidence Adjustment |
|------------|-----------------|--------------|----------------------|
| Cited | Cited | Cited | +0.1 (agreement boost) |
| Not Cited | Not Cited | Not Cited | +0.1 (agreement boost) |
| Cited | Not Cited | Not Cited | -0.2 (prefer scraping) |
| Not Cited | Cited | Cited | -0.2 (prefer scraping) |
| Error | Cited | Cited | Scraping confidence |
| Error | Not Cited | Not Cited | Scraping confidence |
| Cited | Error | Cited | API confidence (unvalidated) |
| Error | Error | Error | 0.0 |

## Rate Limiting

### Perplexity Rate Limit Configuration

```javascript
const PERPLEXITY_RATE_LIMITS = {
  api: {
    requestsPerSecond: 50,    // Perplexity API burst limit
    burstWindow: 1000,        // 1 second window
    backoffBase: 1000,        // Initial backoff: 1s
    backoffMax: 30000,        // Max backoff: 30s
    backoffMultiplier: 2      // Exponential backoff
  },
  scraping: {
    requestsPerDay: 50,       // Conservative daily limit
    minInterval: 2000,        // 2s between requests
    cooldownAfterBlock: 300000  // 5 min cooldown if blocked
  }
};

/**
 * Rate limiter for Perplexity API requests
 */
class PerplexityRateLimiter {
  constructor() {
    this.requestTimestamps = [];
    this.backoffUntil = 0;
  }

  /**
   * Check if request is allowed
   */
  async canRequest() {
    const now = Date.now();

    // Check backoff
    if (now < this.backoffUntil) {
      return {
        allowed: false,
        waitMs: this.backoffUntil - now,
        reason: 'backoff_active'
      };
    }

    // Clean old timestamps (outside 1s window)
    this.requestTimestamps = this.requestTimestamps.filter(
      ts => now - ts < PERPLEXITY_RATE_LIMITS.api.burstWindow
    );

    // Check burst limit
    if (this.requestTimestamps.length >= PERPLEXITY_RATE_LIMITS.api.requestsPerSecond) {
      return {
        allowed: false,
        waitMs: PERPLEXITY_RATE_LIMITS.api.burstWindow,
        reason: 'burst_limit'
      };
    }

    return { allowed: true };
  }

  /**
   * Record a request
   */
  recordRequest() {
    this.requestTimestamps.push(Date.now());
  }

  /**
   * Trigger backoff after rate limit error
   */
  triggerBackoff(retryAfter = null) {
    const backoffMs = retryAfter
      ? retryAfter * 1000
      : this.calculateBackoff();

    this.backoffUntil = Date.now() + backoffMs;
    return backoffMs;
  }

  /**
   * Calculate exponential backoff
   */
  calculateBackoff() {
    const { backoffBase, backoffMax, backoffMultiplier } = PERPLEXITY_RATE_LIMITS.api;
    const attempts = this.consecutiveErrors || 1;

    const backoff = Math.min(
      backoffBase * Math.pow(backoffMultiplier, attempts - 1),
      backoffMax
    );

    return backoff;
  }
}
```

## Usage Example

```javascript
// In /seo-validate-geo Phase 3
async function detect_citation(keyword, platform, targetDomain) {
  if (platform !== 'perplexity') {
    // Other platforms (see chatgpt-detection.md, etc.)
    return detectOtherPlatform(keyword, platform);
  }

  // Check rate limits before proceeding
  const rateLimiter = new PerplexityRateLimiter();
  const rateCheck = await rateLimiter.canRequest();

  if (!rateCheck.allowed) {
    console.log(`[INFO] Rate limited. Waiting ${rateCheck.waitMs}ms...`);
    await sleep(rateCheck.waitMs);
  }

  // Run hybrid detection
  const result = await detectCitationPerplexity(keyword, {
    sampleRate: 0.1,     // 10% validation sampling
    skipCache: false,
    targetDomain
  });

  // Record request for rate limiting
  rateLimiter.recordRequest();

  // Handle rate limit errors
  if (result.error === 'E522') {
    rateLimiter.triggerBackoff(result.retryAfter);
  }

  return result;
}
```

## Integration Points

- **Schema**: `../seo-validation/citation-schema.md` - CitationResult interface
- **Rate Limiting**: `../seo-validation/rate-limiting.md` - RateLimitTracker patterns
- **Cache**: Uses shared `.geo-cache/` directory with ChatGPT
- **Command**: `/seo-validate-geo` Phase 3 (Citation Detection)
- **Error Codes**: E520, E522, E523, E526, E529

## Test Scenarios

| Scenario | Expected Behavior |
|----------|-------------------|
| Cache hit | Return cached result, `from_cache: true` |
| API success, high confidence | Return API result, skip scraping |
| API success, low confidence | Validate with scraping, reconcile |
| API rate limited (429) | Fallback to scraping, trigger backoff |
| API timeout | Fallback to scraping |
| Scraping blocked | Return API result unvalidated |
| Both agree (cited) | Confidence +0.1, `method: hybrid` |
| Disagreement | Prefer scraping, confidence -0.2 |
| Both fail | Return error result |

## Error Codes

| Code | Meaning | Recovery |
|------|---------|----------|
| E520 | Service unavailable (5xx) | Retry with backoff |
| E522 | Rate limit exceeded (429) | Wait for retry-after |
| E523 | Scraping blocked | Use API-only mode |
| E526 | Network timeout | Retry once |
| E529 | Authentication failed | Check API key |
