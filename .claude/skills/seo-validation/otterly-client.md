# Otterly API Client

This document provides implementation patterns for the Otterly AI citation tracking API, used by the `/seo-validate-geo` command.

## Overview

Otterly provides AI search citation tracking with a tiered pricing model (free/pro). It tracks brand mentions across ChatGPT, Perplexity, Claude, and Gemini.

**API Base URL**: `https://api.otterly.ai/v1`

## Authentication

### API Key Format

Otterly API keys follow the pattern:
- Free tier: `ot_xxxxxxxxxxxxxxxx` (16 hex chars after prefix)
- Pro tier: `ot_pro_xxxxxxxxxxxx` (12 hex chars after prefix)

### Request Headers

```javascript
const headers = {
  'Authorization': `Bearer ${process.env.OTTERLY_API_KEY}`,
  'Content-Type': 'application/json',
  'X-Client-Version': '1.0.0',
  'X-Request-ID': crypto.randomUUID()
};
```

## Endpoints

### Check Citation

**Endpoint**: `POST /citations/check`

**Request**:
```json
{
  "keyword": "brand name",
  "platform": "chatgpt",
  "options": {
    "include_context": true,
    "max_results": 5
  }
}
```

**Response (Success)**:
```json
{
  "success": true,
  "data": {
    "keyword": "brand name",
    "platform": "chatgpt",
    "cited": true,
    "citations": [
      {
        "rank": 1,
        "context": "...mentioned brand name as a leading...",
        "confidence": 0.95,
        "timestamp": "2026-01-15T10:30:00Z"
      }
    ],
    "query_id": "q_abc123"
  },
  "meta": {
    "request_id": "req_xyz789",
    "processing_time_ms": 1250
  }
}
```

**Response (Not Found)**:
```json
{
  "success": true,
  "data": {
    "keyword": "brand name",
    "platform": "chatgpt",
    "cited": false,
    "citations": [],
    "query_id": "q_def456"
  }
}
```

### Get Rate Limit Status

**Endpoint**: `GET /account/usage`

**Response**:
```json
{
  "success": true,
  "data": {
    "tier": "free",
    "period": {
      "start": "2026-01-01T00:00:00Z",
      "end": "2026-01-31T23:59:59Z"
    },
    "usage": {
      "requests_used": 45,
      "requests_limit": 100,
      "requests_remaining": 55
    }
  }
}
```

## Client Implementation

### OtterlyClient Class

