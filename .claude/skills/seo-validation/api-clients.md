# API Clients for GEO Citation Tracking

This document defines the unified interface and patterns for integrating third-party AI citation tracking APIs (Otterly, Profound) used by the `/seo-validate-geo` command.

## Overview

GEO (Generative Engine Optimization) requires checking citation presence across AI search platforms. This skill provides:
- Unified client interface for multiple API providers
- Consistent response schema (CitationResult)
- Rate limiting and quota management
- Error handling patterns

## Core Interfaces

### AISearchAPIClient

The unified interface all API clients must implement:

```typescript
interface AISearchAPIClient {
  /**
   * Check if keyword is cited on a specific AI platform
   * @param keyword - Search term to check
   * @param platform - Target platform: chatgpt, perplexity, claude, gemini
   * @returns Citation result with confidence score
   */
  checkCitation(keyword: string, platform: string): Promise<CitationResult>;

  /**
   * Get current rate limit status
   * @returns Rate limit info including remaining quota
   */
  getRateLimit(): RateLimitInfo;

  /**
   * Get remaining API calls for current period
   * @returns Number of calls remaining
   */
  getQuotaRemaining(): number;

  /**
   * Check if client is properly configured
   * @returns true if API key is set and valid
   */
  isConfigured(): boolean;
}
```

### CitationResult

Standardized response from all citation checks:

```typescript
interface CitationResult {
  /** The keyword that was searched */
  keyword: string;

  /** Target platform: chatgpt, perplexity, claude, gemini */
  platform: string;

  /** Whether the keyword was cited in the AI response */
  cited: boolean;

  /** Context snippet from the AI response (if cited) */
  context?: string;

  /** Position/rank in the AI response (1 = first mention) */
  rank?: number;

  /** Confidence score 0.0-1.0 (1.0 = definite citation) */
  confidence: number;

  /** ISO 8601 timestamp of the check */
  timestamp: string;

  /** Source of the result */
  source: 'otterly' | 'profound' | 'scraping' | 'mock';

  /** Detection method used */
  method?: 'api' | 'scraping' | 'hybrid';

  /** Error code if check failed (E52X range) */
  error?: string;

  /** Human-readable error reason */
  reason?: string;
}
```

### RateLimitInfo

Rate limit and quota tracking:

```typescript
interface RateLimitInfo {
  /** API tier: free, pro, premium, mock */
  tier: 'free' | 'pro' | 'premium' | 'mock';

  /** Total requests allowed per period */
  limit: number;

  /** Remaining requests in current period */
  remaining: number;

  /** ISO 8601 timestamp when quota resets */
  resetAt: string;

  /** Billing period: month or day */
  period: 'month' | 'day';
}
```

## Client Factory Pattern

Select appropriate client based on configuration:

```javascript
/**
 * Factory function to get the configured API client
 * @returns AISearchAPIClient instance
 * @throws Error with E529 if no API configured and mock mode disabled
 */
function getAPIClient(): AISearchAPIClient {
  const preferredAPI = process.env.GEO_PREFERRED_API || 'otterly';
  const mockMode = process.env.GEO_MOCK_MODE === 'true';

  // Priority 1: Preferred API if configured
  if (preferredAPI === 'profound' && process.env.PROFOUND_API_KEY) {
    return new ProfoundClient({
      apiKey: process.env.PROFOUND_API_KEY
    });
  }

  // Priority 2: Otterly if configured
  if (process.env.OTTERLY_API_KEY) {
    return new OtterlyClient({
      apiKey: process.env.OTTERLY_API_KEY,
      tier: detectOtterlyTier(process.env.OTTERLY_API_KEY)
    });
  }

  // Priority 3: Mock mode for testing
  if (mockMode) {
    return new MockClient();
  }

  // No API configured
  throw new APIError('E529', 'No API configured', {
    suggestion: 'Set OTTERLY_API_KEY in .env or enable GEO_MOCK_MODE=true'
  });
}

/**
 * Detect Otterly tier from API key prefix
 * Keys starting with 'ot_pro_' are Pro tier
 */
function detectOtterlyTier(apiKey: string): 'free' | 'pro' {
  return apiKey.startsWith('ot_pro_') ? 'pro' : 'free';
}
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OTTERLY_API_KEY` | No* | - | Otterly API key (ot_xxxxxxxx) |
| `PROFOUND_API_KEY` | No* | - | Profound API key (pf_xxxxxxxx) |
| `GEO_PREFERRED_API` | No | otterly | Preferred API: otterly or profound |
| `GEO_FALLBACK_TO_SCRAPING` | No | false | Fall back to scraping on API failure |
| `GEO_MOCK_MODE` | No | false | Enable mock mode for testing |

