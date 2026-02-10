# Mock Mode for GEO Validation

This document provides mock client implementation patterns for testing GEO validation without real API keys.

## Overview

Mock mode enables:
- Testing `/seo-validate-geo` without API costs
- CI/CD pipeline integration
- Development without API credentials
- Deterministic test scenarios

## Enabling Mock Mode

### Environment Variable

```bash
# Enable mock mode
GEO_MOCK_MODE=true

# Optional: set specific mock behavior
GEO_MOCK_SCENARIO=all_cited
GEO_MOCK_DELAY_MS=500
```

### Detection in Factory

```javascript
function getAPIClient() {
  const mockMode = process.env.GEO_MOCK_MODE === 'true';

  if (mockMode) {
    return new MockClient({
      scenario: process.env.GEO_MOCK_SCENARIO || 'mixed',
      delayMs: parseInt(process.env.GEO_MOCK_DELAY_MS) || 200
    });
  }

  // ... real client selection
}
```

## MockClient Implementation

### Full MockClient Class

```javascript
/**
 * Mock client for testing without real API credentials
 * Implements AISearchAPIClient interface
 */
class MockClient {
  constructor(options = {}) {
    this.scenario = options.scenario || 'mixed';
    this.delayMs = options.delayMs || 200;
    this.requestCount = 0;
    this.failAfter = options.failAfter || Infinity;

    // Deterministic seed for reproducible results
    this.seed = options.seed || 12345;
    this.rng = this.createRNG(this.seed);
  }

  /**
   * Simple seeded random number generator
   */
  createRNG(seed) {
    return () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
  }

  /**
   * Check if client is configured (always true for mock)
   */
  isConfigured() {
    return true;
  }

  /**
   * Simulate network delay
   */
  async simulateDelay() {
    const jitter = this.delayMs * 0.2 * (this.rng() - 0.5);
    const delay = Math.max(50, this.delayMs + jitter);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Check citation (mock implementation)
   * @param {string} keyword - Keyword to check
   * @param {string} platform - Platform to check
   * @returns {Promise<CitationResult>}
   */
  async checkCitation(keyword, platform) {
    await this.simulateDelay();
    this.requestCount++;

    const timestamp = new Date().toISOString();

    // Simulate failure after N requests
    if (this.requestCount > this.failAfter) {
      return {
        keyword,
        platform,
        cited: false,
        confidence: 0,
        timestamp,
        source: 'mock',
        error: 'E527',
        reason: 'Mock: Simulated quota exceeded'
      };
    }

    // Generate result based on scenario
    const result = this.generateResult(keyword, platform);

    return {
      keyword,
      platform,
      cited: result.cited,
      context: result.context,
      rank: result.rank,
      confidence: result.confidence,
      timestamp,
      source: 'mock',
      method: 'api'
    };
  }

  /**
   * Generate mock result based on scenario
   */
  generateResult(keyword, platform) {
    switch (this.scenario) {
      case 'all_cited':
        return this.allCitedScenario(keyword, platform);

      case 'none_cited':
        return this.noneCitedScenario(keyword, platform);

      case 'mixed':
        return this.mixedScenario(keyword, platform);

      case 'platform_specific':
        return this.platformSpecificScenario(keyword, platform);

      case 'confidence_range':
        return this.confidenceRangeScenario(keyword, platform);

      case 'error':
        return this.errorScenario(keyword, platform);

      default:
        return this.mixedScenario(keyword, platform);
    }
  }

  /**
   * Scenario: All keywords cited on all platforms
   */
  allCitedScenario(keyword, platform) {
    return {
      cited: true,
      context: `${keyword} is highly recommended and frequently mentioned...`,
      rank: 1,
      confidence: 0.95
    };
  }

  /**
   * Scenario: No keywords cited
   */
  noneCitedScenario(keyword, platform) {
    return {
      cited: false,
      context: null,
      rank: null,
      confidence: 0
    };
  }

  /**
   * Scenario: Mix of cited and not cited
   */
  mixedScenario(keyword, platform) {
    // Use hash of keyword+platform for deterministic results
    const hash = this.hashString(keyword + platform);
    const cited = hash % 2 === 0;

    if (cited) {
      return {
        cited: true,
        context: `...${keyword} provides excellent solutions for...`,
        rank: (hash % 5) + 1,
        confidence: 0.7 + (this.rng() * 0.25)
      };
    }

    return {
      cited: false,
      context: null,
      rank: null,
      confidence: 0
    };
  }

  /**
   * Scenario: Results vary by platform
   */
  platformSpecificScenario(keyword, platform) {
    const platformCitations = {
      chatgpt: true,
      perplexity: true,
      claude: false,
      gemini: false
    };

    const cited = platformCitations[platform] ?? this.rng() > 0.5;

    return {
      cited,
      context: cited ? `On ${platform}: ${keyword} is mentioned...` : null,
      rank: cited ? Math.floor(this.rng() * 5) + 1 : null,
      confidence: cited ? 0.8 + (this.rng() * 0.15) : 0
    };
  }

  /**
   * Scenario: Range of confidence scores
   */
  confidenceRangeScenario(keyword, platform) {
    const confidence = this.rng();
    const cited = confidence > 0.3;

    return {
      cited,
      context: cited ? `${keyword} appears with varying confidence...` : null,
      rank: cited ? Math.ceil(confidence * 10) : null,
      confidence: cited ? confidence : 0
    };
  }

  /**
   * Scenario: Simulate errors
   */
  errorScenario(keyword, platform) {
    const errorTypes = ['E526', 'E527', 'E528'];
    const errorIndex = this.hashString(keyword) % errorTypes.length;

    throw {
      code: errorTypes[errorIndex],
      message: `Mock error: ${errorTypes[errorIndex]}`
    };
  }

  /**
   * Simple string hash function
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  /**
   * Get rate limit info (mock)
   * @returns {RateLimitInfo}
   */
  getRateLimit() {
    return {
      tier: 'mock',
      limit: 1000,
      remaining: 1000 - this.requestCount,
      resetAt: new Date(Date.now() + 86400000).toISOString(),
      period: 'day'
    };
  }

  /**
   * Get remaining quota
   */
  getQuotaRemaining() {
    return 1000 - this.requestCount;
  }

  /**
   * Reset mock state (for testing)
   */
  reset() {
    this.requestCount = 0;
    this.rng = this.createRNG(this.seed);
  }
}
```

