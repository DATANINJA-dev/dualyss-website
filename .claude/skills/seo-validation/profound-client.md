# Profound API Client

This document provides implementation patterns for the Profound AI citation tracking API, a premium alternative to Otterly with advanced features.

## Overview

Profound offers enterprise-grade AI search citation tracking with higher rate limits, historical data, and competitive analysis features. It tracks brand mentions across ChatGPT, Perplexity, Claude, Gemini, and additional AI platforms.

**API Base URL**: `https://api.profound.ai/v2`

## Authentication

### API Key Format

Profound API keys follow the pattern:
- Standard: `pf_xxxxxxxxxxxxxxxxxxxx` (20 chars after prefix)
- Enterprise: `pf_ent_xxxxxxxxxxxxxxxx` (16 chars after prefix)

### Request Headers

```javascript
const headers = {
  'X-API-Key': process.env.PROFOUND_API_KEY,
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-Client-ID': 'simon-tools',
  'X-Request-ID': crypto.randomUUID()
};
```

**Note**: Profound uses `X-API-Key` header instead of Bearer token.

## Endpoints

### Check Citation

**Endpoint**: `POST /v2/citations/search`

**Request**:
```json
{
  "query": "brand name",
  "engines": ["chatgpt", "perplexity", "claude", "gemini"],
  "settings": {
    "depth": "standard",
    "include_snippets": true,
    "include_sentiment": true,
    "max_age_hours": 24
  }
}
```

**Response (Success)**:
```json
{
  "status": "ok",
  "request_id": "pf_req_abc123",
  "results": {
    "query": "brand name",
    "searched_at": "2026-01-15T10:30:00Z",
    "engines": {
      "chatgpt": {
        "found": true,
        "mentions": [
          {
            "position": 1,
            "snippet": "...brand name is recommended for...",
            "confidence_score": 0.92,
            "sentiment": "positive"
          }
        ]
      },
      "perplexity": {
        "found": false,
        "mentions": []
      }
    },
    "summary": {
      "total_found": 1,
      "engines_searched": 4,
      "avg_confidence": 0.92
    }
  },
  "quota": {
    "used": 156,
    "limit": 5000,
    "resets_at": "2026-02-01T00:00:00Z"
  }
}
```

### Single Platform Check

**Endpoint**: `POST /v2/citations/check`

For checking a single platform (more efficient when only one needed):

**Request**:
```json
{
  "query": "brand name",
  "engine": "chatgpt",
  "settings": {
    "include_snippets": true
  }
}
```

### Get Account Status

**Endpoint**: `GET /v2/account/status`

**Response**:
```json
{
  "status": "ok",
  "account": {
    "tier": "premium",
    "plan": "business",
    "quota": {
      "daily_limit": 500,
      "daily_used": 45,
      "daily_remaining": 455,
      "monthly_limit": 5000,
      "monthly_used": 1250,
      "monthly_remaining": 3750,
      "resets_at": "2026-02-01T00:00:00Z"
    },
    "features": {
      "batch_queries": true,
      "historical_data": true,
      "sentiment_analysis": true,
      "competitive_tracking": true
    }
  }
}
```

## Client Implementation

### ProfoundClient Class

