# Rate Limiting Patterns

This document provides rate limiting, backoff, and quota management patterns for GEO API clients.

## Overview

Rate limiting is critical for GEO validation to:
- Avoid exceeding API quotas
- Prevent 429 errors from blocking operations
- Distribute requests fairly across billing periods
- Provide graceful degradation when limits approached

## Rate Limit Tracking

### RateLimitTracker Class

```javascript
/**
 * Centralized rate limit tracking across all API clients
 */
class RateLimitTracker {
  constructor() {
    this.limits = new Map(); // client -> RateLimitInfo
    this.history = new Map(); // client -> request timestamps
  }

  /**
   * Update rate limit info for a client
   * @param {string} client - Client name (otterly, profound)
   * @param {RateLimitInfo} info - Rate limit info
   */
  update(client, info) {
    this.limits.set(client, {
      ...info,
      updatedAt: Date.now()
    });
  }

  /**
   * Get current rate limit for a client
   * @param {string} client - Client name
   * @returns {RateLimitInfo|null}
   */
  get(client) {
    return this.limits.get(client) || null;
  }

  /**
   * Record a request for rate tracking
   * @param {string} client - Client name
   */
  recordRequest(client) {
    if (!this.history.has(client)) {
      this.history.set(client, []);
    }

    const timestamps = this.history.get(client);
    timestamps.push(Date.now());

    // Keep only last hour of history
    const oneHourAgo = Date.now() - 3600000;
    this.history.set(client, timestamps.filter(t => t > oneHourAgo));
  }

  /**
   * Get requests per minute for a client
   * @param {string} client - Client name
   * @returns {number}
   */
  getRequestsPerMinute(client) {
    const timestamps = this.history.get(client) || [];
    const oneMinuteAgo = Date.now() - 60000;
    return timestamps.filter(t => t > oneMinuteAgo).length;
  }

  /**
   * Check if rate limit is approaching
   * @param {string} client - Client name
   * @param {number} threshold - Warning threshold (0-1)
   * @returns {boolean}
   */
  isApproachingLimit(client, threshold = 0.9) {
    const info = this.limits.get(client);
    if (!info || info.remaining < 0) return false;

    const usedPercent = 1 - (info.remaining / info.limit);
    return usedPercent >= threshold;
  }

  /**
   * Get time until quota reset
   * @param {string} client - Client name
   * @returns {number} Milliseconds until reset, -1 if unknown
   */
  getTimeUntilReset(client) {
    const info = this.limits.get(client);
    if (!info || !info.resetAt) return -1;

    const resetTime = new Date(info.resetAt).getTime();
    return Math.max(0, resetTime - Date.now());
  }

  /**
   * Generate rate limit status summary
   * @returns {object} Summary for all tracked clients
   */
  getSummary() {
    const summary = {};

    for (const [client, info] of this.limits) {
      summary[client] = {
        tier: info.tier,
        used: info.limit - info.remaining,
        remaining: info.remaining,
        limit: info.limit,
        percentUsed: Math.round((1 - info.remaining / info.limit) * 100),
        resetAt: info.resetAt,
        requestsLastMinute: this.getRequestsPerMinute(client)
      };
    }

    return summary;
  }
}

// Singleton instance
const rateLimitTracker = new RateLimitTracker();
```

## Exponential Backoff

### BackoffStrategy Class

