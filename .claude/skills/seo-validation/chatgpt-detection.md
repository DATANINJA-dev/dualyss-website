# ChatGPT Detection Logic

Hybrid detection implementation combining Otterly API + Playwright scraping for ChatGPT citation detection. Part of TASK-136.

## Architecture Overview

```
detectCitationChatGPT(keyword)
    │
    ├── [1] Check Cache (24h TTL)
    │       └── Cache hit? → Return cached result
    │
    ├── [2] Call Otterly API (primary)
    │       └── Returns: cited, rank, confidence, snippet
    │
    ├── [3] Validation Trigger?
    │       ├── API failed (E520, E522, E526, E529)? → Scrape
    │       ├── Confidence < 0.7? → Scrape
    │       └── Random 10% sample? → Scrape
    │
    ├── [4] Playwright Scraper (validation)
    │       └── Stealth mode + rate limiting
    │
    ├── [5] Reconcile Results
    │       └── Merge API + scraping with confidence adjustment
    │
    └── [6] Cache Result
            └── Store with 24h TTL
```

## Hybrid Detection Logic

### Main Entry Point

```javascript
/**
 * Detect ChatGPT citation using hybrid API + scraping approach
 * @param {string} keyword - Keyword to check for citation
 * @param {Object} options - Detection options
 * @returns {Promise<CitationResult>}
 */
async function detectCitationChatGPT(keyword, options = {}) {
  const {
    forceApi = false,       // Skip scraping validation
    forceScraping = false,  // Skip API, use scraping only
    skipCache = false,      // Bypass cache check
    sampleRate = 0.1        // 10% validation sampling
  } = options;

  const timestamp = new Date().toISOString();

  // Phase 1: Check cache (unless bypassed)
  if (!skipCache) {
    const cached = await getCachedResult(keyword, 'chatgpt');
    if (cached) {
      return { ...cached, from_cache: true };
    }
  }

  let apiResult = null;
  let scrapingResult = null;

  // Phase 2: API-based check (unless scraping-only mode)
  if (!forceScraping) {
    const client = new OtterlyClient();

    if (client.isConfigured()) {
      apiResult = await client.checkCitation(keyword, 'chatgpt');
    } else {
      // No API configured - fall back to scraping
      apiResult = {
        platform: 'chatgpt',
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
    const scraper = new ChatGPTScraper();
    scrapingResult = await scraper.checkCitation(keyword);
  }

  // Phase 5: Reconcile results
  const finalResult = reconcileResults(apiResult, scrapingResult);

  // Phase 6: Cache result
  await cacheResult(keyword, 'chatgpt', finalResult);

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

## Result Reconciliation

### Reconciliation Logic

```javascript
/**
 * Reconcile API and scraping results
 * @param {CitationResult|null} apiResult - Result from Otterly API
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
      platform: 'chatgpt',
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
      platform: 'chatgpt',
      cited: apiResult.cited,
      context_snippet: apiResult.context_snippet || scrapingResult.context_snippet,
      rank: apiResult.rank,  // API provides more reliable rank
      confidence: boostedConfidence,
      method: 'hybrid',
      validated: true,
      error: null,
      reason: apiResult.cited ? null : 'not_mentioned',
      note: 'API and scraping agree',
      timestamp,
      from_cache: false
    };
  }

  // Disagreement: Results conflict
  // Prefer scraping result (real interface) but lower confidence
  const adjustedConfidence = Math.max(0.3, apiResult.confidence - 0.2);

  return {
    platform: 'chatgpt',
    cited: scrapingResult.cited,  // Trust real interface
    context_snippet: scrapingResult.context_snippet,
    rank: null,  // Can't trust API rank when results differ
    confidence: adjustedConfidence,
    method: 'hybrid',
    validated: true,
    error: null,
    reason: scrapingResult.cited ? null : 'not_mentioned',
    note: 'API/scraping disagreement, preferred scraping result',
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

## Cache Layer

### Cache Configuration

```javascript
const CACHE_CONFIG = {
  directory: '.geo-cache',
  ttl: 86400000,            // 24 hours in milliseconds
  maxEntries: 10000,        // Max cached results
  compressionThreshold: 500 // Compress entries > 500 bytes
};
```

### Cache Implementation

```javascript
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

/**
 * Generate cache key from keyword and platform
 */