*At least one of `OTTERLY_API_KEY`, `PROFOUND_API_KEY`, or `GEO_MOCK_MODE=true` is required.

## Error Handling

### Error Codes (E52X Range)

| Code | Message | Exit | Recovery |
|------|---------|------|----------|
| E526 | API authentication failed | 2 | Verify API key, check expiration |
| E527 | API quota exceeded | 2 | Wait for reset or upgrade tier |
| E528 | API service unavailable | 2 | Retry later, use fallback |
| E529 | No API configured | 2 | Set API key or enable mock mode |

### Error Response Pattern

```javascript
class APIError extends Error {
  constructor(code: string, message: string, options?: {
    suggestion?: string;
    apiKey?: string;  // Will be masked
    statusCode?: number;
  }) {
    super(`[ERROR] ${code}: ${message}`);
    this.code = code;
    this.suggestion = options?.suggestion;
    this.apiKey = options?.apiKey ? maskAPIKey(options.apiKey) : undefined;
    this.statusCode = options?.statusCode;
  }
}

/**
 * Mask API key for safe logging
 * Shows first 4 and last 4 characters only
 */
function maskAPIKey(key: string): string {
  if (!key || key.length < 12) return '[REDACTED]';
  return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
}
```

### Error Message Templates

```
# E526: Authentication Failed
[ERROR] E526: API authentication failed

Details: API key {masked_key} rejected by {service}

Suggested fix:
  → Verify API key is correct
  → Check API key has not expired
  → Ensure correct environment (staging vs production)

# E527: Quota Exceeded
[WARNING] E527: API quota exceeded

Details: {service} {tier} tier limit reached ({used}/{limit})
         Resets in {days} days ({reset_date})

Options:
  → Upgrade to {next_tier} tier at {pricing_url}
  → Enable scraping fallback: GEO_FALLBACK_TO_SCRAPING=true
  → Wait for quota reset

# E528: Service Unavailable
[ERROR] E528: API service unavailable

Details: {service} API returned {status_code} after {retries} retries

Suggested fix:
  → Check {service_url}/status for outages
  → Enable scraping fallback: GEO_FALLBACK_TO_SCRAPING=true
  → Retry in a few minutes

# E529: No API Configured
[ERROR] E529: No API configured

Details: No API key found and mock mode disabled

Suggested fix:
  → Set OTTERLY_API_KEY in .env file
  → Or set PROFOUND_API_KEY for premium features
  → Or enable GEO_MOCK_MODE=true for testing
```

## Usage in /seo-validate-geo

The command uses the client factory pattern:

```javascript
async function validateGEO(keyword: string, platform: string) {
  try {
    // Get configured client
    const client = getAPIClient();

    // Check quota before making request
    const quota = client.getQuotaRemaining();
    if (quota <= 0) {
      return { error: 'E527', reason: 'quota_exceeded' };
    }

    // Make citation check
    const result = await client.checkCitation(keyword, platform);

    // Add quota info to result
    result.quota = client.getRateLimit();

    return result;
  } catch (error) {
    if (error instanceof APIError) {
      return {
        keyword,
        platform,
        cited: false,
        error: error.code,
        reason: error.message
      };
    }
    throw error;
  }
}
```

## Client Implementations

See individual client documentation:
- `otterly-client.md` - Otterly API integration (free/pro tiers)
- `profound-client.md` - Profound API integration (premium tier)
- `claude-detection.md` - Claude scraping-only detection (TASK-140)
- `gemini-detection.md` - Gemini hybrid API/scraping detection (TASK-140)
- `mock-mode.md` - Mock client for testing
- `rate-limiting.md` - Rate limit tracking and backoff patterns