```javascript
/**
 * Exponential backoff with jitter for retry logic
 */
class BackoffStrategy {
  constructor(options = {}) {
    this.initialDelayMs = options.initialDelayMs || 1000;
    this.maxDelayMs = options.maxDelayMs || 30000;
    this.multiplier = options.multiplier || 2;
    this.jitterFactor = options.jitterFactor || 0.1;
    this.maxRetries = options.maxRetries || 3;
  }

  /**
   * Calculate delay for a given attempt
   * @param {number} attempt - Attempt number (0-based)
   * @returns {number} Delay in milliseconds
   */
  getDelay(attempt) {
    // Exponential increase
    let delay = this.initialDelayMs * Math.pow(this.multiplier, attempt);

    // Cap at max delay
    delay = Math.min(delay, this.maxDelayMs);

    // Add jitter (random variation)
    const jitter = delay * this.jitterFactor * (Math.random() * 2 - 1);
    delay = Math.max(0, delay + jitter);

    return Math.round(delay);
  }

  /**
   * Check if should retry
   * @param {number} attempt - Current attempt number
   * @param {Error} error - Error from last attempt
   * @returns {boolean}
   */
  shouldRetry(attempt, error) {
    if (attempt >= this.maxRetries) return false;

    // Don't retry auth errors
    if (error.code === 'E526') return false;

    // Retry rate limits and server errors
    if (error.code === 'E527' || error.code === 'E528') return true;

    // Retry network errors
    const retryableCodes = ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED'];
    return retryableCodes.includes(error.code);
  }

  /**
   * Execute function with retries
   * @param {Function} fn - Async function to execute
   * @param {object} options - Options
   * @returns {Promise} Result or throws last error
   */
  async execute(fn, options = {}) {
    const { onRetry, signal } = options;
    let lastError;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        // Check for abort signal
        if (signal?.aborted) {
          throw new Error('Operation aborted');
        }

        return await fn(attempt);

      } catch (error) {
        lastError = error;

        if (!this.shouldRetry(attempt, error)) {
          throw error;
        }

        const delay = this.getDelay(attempt);

        // Notify retry callback
        if (onRetry) {
          onRetry({
            attempt: attempt + 1,
            maxRetries: this.maxRetries,
            delay,
            error
          });
        }

        // Wait before retry
        await this.sleep(delay, signal);
      }
    }

    throw lastError;
  }

  /**
   * Sleep for specified duration
   * @param {number} ms - Milliseconds to sleep
   * @param {AbortSignal} signal - Optional abort signal
   */
  sleep(ms, signal) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, ms);

      if (signal) {
        signal.addEventListener('abort', () => {
          clearTimeout(timeout);
          reject(new Error('Sleep aborted'));
        });
      }
    });
  }
}
```

## Circuit Breaker

### CircuitBreaker Class

```javascript
/**
 * Circuit breaker pattern for API resilience
 */
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.recoveryTimeout = options.recoveryTimeout || 60000; // 1 minute
    this.monitoringWindow = options.monitoringWindow || 60000;

    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failures = [];
    this.lastFailure = null;
    this.successCount = 0;
  }

  /**
   * Check if circuit allows requests
   * @returns {boolean}
   */
  isAllowed() {
    this.cleanOldFailures();

    switch (this.state) {
      case 'CLOSED':
        return true;

      case 'OPEN':
        // Check if recovery timeout passed
        if (Date.now() - this.lastFailure > this.recoveryTimeout) {
          this.state = 'HALF_OPEN';
          this.successCount = 0;
          return true;
        }
        return false;

      case 'HALF_OPEN':
        return true;

      default:
        return true;
    }
  }

  /**
   * Record a successful request
   */
  recordSuccess() {
    if (this.state === 'HALF_OPEN') {
      this.successCount++;

      // Close circuit after 3 successes in half-open state
      if (this.successCount >= 3) {
        this.state = 'CLOSED';
        this.failures = [];
      }
    }
  }

  /**
   * Record a failed request
   */
  recordFailure() {
    this.failures.push(Date.now());
    this.lastFailure = Date.now();

    if (this.state === 'HALF_OPEN') {
      // Immediately open on failure during half-open
      this.state = 'OPEN';
      return;
    }

    this.cleanOldFailures();

    if (this.failures.length >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  /**
   * Clean failures outside monitoring window
   */
  cleanOldFailures() {
    const cutoff = Date.now() - this.monitoringWindow;
    this.failures = this.failures.filter(t => t > cutoff);
  }

  /**
   * Get current circuit state
   * @returns {object}
   */
  getState() {
    return {
      state: this.state,
      failures: this.failures.length,
      threshold: this.failureThreshold,
      lastFailure: this.lastFailure,
      recoveryIn: this.state === 'OPEN'
        ? Math.max(0, this.recoveryTimeout - (Date.now() - this.lastFailure))
        : 0
    };
  }

  /**
   * Reset circuit to closed state
   */
  reset() {
    this.state = 'CLOSED';
    this.failures = [];
    this.lastFailure = null;
    this.successCount = 0;
  }
}
```

## Quota-Aware Client Wrapper

### RateLimitedClient Class