```javascript
class ProfoundClient {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.PROFOUND_API_KEY;
    this.baseUrl = options.baseUrl || 'https://api.profound.ai/v2';
    this.tier = this.detectTier(this.apiKey);
    this.rateLimitCache = null;
    this.rateLimitCacheTime = null;
  }

  /**
   * Detect tier from API key format
   */
  detectTier(apiKey) {
    if (!apiKey) return 'premium';
    return apiKey.startsWith('pf_ent_') ? 'enterprise' : 'premium';
  }

  /**
   * Check if client is configured
   */
  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.startsWith('pf_'));
  }

  /**
   * Build request headers
   */
  buildHeaders() {
    return {
      'X-API-Key': this.apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Client-ID': 'simon-tools',
      'X-Request-ID': this.generateRequestId()
    };
  }

  /**
   * Generate unique request ID
   */
  generateRequestId() {
    return `pf_req_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Map platform names to Profound engine names
   */
  mapPlatformToEngine(platform) {
    const mapping = {
      'chatgpt': 'chatgpt',
      'perplexity': 'perplexity',
      'claude': 'claude',
      'gemini': 'gemini',
      'copilot': 'copilot',  // Extra platform in Profound
      'you': 'you'           // Extra platform in Profound
    };
    return mapping[platform.toLowerCase()] || platform;
  }

  /**
   * Check citation on a platform
   * @param {string} keyword - Keyword to check
   * @param {string} platform - Platform: chatgpt, perplexity, claude, gemini
   * @returns {Promise<CitationResult>}
   */
  async checkCitation(keyword, platform) {
    const timestamp = new Date().toISOString();
    const engine = this.mapPlatformToEngine(platform);

    try {
      const response = await fetch(`${this.baseUrl}/citations/check`, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify({
          query: keyword,
          engine: engine,
          settings: {
            include_snippets: true
          }
        }),
        signal: AbortSignal.timeout(30000)
      });

      // Handle rate limit (Profound uses 429 with X-RateLimit headers)
      if (response.status === 429) {
        const resetAt = response.headers.get('X-RateLimit-Reset');
        const retryAfter = response.headers.get('Retry-After') || '60';
        return {
          keyword,
          platform,
          cited: false,
          confidence: 0,
          timestamp,
          source: 'profound',
          error: 'E527',
          reason: `Rate limit exceeded. Retry after ${retryAfter}s`
        };
      }

      // Handle auth errors
      if (response.status === 401) {
        return {
          keyword,
          platform,
          cited: false,
          confidence: 0,
          timestamp,
          source: 'profound',
          error: 'E526',
          reason: 'Invalid API key'
        };
      }

      if (response.status === 403) {
        return {
          keyword,
          platform,
          cited: false,
          confidence: 0,
          timestamp,
          source: 'profound',
          error: 'E526',
          reason: 'API key lacks permission for this operation'
        };
      }

      // Handle server errors
      if (response.status >= 500) {
        return {
          keyword,
          platform,
          cited: false,
          confidence: 0,
          timestamp,
          source: 'profound',
          error: 'E528',
          reason: `Service unavailable (${response.status})`
        };
      }

      const data = await response.json();

      if (data.status !== 'ok') {
        return {
          keyword,
          platform,
          cited: false,
          confidence: 0,
          timestamp,
          source: 'profound',
          error: 'E528',
          reason: data.error?.message || 'API error'
        };
      }

      // Update rate limit cache from response
      if (data.quota) {
        this.updateRateLimitCache(data.quota);
      }

      // Map Profound response to CitationResult
      const engineResult = data.results?.engines?.[engine] || data.results;
      const mention = engineResult?.mentions?.[0];

      return {
        keyword,
        platform,
        cited: engineResult?.found || false,
        context: mention?.snippet,
        rank: mention?.position,
        confidence: mention?.confidence_score || (engineResult?.found ? 0.8 : 0),
        timestamp,
        source: 'profound',
        method: 'api'
      };

    } catch (error) {
      if (error.name === 'TimeoutError' || error.name === 'AbortError') {
        return {
          keyword,
          platform,
          cited: false,
          confidence: 0,
          timestamp,
          source: 'profound',
          error: 'E528',
          reason: 'Request timeout (30s)'
        };
      }

      return {
        keyword,
        platform,
        cited: false,
        confidence: 0,
        timestamp,
        source: 'profound',
        error: 'E528',
        reason: error.message || 'Network error'
      };
    }
  }

  /**
   * Check citations across multiple platforms (batch)
   * More efficient than multiple single calls
   * @param {string} keyword - Keyword to check
   * @param {string[]} platforms - Platforms to check
   * @returns {Promise<CitationResult[]>}
   */
  async checkCitationsBatch(keyword, platforms) {
    const timestamp = new Date().toISOString();
    const engines = platforms.map(p => this.mapPlatformToEngine(p));

    try {
      const response = await fetch(`${this.baseUrl}/citations/search`, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify({
          query: keyword,
          engines: engines,
          settings: {
            depth: 'standard',
            include_snippets: true
          }
        }),
        signal: AbortSignal.timeout(60000) // Longer timeout for batch
      });

      if (!response.ok) {
        // Fall back to individual requests
        return Promise.all(platforms.map(p => this.checkCitation(keyword, p)));
      }

      const data = await response.json();

      if (data.quota) {
        this.updateRateLimitCache(data.quota);
      }

      // Map each engine result to CitationResult
      return platforms.map(platform => {
        const engine = this.mapPlatformToEngine(platform);
        const engineResult = data.results?.engines?.[engine];
        const mention = engineResult?.mentions?.[0];

        return {
          keyword,
          platform,
          cited: engineResult?.found || false,
          context: mention?.snippet,
          rank: mention?.position,
          confidence: mention?.confidence_score || (engineResult?.found ? 0.8 : 0),
          timestamp,
          source: 'profound',
          method: 'api'
        };
      });

    } catch (error) {
      // Fall back to individual requests on error
      return Promise.all(platforms.map(p => this.checkCitation(keyword, p)));
    }
  }

  /**
   * Update rate limit cache from API response
   */
  updateRateLimitCache(quota) {
    this.rateLimitCache = {
      tier: this.tier,
      limit: quota.monthly_limit || quota.limit,
      remaining: quota.monthly_remaining || quota.remaining,
      resetAt: quota.resets_at,
      period: 'month'
    };
    this.rateLimitCacheTime = Date.now();
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
      const response = await fetch(`${this.baseUrl}/account/status`, {
        method: 'GET',
        headers: this.buildHeaders(),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        return this.getDefaultRateLimit();
      }

      const data = await response.json();
      const quota = data.account?.quota;

      this.rateLimitCache = {
        tier: data.account?.tier || this.tier,
        limit: quota?.monthly_limit || 5000,
        remaining: quota?.monthly_remaining || -1,
        resetAt: quota?.resets_at || this.getEndOfMonth(),
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
      premium: { limit: 5000, period: 'month' },
      enterprise: { limit: 50000, period: 'month' }
    };

    const tierLimits = limits[this.tier] || limits.premium;

    return {
      tier: this.tier,
      limit: tierLimits.limit,
      remaining: -1,
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
   */
  getQuotaRemaining() {
    if (this.rateLimitCache) {
      return this.rateLimitCache.remaining;
    }
    return -1;
  }
}
```

## Tier Comparison

| Feature | Premium | Enterprise |
|---------|---------|------------|
| Monthly requests | 5,000 | 50,000 |
| Daily limit | 500 | 5,000 |
| Platforms | 6 | 6+ custom |
| Batch queries | Yes | Yes |
| Historical data | 30 days | 90 days |
| Sentiment analysis | Yes | Yes |
| Competitive tracking | No | Yes |
| Custom engines | No | Yes |
| SLA | 99.5% | 99.9% |
| API key prefix | `pf_` | `pf_ent_` |

## Error Handling

### HTTP Status Code Mapping

| Status | Error Code | Handling |
|--------|------------|----------|
| 401 | E526 | Invalid API key |
| 403 | E526 | Insufficient permissions |
| 429 | E527 | Rate limit exceeded |
| 500+ | E528 | Service unavailable |
| Timeout | E528 | Request timeout |

### Rate Limit Headers

Profound includes rate limit info in response headers:

```
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 4850
X-RateLimit-Reset: 2026-02-01T00:00:00Z
X-RateLimit-Daily-Limit: 500
X-RateLimit-Daily-Remaining: 455
```

### Retry Strategy

```javascript
const PROFOUND_RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 500,  // Faster initial retry
  maxDelayMs: 15000,
  retryableStatuses: [429, 500, 502, 503, 504],
  retryableErrors: ['ECONNRESET', 'ETIMEDOUT']
};
```

## Advanced Features

### Sentiment Analysis

Profound includes sentiment in responses:

```javascript
// Access sentiment from response
const sentiment = mention?.sentiment; // 'positive', 'neutral', 'negative'
```

### Historical Queries

Enterprise tier can query historical data:

```javascript
const response = await client.checkCitationHistorical(keyword, {
  engine: 'chatgpt',
  from: '2026-01-01',
  to: '2026-01-15'
});
```

## Usage Example

```javascript
import { ProfoundClient } from './profound-client';

async function checkProfoundCitation(keyword, platform) {
  const client = new ProfoundClient();

  if (!client.isConfigured()) {
    return { error: 'E529', reason: 'Profound API not configured' };
  }

  return await client.checkCitation(keyword, platform);
}

// Batch check (more efficient)
async function checkAllPlatforms(keyword) {
  const client = new ProfoundClient();
  const platforms = ['chatgpt', 'perplexity', 'claude', 'gemini'];

  return await client.checkCitationsBatch(keyword, platforms);
}
```

## Environment Configuration

```bash
# .env file
PROFOUND_API_KEY=pf_xxxxxxxxxxxxxxxxxxxx

# Or for enterprise tier
PROFOUND_API_KEY=pf_ent_xxxxxxxxxxxxxxxx

# Optional: prefer Profound over Otterly
GEO_PREFERRED_API=profound
```

## Related Resources

- `api-clients.md` - Unified interface and factory pattern
- `rate-limiting.md` - Advanced rate limiting patterns
- `otterly-client.md` - Alternative API client (free tier available)
- `mock-mode.md` - Testing without API keys