## Platform-Specific Interfaces

### ClaudeClient

Claude detection is scraping-only (no public API available). Implements session management for authenticated scraping.

```typescript
interface ClaudeClient extends AISearchAPIClient {
  /** Platform identifier */
  platform: 'claude';

  /**
   * Check if stored session cookies are valid
   * Sessions expire after 24 hours
   * @returns true if valid session exists
   */
  hasValidSession(): Promise<boolean>;

  /**
   * Launch interactive browser for user to log in
   * Saves session cookies for subsequent requests
   */
  refreshSession(): Promise<void>;

  /**
   * Detect citation via web scraping
   * @param keyword - Search query to submit
   * @param domain - Target domain to detect mentions
   * @returns CitationResult with mention-based analysis
   */
  detectCitation(keyword: string, domain: string): Promise<CitationResult>;
}

// Usage
const claude = new ClaudeDetector();

// First-time setup (interactive)
if (!await claude.hasValidSession()) {
  await claude.refreshSession();
}

// Detection
const result = await claude.detectCitation("best CRM software", "salesforce.com");
```

**Error Codes**:
- E522: Rate limit exceeded (20 req/hour)
- E523: Blocking detected (CAPTCHA/ban)
- E524: General detection failure
- E529: Authentication required (session expired)

**Rate Limits**:
- 20 requests per hour
- 5-second minimum delay between requests
- Circuit breaker after 3 consecutive failures

### GeminiClient

Gemini detection uses hybrid approach: Google Generative Language API primary with web scraping fallback.

```typescript
interface GeminiClient extends AISearchAPIClient {
  /** Platform identifier */
  platform: 'gemini';

  /** Whether to prefer API over scraping */
  preferAPI: boolean;

  /** Google AI Studio API key (optional) */
  apiKey?: string;

  /**
   * Parse groundingMetadata from API response for explicit citations
   * @param response - Gemini API response
   * @returns Array of citation sources with URIs
   */
  parseGroundingMetadata(response: any): Citation[];

  /**
   * Detect citation via API or scraping
   * @param keyword - Search query to submit
   * @param domain - Target domain to detect citations/mentions
   * @returns CitationResult with grounding or mention analysis
   */
  detectCitation(keyword: string, domain: string): Promise<CitationResult>;
}

// Usage
const gemini = new GeminiDetector({
  apiKey: process.env.GEMINI_API_KEY,  // Optional - enables API mode
  preferAPI: true                       // Try API first if key provided
});

// Detection (uses API if configured, falls back to scraping)
const result = await gemini.detectCitation("project management tools", "asana.com");

// Check for grounding (explicit citations)
if (result.method === 'api' && result.rank) {
  console.log(`Found in grounding at position ${result.rank}`);
}
```

**Environment Variables**:
- `GEMINI_API_KEY`: Google AI Studio API key (enables API mode)

**Error Codes**:
- E522: Scraping rate limit exceeded (20 req/hour)
- E523: Blocking detected
- E525: General detection failure
- E526: API quota exceeded (60 req/min)
- E529: Authentication required (session or API key)

**Rate Limits**:
- API mode: 60 requests per minute
- Scraping mode: 20 requests per hour
- Exponential backoff on 429 responses

**Confidence Scoring**:
- 0.95: Explicit grounding citation (domain in groundingMetadata)
- 0.85: Domain in webSearchQueries
- 0.5-0.8: Mention-based detection (text contains domain)

## Citation Interface

Used by grounding metadata parsers:

```typescript
interface Citation {
  /** Source URL */
  uri: string;

  /** Page title */
  title?: string;

  /** Position in grounding (1-based) */
  rank?: number;
}
```

## Related Resources

- `/seo-validate-geo` command - Primary consumer of these patterns
- `error-handling/error-codes.md` - Full error code reference (E52X range)
- `geo-optimization-patterns` skill - GEO best practices
- `fixtures/claude-response.json` - Claude test fixtures
- `fixtures/gemini-response.json` - Gemini test fixtures