```javascript
/**
 * Wrapper that adds rate limiting to any API client
 */
class RateLimitedClient {
  constructor(client, options = {}) {
    this.client = client;
    this.clientName = options.clientName || 'unknown';
    this.tracker = options.tracker || rateLimitTracker;

    this.backoff = new BackoffStrategy({
      initialDelayMs: options.initialDelayMs || 1000,
      maxDelayMs: options.maxDelayMs || 30000,
      maxRetries: options.maxRetries || 3
    });

    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: options.failureThreshold || 5,
      recoveryTimeout: options.recoveryTimeout || 60000
    });

    this.requestQueue = [];
    this.processing = false;
    this.requestsPerSecond = options.requestsPerSecond || 2;
  }

  /**
   * Check if client can make requests
   * @returns {object} { allowed: boolean, reason?: string }
   */
  canMakeRequest() {
    // Check circuit breaker
    if (!this.circuitBreaker.isAllowed()) {
      const state = this.circuitBreaker.getState();
      return {
        allowed: false,
        reason: `Circuit open. Recovers in ${Math.round(state.recoveryIn / 1000)}s`
      };
    }

    // Check rate limit
    const rateLimit = this.tracker.get(this.clientName);
    if (rateLimit && rateLimit.remaining === 0) {
      const resetIn = this.tracker.getTimeUntilReset(this.clientName);
      return {
        allowed: false,
        reason: `Quota exhausted. Resets in ${Math.round(resetIn / 3600000)}h`
      };
    }

    // Check requests per second
    const rpm = this.tracker.getRequestsPerMinute(this.clientName);
    if (rpm >= this.requestsPerSecond * 60) {
      return {
        allowed: false,
        reason: 'Rate limit: too many requests per minute'
      };
    }

    return { allowed: true };
  }

  /**
   * Make rate-limited request
   * @param {string} method - Method name on client
   * @param {Array} args - Method arguments
   * @returns {Promise}
   */
  async request(method, ...args) {
    const canMake = this.canMakeRequest();
    if (!canMake.allowed) {
      return {
        error: 'E527',
        reason: canMake.reason
      };
    }

    try {
      const result = await this.backoff.execute(
        async () => {
          this.tracker.recordRequest(this.clientName);
          return await this.client[method](...args);
        },
        {
          onRetry: ({ attempt, delay, error }) => {
            console.warn(
              `[${this.clientName}] Retry ${attempt}: ${error.message}. ` +
              `Waiting ${delay}ms...`
            );
          }
        }
      );

      // Update tracker with rate limit from response
      if (result.quota) {
        this.tracker.update(this.clientName, result.quota);
      }

      this.circuitBreaker.recordSuccess();
      return result;

    } catch (error) {
      this.circuitBreaker.recordFailure();
      throw error;
    }
  }

  /**
   * Check citation with rate limiting
   * @param {string} keyword - Keyword to check
   * @param {string} platform - Platform to check
   * @returns {Promise<CitationResult>}
   */
  async checkCitation(keyword, platform) {
    return this.request('checkCitation', keyword, platform);
  }

  /**
   * Get rate limit info
   * @returns {Promise<RateLimitInfo>}
   */
  async getRateLimit() {
    const result = await this.request('getRateLimit');
    if (!result.error) {
      this.tracker.update(this.clientName, result);
    }
    return result;
  }

  /**
   * Get status summary
   * @returns {object}
   */
  getStatus() {
    return {
      client: this.clientName,
      rateLimit: this.tracker.get(this.clientName),
      circuit: this.circuitBreaker.getState(),
      requestsPerMinute: this.tracker.getRequestsPerMinute(this.clientName)
    };
  }
}
```

## Usage Patterns

### Basic Rate-Limited Usage

```javascript
import { OtterlyClient } from './otterly-client';
import { RateLimitedClient, rateLimitTracker } from './rate-limiting';

// Create rate-limited client
const otterly = new RateLimitedClient(
  new OtterlyClient(),
  { clientName: 'otterly', requestsPerSecond: 2 }
);

// Check if request allowed before making
async function safeCitationCheck(keyword, platform) {
  const canMake = otterly.canMakeRequest();

  if (!canMake.allowed) {
    console.warn(`Skipping request: ${canMake.reason}`);
    return null;
  }

  return await otterly.checkCitation(keyword, platform);
}
```

### Pre-Request Quota Check