function getCacheKey(keyword, platform) {
  const normalized = keyword.toLowerCase().trim().replace(/\s+/g, '_');
  const hash = crypto.createHash('md5').update(normalized).digest('hex').slice(0, 8);
  return `${platform}_${hash}_${normalized.slice(0, 50)}`;
}

/**
 * Get cached result if valid
 */
async function getCachedResult(keyword, platform) {
  const key = getCacheKey(keyword, platform);
  const cachePath = path.join(CACHE_CONFIG.directory, `${key}.json`);

  try {
    const data = await fs.readFile(cachePath, 'utf-8');
    const cached = JSON.parse(data);

    // Check TTL
    const age = Date.now() - cached.cached_at;
    if (age < CACHE_CONFIG.ttl) {
      return cached.result;
    }

    // Expired - delete and return null
    await fs.unlink(cachePath).catch(() => {});
    return null;

  } catch (error) {
    // File not found or parse error
    return null;
  }
}

/**
 * Store result in cache
 */
async function cacheResult(keyword, platform, result) {
  const key = getCacheKey(keyword, platform);
  const cachePath = path.join(CACHE_CONFIG.directory, `${key}.json`);

  const cacheEntry = {
    keyword,
    platform,
    result: { ...result, from_cache: false },
    cached_at: Date.now(),
    expires_at: Date.now() + CACHE_CONFIG.ttl
  };

  try {
    await fs.mkdir(CACHE_CONFIG.directory, { recursive: true });
    await fs.writeFile(cachePath, JSON.stringify(cacheEntry), {
      encoding: 'utf-8',
      mode: 0o600  // Restrict permissions
    });
  } catch (error) {
    // Cache write failure is non-fatal
    console.warn(`Cache write failed: ${error.message}`);
  }
}

/**
 * Clear expired cache entries
 */
async function pruneCache() {
  try {
    const files = await fs.readdir(CACHE_CONFIG.directory);
    const now = Date.now();

    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      const filePath = path.join(CACHE_CONFIG.directory, file);
      try {
        const data = await fs.readFile(filePath, 'utf-8');
        const cached = JSON.parse(data);

        if (now > cached.expires_at) {
          await fs.unlink(filePath);
        }
      } catch {
        // Delete corrupted cache files
        await fs.unlink(filePath).catch(() => {});
      }
    }
  } catch (error) {
    // Cache directory doesn't exist or not accessible
  }
}
```

## Rate Limiting

### Monthly Quota Tracking

```javascript
const RATE_LIMIT_CONFIG = {
  file: '.geo-cache/rate_limit.json',
  otterlyFreeLimit: 1000,      // Otterly free tier: 1K/month
  otterlyProLimit: 10000,      // Otterly pro tier: 10K/month
  scrapingDailyLimit: 50,      // Conservative scraping limit
  warningThreshold: 0.8,       // Warn at 80% usage
  criticalThreshold: 0.95      // Critical at 95% usage
};

/**
 * Rate limit state structure
 */
interface RateLimitState {
  month: string;               // YYYY-MM format
  api_calls: number;           // Otterly API calls this month
  scraping_calls: number;      // Scraping calls today
  scraping_date: string;       // YYYY-MM-DD for daily reset
  last_updated: string;        // ISO timestamp
}

/**
 * Load current rate limit state
 */
async function getRateLimitState() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentDate = new Date().toISOString().slice(0, 10);

  try {
    const data = await fs.readFile(RATE_LIMIT_CONFIG.file, 'utf-8');
    const state = JSON.parse(data);

    // Reset counters if new month
    if (state.month !== currentMonth) {
      return {
        month: currentMonth,
        api_calls: 0,
        scraping_calls: 0,
        scraping_date: currentDate,
        last_updated: new Date().toISOString()
      };
    }

    // Reset daily scraping counter
    if (state.scraping_date !== currentDate) {
      state.scraping_calls = 0;
      state.scraping_date = currentDate;
    }

    return state;

  } catch {
    return {
      month: currentMonth,
      api_calls: 0,
      scraping_calls: 0,
      scraping_date: currentDate,
      last_updated: new Date().toISOString()
    };
  }
}

/**
 * Increment rate limit counter
 */
