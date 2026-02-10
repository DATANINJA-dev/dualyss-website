# Citation Result Schema

Standardized schema for AI platform citation detection results. Used by `/seo-validate-geo` command and all platform-specific detection implementations.

## CitationResult Interface

```typescript
interface CitationResult {
  // Platform identification
  platform: "chatgpt" | "perplexity" | "claude" | "gemini";

  // Core detection result
  cited: boolean;                    // Whether keyword/brand was cited

  // Citation context (when cited=true)
  context_snippet: string | null;    // Excerpt mentioning keyword (max 200 chars)
  rank: number | null;               // Position in response (1-10, null if unknown)

  // Confidence and method
  confidence: number;                // Detection confidence (0.0-1.0)
  method: "api" | "scraping" | "hybrid" | "stub";
  validated: boolean;                // Whether scraping validation was performed

  // Error handling
  error: string | null;              // Error code (E52X) if detection failed
  reason: string | null;             // Human-readable error reason

  // Metadata
  timestamp: string;                 // ISO 8601 timestamp of detection
  from_cache: boolean;               // Whether result was served from cache
}
```

## Field Specifications

### Platform (required)
- **Type**: Enum string
- **Values**: `"chatgpt"`, `"perplexity"`, `"claude"`, `"gemini"`
- **Description**: AI platform where citation was checked

### Cited (required)
- **Type**: Boolean
- **Description**: `true` if keyword/brand appears in AI response, `false` otherwise

### Context Snippet (conditional)
- **Type**: String or null
- **Constraints**: Maximum 200 characters
- **Description**: Excerpt from AI response containing the citation
- **When null**: Not cited, or detection failed, or scraping couldn't extract

### Rank (conditional)
- **Type**: Integer or null
- **Constraints**: 1-10 (position in response)
- **Description**: Where in the response the citation appears
- **When null**: Scraping-only detection, or rank unknown

### Confidence (required)
- **Type**: Float
- **Constraints**: 0.0 to 1.0
- **Description**: Detection confidence score
- **Thresholds**:
  - `>= 0.8`: High confidence (API confirmed or hybrid agreement)
  - `0.5-0.79`: Medium confidence (API-only or single method)
  - `< 0.5`: Low confidence (disagreement or scraping-only)

### Method (required)
- **Type**: Enum string
- **Values**:
  - `"api"`: Otterly API or similar service only
  - `"scraping"`: Web scraping only (API unavailable)
  - `"hybrid"`: Both API and scraping used
  - `"stub"`: Placeholder (platform not yet implemented)

### Validated (required)
- **Type**: Boolean
- **Description**: `true` if scraping validation was performed on API result
- **When true**: Result was cross-validated via web scraping

### Error (conditional)
- **Type**: String or null
- **Format**: E52X error code
- **Values**:
  - `"E520"`: GEO validation failed
  - `"E522"`: API rate limit exceeded
  - `"E523"`: Platform scraping blocked (CAPTCHA, etc.)
  - `"E526"`: Network timeout
  - `"E527"`: No citations found (informational)
  - `"E529"`: Authentication failed
- **When null**: Detection succeeded

### Reason (conditional)
- **Type**: String or null
- **Description**: Human-readable explanation of error or non-citation
- **Examples**: `"rate_limited"`, `"captcha_detected"`, `"not_mentioned"`, `"api_key_missing"`

### Timestamp (required)
- **Type**: String
- **Format**: ISO 8601 (`YYYY-MM-DDTHH:mm:ssZ`)
- **Description**: When detection was performed

### From Cache (required)
- **Type**: Boolean
- **Default**: `false`
- **Description**: `true` if result was served from 24h cache

## Example Results

### Successful Citation (Hybrid)
```json
{
  "platform": "chatgpt",
  "cited": true,
  "context_snippet": "...tools like Notion and Asana are popular choices for project management...",
  "rank": 2,
  "confidence": 0.92,
  "method": "hybrid",
  "validated": true,
  "error": null,
  "reason": null,
  "timestamp": "2026-01-15T14:30:00Z",
  "from_cache": false
}
```

### No Citation Found (API-only)
```json
{
  "platform": "chatgpt",
  "cited": false,
  "context_snippet": null,
  "rank": null,
  "confidence": 0.85,
  "method": "api",
  "validated": false,
  "error": null,
  "reason": "not_mentioned",
  "timestamp": "2026-01-15T14:31:00Z",
  "from_cache": false
}
```

### API Rate Limited (Fallback to Scraping)
```json
{
  "platform": "chatgpt",
  "cited": true,
  "context_snippet": "...best project management tools include...",
  "rank": null,
  "confidence": 0.7,
  "method": "scraping",
  "validated": true,
  "error": null,
  "reason": null,
  "timestamp": "2026-01-15T14:32:00Z",
  "from_cache": false
}
```

### Detection Failed
```json
{
  "platform": "chatgpt",
  "cited": false,
  "context_snippet": null,
  "rank": null,
  "confidence": 0.0,
  "method": "api",
  "validated": false,
  "error": "E526",
  "reason": "timeout",
  "timestamp": "2026-01-15T14:33:00Z",
  "from_cache": false
}
```

### Cached Result
```json
{
  "platform": "chatgpt",
  "cited": true,
  "context_snippet": "...Notion is a versatile tool...",
  "rank": 1,
  "confidence": 0.88,
  "method": "hybrid",
  "validated": true,
  "error": null,
  "reason": null,
  "timestamp": "2026-01-15T10:00:00Z",
  "from_cache": true
}
```

## Schema Evolution

### From TASK-135 Stub
The original stub schema in `/seo-validate-geo` (lines 187-222):
```javascript
{
  platform: string,
  cited: boolean,
  reason: string,
  method: "stub",
  error: null
}
```

### TASK-136 Additions
- `context_snippet`: Extract cited text for user review
- `rank`: Position tracking for citation prominence
- `confidence`: Numerical confidence for filtering/sorting
- `validated`: Track hybrid validation status
- `timestamp`: Enable caching and freshness checks
- `from_cache`: Indicate cached vs fresh results

## Integration Points

- **Command**: `/seo-validate-geo` Phase 3 (Citation Detection)
- **Error Codes**: `.claude/skills/error-handling/error-codes.md` (E52X range)
- **Platform Strategies**: `platform-strategies.md` (ChatGPT, Perplexity, Claude, Gemini)
- **Downstream Tasks**: TASK-138 (Otterly client), TASK-139 (Perplexity), TASK-140 (Claude/Gemini)