```javascript
// Check quota before batch operations
async function batchCheck(keywords, platform) {
  const rateLimit = await otterly.getRateLimit();

  if (rateLimit.remaining < keywords.length) {
    console.warn(
      `Insufficient quota: ${rateLimit.remaining}/${keywords.length} needed. ` +
      `Reducing batch size.`
    );
    keywords = keywords.slice(0, rateLimit.remaining);
  }

  const results = [];
  for (const keyword of keywords) {
    results.push(await otterly.checkCitation(keyword, platform));
  }

  return results;
}
```

### Quota Warning Output

```javascript
// Output quota warnings for /seo-validate-geo
function formatQuotaWarning(client) {
  const status = client.getStatus();
  const rateLimit = status.rateLimit;

  if (!rateLimit) return null;

  const percentUsed = Math.round((1 - rateLimit.remaining / rateLimit.limit) * 100);

  if (percentUsed >= 90) {
    return `[WARNING] E527: ${client.clientName} quota ${percentUsed}% used ` +
           `(${rateLimit.remaining}/${rateLimit.limit} remaining). ` +
           `Resets ${rateLimit.resetAt}`;
  }

  if (percentUsed >= 75) {
    return `[INFO] ${client.clientName} quota ${percentUsed}% used`;
  }

  return null;
}
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `GEO_REQUESTS_PER_SECOND` | 2 | Max requests per second |
| `GEO_MAX_RETRIES` | 3 | Max retry attempts |
| `GEO_INITIAL_BACKOFF_MS` | 1000 | Initial backoff delay |
| `GEO_MAX_BACKOFF_MS` | 30000 | Maximum backoff delay |
| `GEO_CIRCUIT_FAILURE_THRESHOLD` | 5 | Failures before circuit opens |
| `GEO_CIRCUIT_RECOVERY_MS` | 60000 | Time before circuit half-opens |

### Tier-Specific Defaults

| Tier | Requests/Second | Monthly Limit |
|------|-----------------|---------------|
| Otterly Free | 1 | 100 |
| Otterly Pro | 2 | 1,000 |
| Profound Premium | 5 | 5,000 |
| Profound Enterprise | 10 | 50,000 |

### Perplexity Rate Limits (TASK-139)

Perplexity uses a **burst-based** rate limiting model, different from Otterly/Profound monthly quotas:

| Limit Type | Value | Reset |
|------------|-------|-------|
| Burst limit | 50 requests/second | Per-second window |
| Sustained | ~1000 requests/minute | Rolling window |

#### Perplexity-Specific Configuration

```javascript
const PERPLEXITY_RATE_LIMITS = {
  api: {
    requestsPerSecond: 50,    // Perplexity burst limit
    burstWindow: 1000,        // 1 second window
    backoffBase: 1000,        // Initial backoff after 429
    backoffMax: 30000,        // Max backoff: 30s
    backoffMultiplier: 2      // Exponential multiplier
  },
  scraping: {
    requestsPerDay: 50,       // Conservative scraping limit
    minInterval: 2000,        // 2s minimum between requests
    cooldownAfterBlock: 300000  // 5 min cooldown if blocked
  }
};
```

#### Perplexity Headers

When Perplexity returns 429, check these headers:

| Header | Example | Description |
|--------|---------|-------------|
| `x-ratelimit-limit-requests` | 50 | Requests allowed per second |
| `x-ratelimit-remaining-requests` | 0 | Remaining in current window |
| `x-ratelimit-reset-requests` | 1s | Time until window resets |
| `retry-after` | 1 | Seconds to wait before retry |

#### Usage with RateLimitedClient

```javascript
// Perplexity client with burst-aware rate limiting
const perplexity = new RateLimitedClient(
  new PerplexityClient(),
  {
    clientName: 'perplexity',
    requestsPerSecond: 50,  // Match Perplexity's burst limit
    failureThreshold: 3,    // Faster circuit break for API
    recoveryTimeout: 5000   // 5s recovery (faster than monthly services)
  }
);

// Check burst capacity before batch operations
async function perplexityBatchCheck(keywords) {
  const results = [];

  for (const keyword of keywords) {
    const canMake = perplexity.canMakeRequest();

    if (!canMake.allowed) {
      // Wait for burst window to reset (1 second)
      await sleep(1000);
    }

    results.push(await perplexity.checkCitation(keyword, 'perplexity'));
  }

  return results;
}
```

## Related Resources

- `api-clients.md` - Unified interface and factory pattern
- `otterly-client.md` - Otterly API client
- `profound-client.md` - Profound API client
- `mock-mode.md` - Testing without API keys