## Mock Scenarios

### Scenario Reference

| Scenario | Description | Use Case |
|----------|-------------|----------|
| `all_cited` | All keywords cited on all platforms | Optimistic testing |
| `none_cited` | No citations found | Edge case testing |
| `mixed` | Deterministic mix based on keyword hash | General testing |
| `platform_specific` | ChatGPT/Perplexity cited, others not | Platform coverage testing |
| `confidence_range` | Range of confidence scores | Threshold testing |
| `error` | Simulates API errors | Error handling testing |

### Using Scenarios

```bash
# Test all-cited scenario
GEO_MOCK_MODE=true GEO_MOCK_SCENARIO=all_cited /seo-validate-geo "brand name" chatgpt

# Test error handling
GEO_MOCK_MODE=true GEO_MOCK_SCENARIO=error /seo-validate-geo "brand name" chatgpt

# Test with custom delay
GEO_MOCK_MODE=true GEO_MOCK_DELAY_MS=1000 /seo-validate-geo "brand name" chatgpt
```

## Test Fixtures

### Fixture Data

```javascript
/**
 * Pre-defined fixture data for specific keyword/platform combinations
 */
const MOCK_FIXTURES = {
  'simon_tools:chatgpt': {
    cited: true,
    context: 'simon_tools is a comprehensive framework for Claude Code...',
    rank: 1,
    confidence: 0.92
  },
  'simon_tools:perplexity': {
    cited: true,
    context: 'The simon_tools framework provides meta-development patterns...',
    rank: 2,
    confidence: 0.88
  },
  'nonexistent_brand:chatgpt': {
    cited: false,
    context: null,
    rank: null,
    confidence: 0
  }
};

/**
 * MockClient with fixture support
 */
class FixtureMockClient extends MockClient {
  constructor(options = {}) {
    super(options);
    this.fixtures = options.fixtures || MOCK_FIXTURES;
  }

  generateResult(keyword, platform) {
    const key = `${keyword}:${platform}`;

    // Check for fixture match
    if (this.fixtures[key]) {
      return this.fixtures[key];
    }

    // Fall back to parent scenario logic
    return super.generateResult(keyword, platform);
  }
}
```