async function incrementRateLimit(type) {
  const state = await getRateLimitState();

  if (type === 'api') {
    state.api_calls += 1;
  } else if (type === 'scraping') {
    state.scraping_calls += 1;
  }

  state.last_updated = new Date().toISOString();

  await fs.mkdir(path.dirname(RATE_LIMIT_CONFIG.file), { recursive: true });
  await fs.writeFile(RATE_LIMIT_CONFIG.file, JSON.stringify(state, null, 2));

  return state;
}

/**
 * Check if rate limit allows request
 */
async function checkRateLimit(type, tier = 'free') {
  const state = await getRateLimitState();

  if (type === 'api') {
    const limit = tier === 'pro'
      ? RATE_LIMIT_CONFIG.otterlyProLimit
      : RATE_LIMIT_CONFIG.otterlyFreeLimit;

    const remaining = limit - state.api_calls;
    const percentUsed = state.api_calls / limit;

    return {
      allowed: remaining > 0,
      remaining,
      limit,
      percentUsed,
      warning: percentUsed >= RATE_LIMIT_CONFIG.warningThreshold,
      critical: percentUsed >= RATE_LIMIT_CONFIG.criticalThreshold,
      resetsAt: getEndOfMonth()
    };
  }

  if (type === 'scraping') {
    const limit = RATE_LIMIT_CONFIG.scrapingDailyLimit;
    const remaining = limit - state.scraping_calls;

    return {
      allowed: remaining > 0,
      remaining,
      limit,
      percentUsed: state.scraping_calls / limit,
      warning: remaining <= 10,
      critical: remaining <= 5,
      resetsAt: getEndOfDay()
    };
  }

  return { allowed: false, error: 'Unknown rate limit type' };
}

/**
 * Get rate limit warning message
 */
function getRateLimitWarning(rateLimitInfo) {
  if (!rateLimitInfo.warning) return null;

  const { remaining, limit, percentUsed, resetsAt } = rateLimitInfo;

  if (rateLimitInfo.critical) {
    return `[WARNING] CRITICAL: Only ${remaining}/${limit} requests remaining (${(percentUsed * 100).toFixed(0)}% used). Resets: ${resetsAt}`;
  }

  return `[INFO] Rate limit: ${remaining}/${limit} requests remaining (${(percentUsed * 100).toFixed(0)}% used)`;
}

function getEndOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
}

function getEndOfDay() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();
}
```

## Usage Example

```javascript
// In /seo-validate-geo Phase 3
async function detect_citation(keyword, platform) {
  if (platform !== 'chatgpt') {
    // Other platforms remain stubs for now (TASK-139, TASK-140)
    return {
      platform,
      cited: false,
      reason: 'stub_not_implemented',
      method: 'stub',
      error: null
    };
  }

  // Check rate limits before proceeding
  const apiRateLimit = await checkRateLimit('api');
  if (apiRateLimit.warning) {
    console.log(getRateLimitWarning(apiRateLimit));
  }

  // Run hybrid detection
  const result = await detectCitationChatGPT(keyword, {
    sampleRate: 0.1,  // 10% validation sampling
    skipCache: false
  });

  // Increment rate limit counters
  if (result.method === 'api' || result.method === 'hybrid') {
    await incrementRateLimit('api');
  }
  if (result.method === 'scraping' || result.method === 'hybrid') {
    await incrementRateLimit('scraping');
  }

  return result;
}
```

## Integration Points

- **Schema**: `citation-schema.md` - CitationResult interface
- **API Client**: `otterly-client.md` - OtterlyClient class
- **Scraper**: `chatgpt-scraper.md` - ChatGPTScraper class
- **Command**: `/seo-validate-geo` Phase 3 (Citation Detection)
- **Error Codes**: E520, E522, E523, E526, E529

## Test Scenarios

| Scenario | Expected Behavior |
|----------|-------------------|
| Cache hit | Return cached result, `from_cache: true` |
| API success, high confidence | Return API result, skip scraping |
| API success, low confidence | Validate with scraping, reconcile |
| API rate limited | Fallback to scraping |
| API timeout | Fallback to scraping |
| Scraping blocked | Return API result unvalidated |
| Both agree (cited) | Confidence +0.1, `method: hybrid` |
| Disagreement | Prefer scraping, confidence -0.2 |
| Both fail | Return error result |