```javascript
class OtterlyClient {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.OTTERLY_API_KEY;
    this.baseUrl = options.baseUrl || 'https://api.otterly.ai/v1';
    this.tier = this.detectTier(this.apiKey);
    this.rateLimitCache = null;
    this.rateLimitCacheTime = null;
  }

  /**
   * Detect tier from API key format
   */
  detectTier(apiKey) {
    if (!apiKey) return 'free';
    return apiKey.startsWith('ot_pro_') ? 'pro' : 'free';
  }

  /**
   * Check if client is configured
   */
  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.startsWith('ot_'));
  }

  /**
   * Build request headers
   */
  buildHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'X-Client-Version': '1.0.0',
      'X-Request-ID': this.generateRequestId()
    };
  }

  /**
   * Generate unique request ID for tracing
   */
  generateRequestId() {
    return `req_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check citation on a platform
   * @param {string} keyword - Keyword to check
   * @param {string} platform - Platform: chatgpt, perplexity, claude, gemini
   * @returns {Promise<CitationResult>}
   */
  async checkCitation(keyword, platform) {
    const requestId = this.generateRequestId();
    const timestamp = new Date().toISOString();

    try {
      const response = await fetch(`${this.baseUrl}/citations/check`, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify({
          keyword,
          platform,
          options: {
            include_context: true,
            max_results: 5
          }
        }),
        signal: AbortSignal.timeout(30000) // 30s timeout
      });

      // Handle rate limit response (E522)
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || '60';
        return {
          keyword,
          platform,
          cited: false,
          confidence: 0,
          timestamp,
          source: 'otterly',
          error: 'E522',
          reason: `Rate limit exceeded. Retry after ${retryAfter}s`
        };
      }

      // Handle auth errors (E529)
      if (response.status === 401 || response.status === 403) {
        return {
          keyword,
          platform,
          cited: false,
          confidence: 0,
          timestamp,
          source: 'otterly',
          error: 'E529',
          reason: 'API authentication failed'
        };
      }

      // Handle server errors (E520 - GEO validation failed)
      if (response.status >= 500) {
        return {
          keyword,
          platform,
          cited: false,
          confidence: 0,
          timestamp,
          source: 'otterly',
          error: 'E520',
          reason: `Service unavailable (${response.status})`
        };
      }

      const data = await response.json();

      if (!data.success) {
        return {
          keyword,
          platform,
          cited: false,
          confidence: 0,
          timestamp,
          source: 'otterly',
          error: 'E520',
          reason: data.error?.message || 'Unknown API error'
        };
      }

      // Map Otterly response to CitationResult
      const citation = data.data.citations[0];
      return {
        keyword,
        platform,
        cited: data.data.cited,
        context: citation?.context,
        rank: citation?.rank,
        confidence: citation?.confidence || (data.data.cited ? 0.8 : 0),
        timestamp,
        source: 'otterly',
        method: 'api'
      };

    } catch (error) {
      // Handle timeout errors (E526)
      if (error.name === 'TimeoutError' || error.name === 'AbortError') {
        return {
          keyword,
          platform,
          cited: false,
          confidence: 0,
          timestamp,
          source: 'otterly',
          error: 'E526',
          reason: 'Request timeout (30s)'
        };
      }

      // Handle other network errors (E520 - GEO validation failed)
      return {
        keyword,
        platform,
        cited: false,
        confidence: 0,
        timestamp,
        source: 'otterly',
        error: 'E520',
        reason: error.message || 'Network error'
      };
    }
  }

  /**
   * Get current rate limit info
   * @returns {Promise<RateLimitInfo>}
   */
  async getRateLimit() {
    // Return cached value if recent (< 5 min)
    const cacheAge = Date.now() - (this.rateLimitCacheTime || 0);
    if (this.rateLimitCache && cacheAge < 300000) {
      return this.rateLimitCache;
    }

    try {
      const response = await fetch(`${this.baseUrl}/account/usage`, {
        method: 'GET',
        headers: this.buildHeaders(),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        // Return default based on tier
        return this.getDefaultRateLimit();
      }

      const data = await response.json();

      this.rateLimitCache = {
        tier: data.data.tier,
        limit: data.data.usage.requests_limit,
        remaining: data.data.usage.requests_remaining,
        resetAt: data.data.period.end,
        period: 'month'
      };
      this.rateLimitCacheTime = Date.now();

      return this.rateLimitCache;

    } catch (error) {
      return this.getDefaultRateLimit();
    }
  }

  /**
   * Get default rate limit based on tier
   */
  getDefaultRateLimit() {
    const limits = {
      free: { limit: 100, period: 'month' },
      pro: { limit: 1000, period: 'month' }
    };

    const tierLimits = limits[this.tier] || limits.free;

    return {
      tier: this.tier,
      limit: tierLimits.limit,
      remaining: -1, // Unknown
      resetAt: this.getEndOfMonth(),
      period: tierLimits.period
    };
  }

  /**
   * Get ISO string for end of current month
   */
  getEndOfMonth() {
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    return endOfMonth.toISOString();
  }

  /**
   * Get remaining quota
   * @returns {number} Remaining requests, -1 if unknown
   */
  getQuotaRemaining() {
    if (this.rateLimitCache) {
      return this.rateLimitCache.remaining;
    }
    return -1; // Unknown until first API call
  }
}
```

## Tier Comparison

| Feature | Free | Pro |
|---------|------|-----|
| Monthly requests | 100 | 1,000 |
| Platforms | All 4 | All 4 |
| Context snippets | Yes | Yes |
| Batch queries | No | Yes |
| Priority support | No | Yes |
| API key prefix | `ot_` | `ot_pro_` |

## Error Handling

### HTTP Status Code Mapping

| Status | Error Code | Handling |
|--------|------------|----------|
| 401 | E529 | Invalid API key |
| 403 | E529 | API key expired or revoked |
| 429 | E522 | Rate limit exceeded |
| 500+ | E520 | Service unavailable |
| Timeout | E526 | Request timeout |

### Retry Strategy

```javascript
const OTTERLY_RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  retryableStatuses: [429, 500, 502, 503, 504],
  retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND']
};

async function withRetry(fn, config = OTTERLY_RETRY_CONFIG) {
  let lastError;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      const isRetryable =
        config.retryableStatuses.includes(error.status) ||
        config.retryableErrors.includes(error.code);

      if (!isRetryable || attempt === config.maxRetries) {
        throw error;
      }

      const delay = Math.min(
        config.initialDelayMs * Math.pow(2, attempt),
        config.maxDelayMs
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
```

## Usage Example

```javascript
// In /seo-validate-geo command
import { OtterlyClient } from './otterly-client';

async function checkOtterlyCitation(keyword, platform) {
  const client = new OtterlyClient();

  if (!client.isConfigured()) {
    return { error: 'E529', reason: 'Otterly API not configured' };
  }

  // Check quota before making request
  const rateLimit = await client.getRateLimit();
  if (rateLimit.remaining === 0) {
    return {
      error: 'E522',
      reason: `Quota exceeded. Resets ${rateLimit.resetAt}`
    };
  }

  return await client.checkCitation(keyword, platform);
}
```

## Environment Configuration

```bash
# .env file
OTTERLY_API_KEY=ot_xxxxxxxxxxxxxxxx

# Or for pro tier
OTTERLY_API_KEY=ot_pro_xxxxxxxxxxxx
```

## Related Resources

- `api-clients.md` - Unified interface and factory pattern
- `rate-limiting.md` - Advanced rate limiting patterns
- `profound-client.md` - Alternative API client
- `mock-mode.md` - Testing without API keys