### Loading Custom Fixtures

```javascript
// Load fixtures from file
import { readFileSync } from 'fs';

const customFixtures = JSON.parse(
  readFileSync('test/fixtures/geo-citations.json', 'utf-8')
);

const client = new FixtureMockClient({
  fixtures: customFixtures,
  scenario: 'mixed' // Fallback for non-fixture keywords
});
```

### Example Fixture File

```json
{
  "my_brand:chatgpt": {
    "cited": true,
    "context": "my_brand is a leading solution...",
    "rank": 1,
    "confidence": 0.95
  },
  "my_brand:perplexity": {
    "cited": true,
    "context": "According to my_brand documentation...",
    "rank": 3,
    "confidence": 0.78
  },
  "competitor:chatgpt": {
    "cited": false,
    "context": null,
    "rank": null,
    "confidence": 0
  }
}
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: GEO Validation Tests

on: [push, pull_request]

jobs:
  test-geo:
    runs-on: ubuntu-latest
    env:
      GEO_MOCK_MODE: 'true'
      GEO_MOCK_SCENARIO: 'mixed'

    steps:
      - uses: actions/checkout@v4

      - name: Run GEO validation
        run: |
          ./claude-code /seo-validate-geo "test_brand" chatgpt --json

      - name: Validate output schema
        run: |
          ./scripts/validate-geo-output.sh
```

### Pre-Commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Run GEO validation in mock mode
export GEO_MOCK_MODE=true
export GEO_MOCK_SCENARIO=platform_specific

if ! claude-code /seo-validate-geo "$BRAND_NAME" chatgpt --quiet; then
  echo "GEO validation failed"
  exit 1
fi
```

## Detecting Mock Mode in Output

### Output Identification

When mock mode is active, output includes clear indicators:

```
## GEO Citation Check (Mock Mode)

| Platform | Cited | Confidence | Rank |
|----------|-------|------------|------|
| chatgpt | Yes | 0.85 | 2 |
| perplexity | No | - | - |

⚠️ Results from mock mode - not real API data

**Scenario**: mixed
**Requests**: 2
```

### JSON Output

```json
{
  "keyword": "brand name",
  "results": [
    {
      "platform": "chatgpt",
      "cited": true,
      "confidence": 0.85,
      "source": "mock"
    }
  ],
  "metadata": {
    "mock_mode": true,
    "scenario": "mixed",
    "seed": 12345
  }
}
```

## Error Simulation

### Simulating Specific Errors

```javascript
// Create mock that fails with specific error
const errorMock = new MockClient({
  scenario: 'error'
});

// Or inject errors at specific request count
const quotaMock = new MockClient({
  scenario: 'mixed',
  failAfter: 5 // Fail with E527 after 5 requests
});
```

### Testing Error Handling

```javascript
// Test E526 (auth failure)
process.env.GEO_MOCK_ERROR = 'E526';
const result = await client.checkCitation('test', 'chatgpt');
assert(result.error === 'E526');

// Test E527 (quota exceeded)
process.env.GEO_MOCK_ERROR = 'E527';
const result2 = await client.checkCitation('test', 'perplexity');
assert(result2.error === 'E527');
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `GEO_MOCK_MODE` | false | Enable mock mode |
| `GEO_MOCK_SCENARIO` | mixed | Mock scenario to use |
| `GEO_MOCK_DELAY_MS` | 200 | Simulated network delay |
| `GEO_MOCK_SEED` | 12345 | RNG seed for reproducibility |
| `GEO_MOCK_FAIL_AFTER` | Infinity | Fail after N requests |
| `GEO_MOCK_ERROR` | - | Force specific error code |

## Related Resources

- `api-clients.md` - Unified interface and factory pattern
- `otterly-client.md` - Real Otterly API client
- `profound-client.md` - Real Profound API client
- `rate-limiting.md` - Rate limiting patterns
