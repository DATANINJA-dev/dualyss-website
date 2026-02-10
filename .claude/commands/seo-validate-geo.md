---
description: Check AI citation presence for keywords across AI search platforms (GEO) or validate technical GEO readiness of a URL
allowed-tools: Glob, Grep, Read, WebFetch, Bash
argument-hint: "<keyword> [--platform PLATFORM] [--format FORMAT] [--file PATH] | --technical <URL> [--timeout MS] [--json]"
---

# seo-validate-geo

Unified Generative Engine Optimization (GEO) validation command with two modes:
- **Citation Mode** (default): Check AI citation presence for keywords across AI search platforms (ChatGPT, Perplexity, Claude, Gemini)
- **Technical Mode** (`--technical`): Validate technical GEO readiness of a URL (TTFB, semantic HTML, JSON-LD, SSR, quotable content)

## When to Use

**Citation Mode**:
- To check if your brand/product appears in AI search results
- To track AI visibility for specific keywords over time
- To compare citation presence across different AI platforms
- In batch mode to validate multiple keywords at once

**Technical Mode**:
- To check if a page is optimized for AI crawler extraction
- To validate TTFB performance (target < 200ms for AI crawlers)
- To verify semantic HTML structure (headings, lists, tables)
- To detect JSON-LD schema for AI entity extraction
- To confirm server-side rendering (not JavaScript-only)

## Parameters

$ARGUMENTS = Keyword or phrase to check for citations (Citation Mode) OR URL to validate (Technical Mode with --technical flag)

**Citation Mode Flags**:
- `--platform PLATFORM`: Target platform(s) - chatgpt, perplexity, claude, gemini, all (default: all)
- `--format FORMAT`: Output format - console, json, csv (default: console)
- `--file PATH`: Path to file with keywords (one per line) for batch mode

**Technical Mode Flags** (TASK-141):
- `--technical <URL>`: Enable technical validation mode for the given URL (required for technical mode)
- `--timeout MS`: Connection timeout in milliseconds (default: 5000)
- `--json`: Output results in JSON format (equivalent to --format json)

## Instructions

### Phase 0: Input Validation

1. **Parse arguments**:
   - Check for `--technical` flag FIRST (determines mode)
   - If NOT technical mode:
     - Extract keyword from `$ARGUMENTS` (required unless --file provided)
     - Check for `--platform` flag (default: "all")
     - Check for `--format` flag (default: "console")
     - Check for `--file` flag (optional, batch mode)
   - If technical mode:
     - Extract URL after `--technical` flag
     - Check for `--timeout` flag (default: 5000)
     - Check for `--json` flag (default: false)

2. **Store flags for later phases**:
   ```
   # Determine mode first
   is_technical_mode = "--technical" flag present

   If is_technical_mode:
     technical_url = URL after "--technical"
     timeout_ms = "--timeout" value or 5000
     json_output = "--json" flag present
   Else:
     keyword = extracted keyword from arguments
     platform_flag = "--platform" value or "all"
     output_format = "--format" value or "console"
     file_path = "--file" value or null
   ```

3. **Validate keyword** (Citation Mode only - skip if technical mode):
   ```
   If NOT is_technical_mode:
     If keyword is empty AND file_path is null:
       [ERROR] E005: Missing required argument

       Details: Provide a keyword, use --file for batch mode, or use --technical for URL validation

       Suggested fix:
         → /seo-validate-geo "your keyword"
         → /seo-validate-geo --file keywords.txt
         → /seo-validate-geo --technical https://example.com
       Exit 1

     If keyword.length > 200:
       [ERROR] E524: Keyword too long

       Details: Keyword is [length] chars, max 200 allowed

       Suggested fix:
         → Shorten keyword to 200 characters or less
       Exit 1
   ```

4. **Validate platform flag** (Citation Mode only):
   ```
   If NOT is_technical_mode:
     valid_platforms = ["chatgpt", "perplexity", "claude", "gemini", "all"]

     If platform_flag not in valid_platforms:
       [ERROR] E521: Platform not supported

       Details: "[platform_flag]" is not a valid platform

       Suggested fix:
         → Use: chatgpt, perplexity, claude, gemini, all
       Exit 1
   ```

5. **Validate format flag** (Citation Mode only):
   ```
   If NOT is_technical_mode:
     valid_formats = ["console", "json", "csv"]

     If output_format not in valid_formats:
       [ERROR] E525: Invalid output format

       Details: "[output_format]" is not a valid format

       Suggested fix:
         → Use: console, json, csv
       Exit 1
   ```

### Phase 0.5: Technical Mode Input Validation (TASK-141)

**Note**: This phase only runs when `--technical` flag is present. If not in technical mode, skip to Phase 1.

6. **Validate technical URL** (Technical Mode only):
   ```
   If is_technical_mode:
     If technical_url is empty:
       [ERROR] E005: Missing required argument

       Details: --technical flag requires a URL

       Suggested fix:
         → /seo-validate-geo --technical https://example.com
       Exit 1

     # URL format validation (must have protocol)
     If NOT technical_url.match(/^https?:\/\//i):
       [ERROR] E540: Invalid URL format

       Details: URL must start with http:// or https://

       Suggested fix:
         → /seo-validate-geo --technical https://[technical_url]
       Exit 1

     # Validate timeout (if provided)
     If timeout_ms is not a positive integer:
       [ERROR] E540: Invalid URL format

       Details: --timeout must be a positive integer (milliseconds)

       Suggested fix:
         → /seo-validate-geo --technical [url] --timeout 5000
       Exit 1

     If timeout_ms < 1000 OR timeout_ms > 30000:
       [WARNING] Timeout value [timeout_ms]ms is outside recommended range (1000-30000ms)
   ```

7. **Route to Technical Validation** (Technical Mode only):
   ```
   If is_technical_mode:
     Print:
       GEO Technical Validation
       ========================
       URL: [technical_url]
       Timeout: [timeout_ms]ms
       Output: [json_output ? "JSON" : "Console"]

     # Skip Citation Mode phases (1-6), proceed directly to Phase T1
     GOTO Phase T1: TTFB Measurement
   ```

### Phase 1: Keyword Resolution (Citation Mode Only)

**Note**: Skip this phase if in technical mode.

6. **Resolve keywords to validate**:

   **Single keyword mode** (no --file):
   ```
   keywords = [keyword]
   ```

   **Batch mode** (--file provided):
   ```
   If file_path provided:
     Try:
       file_content = Read(file_path: file_path)
       keywords = file_content.split("\n").filter(line => line.trim().length > 0)

       # Validate each keyword length
       For each kw in keywords:
         If kw.length > 200:
           [ERROR] E524: Keyword too long

           Details: Keyword "[kw.substring(0,50)]..." is [length] chars

           Suggested fix:
             → Edit file to shorten keyword to 200 chars
           Exit 1
     Catch file error:
       [ERROR] E528: Invalid keyword file

       Details: Cannot read file: [file_path]

       Suggested fix:
         → Check file exists and is UTF-8 encoded
         → Use one keyword per line
       Exit 1
   ```

7. **Display keyword summary** (if not json output):
   ```
   If keywords.length == 1:
     Checking AI citations for: "[keyword]"
   Else:
     Checking AI citations for [N] keywords from [file_path]...
   ```

### Phase 2: Platform Selection

8. **Build platform list**:
   ```
   all_platforms = ["chatgpt", "perplexity", "claude", "gemini"]

   If platform_flag == "all":
     selected_platforms = all_platforms
   Else:
     selected_platforms = [platform_flag]
   ```

9. **Display platform summary** (if not json output):
   ```
   Platforms: [selected_platforms.join(", ")]
   ```

### Phase 2.5: API Configuration Check

**Check API availability** (TASK-138 integration):

10. **Verify API configuration**:

```
# Check environment variables for API keys
otterly_key = process.env.OTTERLY_API_KEY
profound_key = process.env.PROFOUND_API_KEY
mock_mode = process.env.GEO_MOCK_MODE === 'true'
preferred_api = process.env.GEO_PREFERRED_API || 'otterly'

# Determine which API client to use
If mock_mode:
  api_client = MockClient()
  [INFO] Running in mock mode - using test data
Else If profound_key AND preferred_api == 'profound':
  api_client = ProfoundClient({ apiKey: profound_key })
  [INFO] Using Profound API (tier: premium)
Else If otterly_key:
  api_client = OtterlyClient({ apiKey: otterly_key })
  tier = otterly_key.startsWith('ot_pro_') ? 'pro' : 'free'
  [INFO] Using Otterly API (tier: [tier])
Else:
  [ERROR] E529: No API configured

  Details: Neither OTTERLY_API_KEY nor PROFOUND_API_KEY found

  Suggested fix:
    → Set OTTERLY_API_KEY in environment or .env file
    → Or set PROFOUND_API_KEY for premium features
    → Or enable GEO_MOCK_MODE=true for testing
  Exit 2
```

11. **Check quota before proceeding** (if not mock mode):

```
If NOT mock_mode:
  rate_limit = api_client.getRateLimit()

  If rate_limit.remaining == 0:
    [ERROR] E522: API quota exceeded

    Details: [api_client.name] [rate_limit.tier] tier limit reached
             Resets: [rate_limit.resetAt]

    Options:
      → Wait for quota reset
      → Enable GEO_MOCK_MODE=true for testing
      → Upgrade tier for more requests
    Exit 2

  If rate_limit.remaining < keywords.length * selected_platforms.length:
    [WARNING] Quota may be insufficient

    Details: [rate_limit.remaining] requests remaining
             This operation requires [keywords.length * selected_platforms.length] requests

    Proceed anyway? (some results may fail)
```

### Phase 3: Citation Detection (Per Platform, Per Keyword)

**Platform-specific implementations**:
- **ChatGPT** (TASK-136): Hybrid API + scraping with 10% validation sampling
- **Perplexity** (TASK-139): Hybrid API + scraping (implemented)
- **Claude** (TASK-140): Scraping-only (no public API available)
- **Gemini** (TASK-140): Hybrid API + scraping (Vertex AI API + web fallback)

See skill documentation:
- `.claude/skills/seo-validation/chatgpt-detection.md` - **ChatGPT hybrid detection (TASK-136)**
- `.claude/skills/seo-validation/chatgpt-scraper.md` - Playwright scraper for ChatGPT
- `.claude/skills/seo-validation/claude-detection.md` - **Claude scraping detection (TASK-140)**
- `.claude/skills/seo-validation/gemini-detection.md` - **Gemini hybrid detection (TASK-140)**
- `.claude/skills/seo-validation/otterly-client.md` - Otterly API client
- `.claude/skills/geo-optimization-patterns/citation-schema.md` - CitationResult interface
- `.claude/skills/seo-validation/api-clients.md` - Unified interface
- `.claude/skills/seo-validation/rate-limiting.md` - Rate limit tracking
- `.claude/skills/seo-validation/mock-mode.md` - Mock mode for testing

12. **For each keyword, for each platform, detect citations**:

```
results = []

For each keyword in keywords:
  keyword_result = {
    "keyword": keyword,
    "timestamp": ISO_8601_NOW(),
    "platforms": []
  }

  For each platform in selected_platforms:
    # Use configured API client
    platform_result = detect_citation(keyword, platform, api_client)
    keyword_result.platforms.push(platform_result)

  results.push(keyword_result)
```

13. **Citation detection function** (platform-specific routing):

```
async function detect_citation(keyword, platform, api_client):
  # Route to platform-specific implementation
  If platform == "chatgpt":
    # TASK-136: Hybrid API + scraping detection
    # See: .claude/skills/seo-validation/chatgpt-detection.md
    return await detectCitationChatGPT(keyword, {
      sampleRate: 0.1,       # 10% validation sampling
      skipCache: false       # Use 24h cache
    })

  If platform == "perplexity":
    # TASK-139: Hybrid API + scraping detection
    # See: .claude/skills/geo-optimization-patterns/perplexity-detection.md
    return await detectCitationPerplexity(keyword, {
      sampleRate: 0.1,       # 10% validation sampling
      skipCache: false,      # Use 24h cache
      targetDomain: targetDomain  # Domain to check for citation
    })

  If platform == "claude":
    # TASK-140: Claude detection (scraping-only)
    # See: .claude/skills/seo-validation/claude-detection.md
    return await detectCitationClaude(keyword, {
      targetDomain: targetDomain,  # Domain to check for citation
      skipCache: false             # Use 24h session cache
    })

  If platform == "gemini":
    # TASK-140: Gemini detection (hybrid API + scraping)
    # See: .claude/skills/seo-validation/gemini-detection.md
    return await detectCitationGemini(keyword, {
      targetDomain: targetDomain,  # Domain to check for citation
      preferAPI: true,             # Use API if GEMINI_API_KEY set
      skipCache: false             # Use 24h session cache
    })

  # Unknown platform
  return { platform: platform, error: "E521", reason: "unsupported_platform" }

# Fallback for unimplemented platforms
function stub_not_implemented(platform):
  return {
    "platform": platform,
    "cited": false,
    "reason": "stub_not_implemented",
    "method": "stub",
    "error": null
  }

# Legacy API-only detection (for platforms without hybrid detection)
async function detect_citation_api_only(keyword, platform, api_client):
  Try:
    result = await api_client.checkCitation(keyword, platform)

    # Map API response to standard schema
    return {
      "platform": platform,
      "cited": result.cited,
      "context_snippet": result.context || null,
      "rank": result.rank || null,
      "confidence": result.confidence,
      "method": result.method || "api",
      "source": result.source,  # 'otterly', 'profound', 'mock'
      "error": result.error || null
    }

  Catch timeout_error:
    return {
      "platform": platform,
      "cited": false,
      "reason": "network_timeout",
      "error": "E526"
    }

  Catch auth_error:
    return {
      "platform": platform,
      "cited": false,
      "reason": "authentication_failed",
      "error": "E529"
    }

  Catch rate_limit_error:
    return {
      "platform": platform,
      "cited": false,
      "reason": "rate_limit_exceeded",
      "error": "E522"
    }

  Catch service_error:
    return {
      "platform": platform,
      "cited": false,
      "reason": "service_unavailable",
      "error": "E520"
    }
```

14. **Fallback handling** (if API fails and fallback enabled):

```
If process.env.GEO_FALLBACK_TO_SCRAPING == 'true':
  If platform_result.error in ['E520', 'E522', 'E526']:
    [INFO] API failed, attempting scraping fallback for [platform]...

    # Scraping fallback implemented in TASK-136, TASK-139, TASK-140
    fallback_result = scraping_fallback(keyword, platform)

    If fallback_result.success:
      platform_result = fallback_result
      platform_result.method = 'scraping'
```

### Phase 4: Result Aggregation

12. **Calculate summary statistics for each keyword result**:

```
For each result in results:
  platforms_checked = result.platforms.length
  citations_found = result.platforms.filter(p => p.cited == true).length
  citation_rate = citations_found / platforms_checked

  result.summary = {
    "total_platforms": platforms_checked,
    "citations_found": citations_found,
    "citation_rate": citation_rate
  }
```

13. **Calculate overall summary** (for batch mode):

```
If results.length > 1:
  total_keywords = results.length
  total_citations = sum(results.map(r => r.summary.citations_found))
  total_checks = sum(results.map(r => r.summary.total_platforms))
  average_citation_rate = total_citations / total_checks

  overall_summary = {
    "keywords_checked": total_keywords,
    "total_citations": total_citations,
    "total_platform_checks": total_checks,
    "average_citation_rate": average_citation_rate
  }
```

### Phase 5: Output Generation

14. **Generate output based on format**:

**Console output (default)**:
```
For each result in results:
  Print:

  Checking AI citations for: "[result.keyword]"
  Platforms: [selected_platforms.join(", ")]

  For each platform_result in result.platforms:
    If platform_result.cited:
      [OK] [Platform]: CITED (rank #[rank], confidence [confidence])
          "[context_snippet.substring(0,100)]..."
    Else if platform_result.error:
      [!!] [Platform]: ERROR ([error])
          [reason]
    Else:
      [X] [Platform]: NOT CITED
          Reason: [reason]

  Print:
  Summary: [citations_found]/[total_platforms] platforms ([citation_rate]% citation rate)

  If batch mode (results.length > 1):
    Print separator line between keywords

Print overall summary for batch:
If results.length > 1:
  ---
  Complete: [total_keywords] keywords processed
  Average citation rate: [average_citation_rate]%
```

**JSON output (--format json)**:
```json
{
  "validator": "geo",
  "timestamp": "[ISO_8601_NOW]",
  "keywords_validated": [N],
  "platforms": ["chatgpt", "perplexity", "claude", "gemini"],
  "results": [
    {
      "keyword": "[keyword]",
      "timestamp": "[ISO_8601]",
      "platforms": [
        {
          "platform": "chatgpt",
          "cited": true,
          "context_snippet": "...",
          "rank": 2,
          "confidence": 0.85,
          "method": "api"
        }
      ],
      "summary": {
        "total_platforms": 4,
        "citations_found": 2,
        "citation_rate": 0.5
      }
    }
  ],
  "overall_summary": {
    "keywords_checked": [N],
    "total_citations": [N],
    "average_citation_rate": [X.XX]
  }
}
```

**CSV output (--format csv)**:
```csv
keyword,platform,cited,rank,confidence,context_snippet,method,error
"best project management tool",chatgpt,true,2,0.85,"...Notion and Asana...",api,
"best project management tool",perplexity,false,,,,stub,stub_not_implemented
"best project management tool",claude,true,1,0.92,"...tools like Notion...",api,
"best project management tool",gemini,false,,,,stub,stub_not_implemented
```

15. **Progress indicators for batch mode**:
```
If batch mode AND output_format == "console":
  For each keyword (index i):
    Print: [i+1/total] "[keyword.substring(0,40)]..." - [citations]/[platforms] cited
```

### Phase 6: Exit Code (Citation Mode)

16. **Determine exit code**:

```
has_errors = results.some(r =>
  r.platforms.some(p => p.error && ["E520", "E522", "E523", "E526", "E529"].includes(p.error))
)

has_citations = results.some(r =>
  r.platforms.some(p => p.cited == true)
)

If has_errors with fatal codes (E520, E522, E523, E526, E529):
  Exit 2  # System error
Else if all platforms return stub_not_implemented:
  # Foundational task - stubs are expected
  Exit 0
Else if has_citations:
  Exit 0  # Success with citations
Else:
  # No citations found (E527 is informational)
  Exit 0  # Not an error, just no citations
```

---

## Technical Mode Phases (TASK-141)

**Note**: These phases only execute when `--technical` flag is present. They run instead of Citation Mode phases 1-6.

### Phase T1: TTFB Measurement

**Purpose**: Measure Time to First Byte to ensure AI crawlers can access content quickly.
- Target: < 200ms (optimal for AI crawlers)
- Warning: 200-500ms (may slow AI crawling)
- Fail: > 500ms (likely to be skipped by AI crawlers)

1. **Measure TTFB using curl**:
   ```
   # Use curl with timing output format
   # time_starttransfer = time until first byte received
   command = "curl -o /dev/null -s -w '%{time_starttransfer}' --max-time [timeout_ms/1000] '[technical_url]'"

   Try:
     result = Bash(command)
     ttfb_seconds = parseFloat(result)
     ttfb_ms = Math.round(ttfb_seconds * 1000)

   Catch timeout_error:
     [ERROR] E546: Connection timeout

     Details: Failed to connect within [timeout_ms]ms

     Suggested fix:
       → Check if URL is accessible
       → Increase timeout with --timeout flag
       → Verify network connectivity
     Exit 2

   Catch dns_error (if result contains "Could not resolve host"):
     [ERROR] E547: DNS resolution failed

     Details: Cannot resolve hostname from URL

     Suggested fix:
       → Check URL spelling
       → Verify domain exists
     Exit 2

   Catch ssl_error (if result contains "SSL certificate problem"):
     [ERROR] E548: SSL certificate error

     Details: SSL/TLS handshake failed

     Suggested fix:
       → Check certificate validity
       → Use http:// if SSL not required
     Exit 2
   ```

2. **Score TTFB result**:
   ```
   ttfb_check = {
     "check": "ttfb",
     "value": ttfb_ms + "ms",
     "target": "< 200ms"
   }

   If ttfb_ms < 200:
     ttfb_check.status = "PASS"
     ttfb_check.points = 20
     ttfb_check.message = "Excellent - optimal for AI crawlers"
   Else If ttfb_ms < 500:
     ttfb_check.status = "WARN"
     ttfb_check.points = 10
     ttfb_check.message = "Acceptable but may slow AI crawling"
   Else:
     ttfb_check.status = "FAIL"
     ttfb_check.points = 0
     ttfb_check.message = "Too slow - likely to be skipped by AI crawlers"
     # Note: Don't exit here, continue with other checks
   ```

3. **Store TTFB result for aggregation**:
   ```
   technical_results = []
   technical_results.push(ttfb_check)

   # Display progress (if not JSON output)
   If NOT json_output:
     Print: "[ttfb_check.status] TTFB: [ttfb_ms]ms (target: < 200ms)"
   ```

### Phase T2: Semantic HTML Validation

**Purpose**: Validate HTML structure for optimal AI content extraction.
- Proper heading hierarchy helps AI understand content structure
- Lists and tables provide structured data for AI extraction
- Semantic HTML improves content accessibility for AI crawlers

1. **Fetch HTML content**:
   ```
   # Use WebFetch to get HTML content
   html_content = WebFetch(url: technical_url, prompt: "Return the raw HTML content")

   If html_content is empty or error:
     [ERROR] E549: GEO technical validation failed

     Details: Unable to fetch HTML content from [technical_url]

     Suggested fix:
       → Verify URL is accessible
       → Check network connectivity
     Exit 2
   ```

2. **Check 1: Single H1 validation**:
   ```
   # Count H1 tags (case-insensitive)
   h1_matches = html_content.match(/<h1[^>]*>/gi) || []
   h1_count = h1_matches.length

   h1_check = {
     "check": "single_h1",
     "value": h1_count,
     "target": "1"
   }

   If h1_count == 1:
     h1_check.status = "PASS"
     h1_check.points = 6.25  # 25 total for semantic / 4 checks
     h1_check.message = "Single H1 tag found"
   Else If h1_count == 0:
     h1_check.status = "WARN"
     h1_check.points = 3
     h1_check.message = "No H1 tag found - add a main heading"
   Else:
     h1_check.status = "WARN"
     h1_check.points = 3
     h1_check.message = h1_count + " H1 tags found - use only one"

   technical_results.push(h1_check)
   ```

3. **Check 2: Heading hierarchy validation**:
   ```
   # Extract all heading levels
   heading_pattern = /<h([1-6])[^>]*>/gi
   headings = []
   While match = heading_pattern.exec(html_content):
     headings.push(parseInt(match[1]))

   # Check for skipped levels (e.g., h1 → h3 without h2)
   skipped_levels = 0
   previous_level = 0
   For each level in headings:
     If previous_level > 0 AND level > previous_level + 1:
       skipped_levels++
     previous_level = level

   hierarchy_check = {
     "check": "heading_hierarchy",
     "value": skipped_levels == 0 ? "No skips" : skipped_levels + " skip(s)",
     "target": "No skips"
   }

   If skipped_levels == 0:
     hierarchy_check.status = "PASS"
     hierarchy_check.points = 6.25
     hierarchy_check.message = "Heading hierarchy is correct"
   Else If skipped_levels == 1:
     hierarchy_check.status = "WARN"
     hierarchy_check.points = 3
     hierarchy_check.message = "One heading level skipped - consider adding intermediate headings"
   Else:
     hierarchy_check.status = "FAIL"
     hierarchy_check.points = 0
     hierarchy_check.message = skipped_levels + " heading levels skipped - fix hierarchy"

   technical_results.push(hierarchy_check)
   ```

4. **Check 3: Lists present validation**:
   ```
   # Count list elements
   ul_count = (html_content.match(/<ul[^>]*>/gi) || []).length
   ol_count = (html_content.match(/<ol[^>]*>/gi) || []).length
   dl_count = (html_content.match(/<dl[^>]*>/gi) || []).length
   total_lists = ul_count + ol_count + dl_count

   # Estimate word count for context
   text_only = html_content.replace(/<[^>]+>/g, ' ')
   word_count = text_only.split(/\s+/).filter(w => w.length > 0).length

   lists_check = {
     "check": "lists_present",
     "value": total_lists,
     "target": ">= 2 (for content > 500 words)"
   }

   # Only penalize missing lists if content is substantial
   If word_count < 500:
     lists_check.status = "PASS"
     lists_check.points = 6.25
     lists_check.message = "Short content - lists optional"
   Else If total_lists >= 2:
     lists_check.status = "PASS"
     lists_check.points = 6.25
     lists_check.message = total_lists + " lists found - good structure"
   Else If total_lists == 1:
     lists_check.status = "WARN"
     lists_check.points = 3
     lists_check.message = "Only 1 list found - consider adding more structured content"
   Else:
     lists_check.status = "FAIL"
     lists_check.points = 0
     lists_check.message = "No lists found - add structured content for AI extraction"

   technical_results.push(lists_check)
   ```

5. **Check 4: Tables with headers validation**:
   ```
   # Check for tables
   tables = html_content.match(/<table[^>]*>[\s\S]*?<\/table>/gi) || []
   tables_count = tables.length

   tables_check = {
     "check": "tables_with_headers",
     "target": "Tables have <th> headers"
   }

   If tables_count == 0:
     tables_check.status = "PASS"
     tables_check.value = "N/A (no tables)"
     tables_check.points = 6.25
     tables_check.message = "No tables present - not applicable"
   Else:
     # Check if tables have <th> elements
     tables_with_headers = 0
     For each table in tables:
       If table.match(/<th[^>]*>/gi):
         tables_with_headers++

     tables_check.value = tables_with_headers + "/" + tables_count + " have headers"

     If tables_with_headers == tables_count:
       tables_check.status = "PASS"
       tables_check.points = 6.25
       tables_check.message = "All tables have proper headers"
     Else If tables_with_headers > 0:
       tables_check.status = "WARN"
       tables_check.points = 3
       tables_check.message = "Some tables missing headers - add <th> for AI extraction"
     Else:
       tables_check.status = "FAIL"
       tables_check.points = 0
       tables_check.message = "No tables have headers - add <th> elements"

   technical_results.push(tables_check)
   ```

6. **Aggregate semantic HTML score**:
   ```
   semantic_checks = [h1_check, hierarchy_check, lists_check, tables_check]
   semantic_passes = semantic_checks.filter(c => c.status == "PASS").length
   semantic_total_points = semantic_checks.reduce((sum, c) => sum + c.points, 0)

   # If ALL semantic checks fail, emit warning (not error - continue validation)
   If semantic_passes == 0:
     [WARNING] E541: No semantic HTML structure detected

     Details: All semantic HTML checks failed

     Recommendation: Add proper heading hierarchy, lists, or tables

   # Display progress (if not JSON output)
   If NOT json_output:
     Print: "[h1_check.status] Single H1: [h1_check.value] (target: 1)"
     Print: "[hierarchy_check.status] Heading Hierarchy: [hierarchy_check.value]"
     Print: "[lists_check.status] Lists: [lists_check.value]"
     Print: "[tables_check.status] Tables: [tables_check.value]"
   ```

### Phase T3: JSON-LD Schema Validation

**Purpose**: Validate JSON-LD structured data for AI entity extraction.
- AI platforms use schema.org types to understand content entities
- High-value types: Article, FAQ, HowTo, Recipe (for citations)
- Medium-value types: Product, Organization, Person

1. **Extract JSON-LD scripts**:
   ```
   # Extract all JSON-LD script blocks
   jsonld_pattern = /<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi
   jsonld_blocks = []

   While match = jsonld_pattern.exec(html_content):
     jsonld_blocks.push(match[1])

   jsonld_check = {
     "check": "json_ld",
     "target": "AI-preferred @type present"
   }

   If jsonld_blocks.length == 0:
     jsonld_check.status = "FAIL"
     jsonld_check.value = "No JSON-LD found"
     jsonld_check.points = 0
     jsonld_check.message = "No JSON-LD structured data - add schema.org markup"
     technical_results.push(jsonld_check)
     # Continue to next phase (don't exit)
     GOTO Phase T4
   ```

2. **Parse and validate JSON-LD**:
   ```
   # Define AI-preferred types
   high_value_types = ["Article", "NewsArticle", "BlogPosting", "FAQ", "HowTo", "Recipe", "QAPage"]
   medium_value_types = ["Product", "Organization", "Person", "LocalBusiness", "WebPage"]

   detected_types = []
   parse_errors = 0

   For each block in jsonld_blocks:
     Try:
       data = JSON.parse(block.trim())

       # Handle @graph arrays
       If data["@graph"]:
         For each item in data["@graph"]:
           If item["@type"]:
             detected_types.push(item["@type"])
       Else If data["@type"]:
         detected_types.push(data["@type"])

     Catch parse_error:
       parse_errors++
   ```

3. **Score JSON-LD quality**:
   ```
   # Flatten array types (some have multiple types)
   all_types = detected_types.flat()

   has_high_value = all_types.some(t => high_value_types.includes(t))
   has_medium_value = all_types.some(t => medium_value_types.includes(t))

   jsonld_check.value = all_types.length > 0 ? all_types.join(", ") : "Invalid JSON"

   If parse_errors > 0 AND detected_types.length == 0:
     jsonld_check.status = "FAIL"
     jsonld_check.points = 0
     jsonld_check.message = "JSON-LD parse error - fix syntax"
   Else If has_high_value:
     jsonld_check.status = "PASS"
     jsonld_check.points = 20
     jsonld_check.message = "High-value schema types detected - excellent for AI citations"
   Else If has_medium_value:
     jsonld_check.status = "WARN"
     jsonld_check.points = 10
     jsonld_check.message = "Medium-value types found - consider adding Article, FAQ, or HowTo"
   Else If all_types.length > 0:
     jsonld_check.status = "WARN"
     jsonld_check.points = 5
     jsonld_check.message = "Generic types found - add AI-preferred types for better extraction"
   Else:
     jsonld_check.status = "FAIL"
     jsonld_check.points = 0
     jsonld_check.message = "No valid @type found in JSON-LD"

   technical_results.push(jsonld_check)

   # Emit warning if no JSON-LD at all
   If jsonld_check.status == "FAIL" AND jsonld_blocks.length == 0:
     [WARNING] E542: Missing JSON-LD schema

     Details: No structured data found

     Recommendation: Add schema.org JSON-LD with Article, FAQ, or HowTo type

   # Display progress (if not JSON output)
   If NOT json_output:
     Print: "[jsonld_check.status] JSON-LD: [jsonld_check.value]"
   ```

### Phase T4: Quotable Content Detection

**Purpose**: Detect content elements that AI platforms can easily extract for citations.
- Blockquotes: Direct quotes are highly citable
- Statistics: Numbers, percentages, dollar amounts
- Highlighted text: Strong/mark tags with substantial content
- Definition lists: Key-value pairs for structured data
- Callout boxes: Highlighted sections with class markers

1. **Pattern 1: Blockquotes**:
   ```
   blockquotes = html_content.match(/<blockquote[^>]*>[\s\S]*?<\/blockquote>/gi) || []
   blockquote_count = blockquotes.length
   ```

2. **Pattern 2: Statistics**:
   ```
   # Remove HTML tags for text analysis
   text_content = html_content.replace(/<[^>]+>/g, ' ')

   # Count percentages (e.g., 45%, 100.5%)
   percentages = text_content.match(/\d+(?:\.\d+)?%/g) || []

   # Count dollar amounts (e.g., $1,000, $45.99)
   dollar_amounts = text_content.match(/\$[\d,]+(?:\.\d{2})?/g) || []

   # Count other numbers with context (e.g., "10 million users")
   contextual_numbers = text_content.match(/\d+(?:,\d{3})*\s+(?:million|billion|thousand|users|customers|downloads)/gi) || []

   statistics_count = percentages.length + dollar_amounts.length + contextual_numbers.length
   ```

3. **Pattern 3: Highlighted text**:
   ```
   # Strong tags with 20+ characters of content
   strong_matches = html_content.match(/<strong[^>]*>[^<]{20,}<\/strong>/gi) || []

   # Mark tags (highlighting)
   mark_matches = html_content.match(/<mark[^>]*>[^<]+<\/mark>/gi) || []

   highlighted_count = strong_matches.length + mark_matches.length
   ```

4. **Pattern 4: Definition lists**:
   ```
   # Definition lists with dt/dd pairs
   dl_matches = html_content.match(/<dl[^>]*>[\s\S]*?<\/dl>/gi) || []
   definition_count = 0

   For each dl in dl_matches:
     dt_count = (dl.match(/<dt[^>]*>/gi) || []).length
     definition_count += dt_count
   ```

5. **Pattern 5: Callout boxes**:
   ```
   # Divs with callout-related classes
   callout_pattern = /<div[^>]*class="[^"]*(?:callout|highlight|key|important|note|tip|warning|info)[^"]*"[^>]*>/gi
   callout_matches = html_content.match(callout_pattern) || []
   callout_count = callout_matches.length
   ```

6. **Aggregate quotable content**:
   ```
   total_quotables = blockquote_count + statistics_count + highlighted_count + definition_count + callout_count

   quotables_check = {
     "check": "quotable_content",
     "value": total_quotables,
     "target": ">= 5"
   }

   If total_quotables >= 5:
     quotables_check.status = "PASS"
     quotables_check.points = 15
     quotables_check.message = "Good quotable content density"
   Else If total_quotables >= 2:
     quotables_check.status = "WARN"
     quotables_check.points = 8
     quotables_check.message = "Add more blockquotes, statistics, or highlighted facts"
   Else:
     quotables_check.status = "FAIL"
     quotables_check.points = 0
     quotables_check.message = "Insufficient quotable content for AI citations"

   technical_results.push(quotables_check)

   # Emit warning if no quotable content
   If total_quotables == 0:
     [WARNING] E544: No quotable content found

     Details: No blockquotes, statistics, or highlighted text detected

     Recommendation: Add statistics, quotes, or highlighted key facts

   # Display progress (if not JSON output)
   If NOT json_output:
     Print: "[quotables_check.status] Quotable Content: [total_quotables] items"
     If verbose:
       Print: "  - Blockquotes: [blockquote_count]"
       Print: "  - Statistics: [statistics_count]"
       Print: "  - Highlighted: [highlighted_count]"
       Print: "  - Definitions: [definition_count]"
       Print: "  - Callouts: [callout_count]"
   ```

### Phase T5: Server-Side Rendering Detection

**Purpose**: Detect whether content is server-rendered (SSR) or JavaScript-only (CSR).
- AI crawlers typically don't execute JavaScript
- Content must be present in initial HTML response
- JS-only sites are invisible to AI crawlers

1. **Check content indicators (SSR positive signals)**:
   ```
   # Check 1: Text content length in body
   # Extract body content
   body_match = html_content.match(/<body[^>]*>([\s\S]*)<\/body>/i)
   body_content = body_match ? body_match[1] : html_content

   # Remove script and style tags for text analysis
   text_only = body_content
     .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
     .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
     .replace(/<[^>]+>/g, ' ')
     .replace(/\s+/g, ' ')
     .trim()

   body_text_length = text_only.length

   # Check 2: Semantic content containers with content
   article_content = (html_content.match(/<article[^>]*>[\s\S]{100,}?<\/article>/gi) || []).length
   main_content = (html_content.match(/<main[^>]*>[\s\S]{100,}?<\/main>/gi) || []).length
   section_content = (html_content.match(/<section[^>]*>[\s\S]{100,}?<\/section>/gi) || []).length
   semantic_containers = article_content + main_content + section_content

   # Check 3: Meta viewport tag (indicates mobile rendering)
   has_viewport = html_content.match(/<meta[^>]*name="viewport"[^>]*>/i) != null
   ```

2. **Detect JS-only patterns (CSR negative signals)**:
   ```
   # Pattern 1: Empty root div (React/Vue/Angular SPA pattern)
   empty_root = html_content.match(/<div\s+id="(root|app|__next)"[^>]*>\s*<\/div>/i) != null

   # Pattern 2: Empty root with only whitespace/comments
   root_with_placeholder = html_content.match(/<div\s+id="(root|app|__next)"[^>]*>[\s<!--\->]*<\/div>/i) != null

   # Pattern 3: Noscript warnings (indicates JS dependency)
   noscript_warning = html_content.match(/<noscript[^>]*>[\s\S]*?(enable|javascript|browser)[^<]*<\/noscript>/i) != null

   # Pattern 4: Bundle scripts that suggest SPA
   has_bundle_scripts = html_content.match(/<script[^>]*src="[^"]*(?:main|bundle|app|chunk)\.[a-f0-9]+\.js"[^>]*>/i) != null

   # Pattern 5: Minimal body with only script tags
   scripts_only = body_text_length < 100 AND html_content.match(/<script[^>]*>/gi)?.length > 2
   ```

3. **Determine SSR status**:
   ```
   ssr_check = {
     "check": "ssr",
     "target": "Server-rendered content"
   }

   # Calculate SSR confidence
   ssr_positive_signals = 0
   csr_negative_signals = 0

   # Positive signals (content is server-rendered)
   If body_text_length > 500: ssr_positive_signals += 2
   Else If body_text_length > 200: ssr_positive_signals += 1
   If semantic_containers > 0: ssr_positive_signals += 1
   If has_viewport: ssr_positive_signals += 1

   # Negative signals (content is JS-only)
   If empty_root OR root_with_placeholder: csr_negative_signals += 3
   If noscript_warning: csr_negative_signals += 1
   If scripts_only: csr_negative_signals += 2
   If has_bundle_scripts AND body_text_length < 200: csr_negative_signals += 1

   # Determine final status
   If csr_negative_signals >= 3:
     # Strong JS-only indicators
     ssr_check.status = "FAIL"
     ssr_check.value = "JavaScript-only (no SSR)"
     ssr_check.points = 0
     ssr_check.message = "Content not visible to AI crawlers - implement SSR"
   Else If ssr_positive_signals >= 2 AND csr_negative_signals == 0:
     # Strong SSR indicators, no negative signals
     ssr_check.status = "PASS"
     ssr_check.value = "Server-rendered"
     ssr_check.points = 20
     ssr_check.message = "Content visible to AI crawlers"
   Else If ssr_positive_signals >= 1:
     # Mixed signals - partial SSR
     ssr_check.status = "WARN"
     ssr_check.value = "Partial SSR"
     ssr_check.points = 10
     ssr_check.message = "Some content server-rendered, some may be JS-dependent"
   Else:
     # Insufficient content for confident detection
     ssr_check.status = "WARN"
     ssr_check.value = "Uncertain"
     ssr_check.points = 10
     ssr_check.message = "Unable to determine SSR status - verify manually"

   technical_results.push(ssr_check)
   ```

4. **Emit warning if JS-only detected**:
   ```
   If ssr_check.status == "FAIL":
     [WARNING] E543: JavaScript-only content (no SSR)

     Details: Content appears to be client-side rendered only.
     AI crawlers (ChatGPT, Perplexity, Claude, Gemini) do not execute JavaScript.

     Signals detected:
       - Empty root container: [empty_root ? "Yes" : "No"]
       - Noscript warning: [noscript_warning ? "Yes" : "No"]
       - Body text length: [body_text_length] characters

     Recommendation:
       → Implement server-side rendering (Next.js, Nuxt, Remix)
       → Or use static site generation (SSG)
       → Or pre-render critical pages

   # Display progress (if not JSON output)
   If NOT json_output:
     Print: "[ssr_check.status] SSR: [ssr_check.value]"
     If verbose:
       Print: "  - Body text: [body_text_length] chars"
       Print: "  - Semantic containers: [semantic_containers]"
       Print: "  - Empty root detected: [empty_root OR root_with_placeholder ? 'Yes' : 'No']"
   ```

### Phase T6: Result Aggregation and Output

**Purpose**: Aggregate all check results, calculate GEO Readiness Score, and format output.
- Score calculation: 100 points total across all checks
- Console output: Table format for readability
- JSON output: Structured for CI/CD integration

1. **Calculate GEO Readiness Score**:
   ```
   # Point distribution (100 total):
   # - TTFB: 20 points max
   # - Semantic HTML: 25 points max (4 checks × 6.25)
   # - JSON-LD: 20 points max
   # - Quotables: 15 points max
   # - SSR: 20 points max

   total_points = 0
   max_points = 100

   For each check in technical_results:
     total_points += check.points

   geo_readiness_score = Math.round((total_points / max_points) * 100)
   ```

2. **Count pass/warn/fail**:
   ```
   summary = {
     "pass": 0,
     "warn": 0,
     "fail": 0
   }

   For each check in technical_results:
     If check.status == "PASS": summary.pass++
     Else If check.status == "WARN": summary.warn++
     Else If check.status == "FAIL": summary.fail++
   ```

3. **Generate console output** (if NOT json_output):
   ```
   Print:

   GEO Technical Validation: [technical_url]
   =============================================

   | Check | Status | Value | Target |
   |-------|--------|-------|--------|

   For each check in technical_results:
     status_icon = check.status == "PASS" ? "PASS" :
                   check.status == "WARN" ? "WARN" :
                   "FAIL"
     Print: "| [check.check] | [status_icon] | [check.value] | [check.target] |"

   Print:
   ---------------------------------------------
   Overall: [summary.pass]/[technical_results.length] passed, [summary.warn] warning(s), [summary.fail] failure(s)
   GEO Readiness Score: [geo_readiness_score]%

   # Provide recommendations for failures
   If summary.fail > 0:
     Print:
     ## Recommendations

     For each check in technical_results where check.status == "FAIL":
       Print: "- [check.check]: [check.message]"

   # Provide tips for warnings
   If summary.warn > 0:
     Print:
     ## Improvements

     For each check in technical_results where check.status == "WARN":
       Print: "- [check.check]: [check.message]"
   ```

4. **Generate JSON output** (if json_output):
   ```json
   {
     "validator": "geo-technical",
     "url": "[technical_url]",
     "timestamp": "[ISO_8601_NOW]",
     "score": [geo_readiness_score],
     "checks": [
       {
         "check": "ttfb",
         "status": "pass|warn|fail",
         "value": "[value]",
         "target": "[target]",
         "points": [N],
         "message": "[message]"
       },
       {
         "check": "single_h1",
         "status": "pass|warn|fail",
         "value": "[value]",
         "target": "[target]",
         "points": [N],
         "message": "[message]"
       },
       // ... other checks
     ],
     "summary": {
       "pass": [N],
       "warn": [N],
       "fail": [N],
       "total": [technical_results.length]
     }
   }

   # Output JSON
   Print: JSON.stringify(output, null, 2)
   ```

5. **Determine exit code**:
   ```
   # Exit codes for technical mode:
   # - 0: All checks PASS or WARN (acceptable)
   # - 1: Any check FAIL (needs attention)
   # - 2: System error (already handled in earlier phases)

   If summary.fail > 0:
     # At least one check failed
     If NOT json_output:
       Print:
       [INFO] Exit 1: Some checks failed. Address recommendations above.
     Exit 1
   Else:
     # All checks passed or warned
     If NOT json_output:
       Print:
       [OK] GEO Technical Validation Complete
     Exit 0
   ```

6. **Final output summary** (verbose mode):
   ```
   If verbose AND NOT json_output:
     Print:
     ## Detailed Breakdown

     ### TTFB Performance (20 points max)
     - Measured: [ttfb_check.value]
     - Points: [ttfb_check.points]/20
     - Status: [ttfb_check.message]

     ### Semantic HTML (25 points max)
     - Single H1: [h1_check.points]/6.25
     - Hierarchy: [hierarchy_check.points]/6.25
     - Lists: [lists_check.points]/6.25
     - Tables: [tables_check.points]/6.25

     ### JSON-LD Schema (20 points max)
     - Detected: [jsonld_check.value]
     - Points: [jsonld_check.points]/20

     ### Quotable Content (15 points max)
     - Count: [quotables_check.value]
     - Points: [quotables_check.points]/15

     ### Server-Side Rendering (20 points max)
     - Status: [ssr_check.value]
     - Points: [ssr_check.points]/20

     ### Total Score
     - Points: [total_points]/[max_points]
     - Percentage: [geo_readiness_score]%
   ```

---

## Error Codes

### Citation Mode (E52X)

| Code | Description | Exit |
|------|-------------|------|
| E005 | Missing required argument | 1 |
| E520 | GEO validation failed | 2 |
| E521 | Platform not supported | 1 |
| E522 | API rate limit exceeded | 2 |
| E523 | Platform scraping blocked | 2 |
| E524 | Keyword too long | 1 |
| E525 | Invalid output format | 1 |
| E526 | Network timeout | 2 |
| E527 | No citations found (informational) | 0 |
| E528 | Invalid keyword file | 1 |
| E529 | Authentication failed | 2 |

### Technical Mode (E54X) - TASK-141

| Code | Description | Exit |
|------|-------------|------|
| E540 | Invalid URL format | 1 |
| E541 | No semantic HTML structure | 1 |
| E542 | Missing JSON-LD schema | 1 |
| E543 | JavaScript-only content (no SSR) | 1 |
| E544 | No quotable content found | 1 |
| E545 | TTFB exceeds threshold | 1 |
| E546 | Connection timeout | 2 |
| E547 | DNS resolution failed | 2 |
| E548 | SSL certificate error | 2 |
| E549 | GEO technical validation failed | 2 |

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Validation completed successfully (with or without citations) |
| 1 | User input error (invalid platform, format, keyword) |
| 2 | System error (API failure, network timeout) |

## Supported Platforms

| Platform | Detection Method | Implementation |
|----------|-----------------|----------------|
| ChatGPT | OpenAI API + web scraping | TASK-136 |
| Perplexity | API + web scraping (hybrid) | TASK-139 |
| Claude | Web scraping only (no public API) | TASK-140 |
| Gemini | Google Generative AI API + web scraping | TASK-140 |

## Citation Report Schema

```json
{
  "keyword": "best project management tool",
  "timestamp": "2026-01-15T14:30:00Z",
  "platforms": [
    {
      "platform": "chatgpt",
      "cited": true,
      "context_snippet": "...Notion and Asana are popular choices...",
      "rank": 2,
      "confidence": 0.85,
      "method": "api"
    },
    {
      "platform": "perplexity",
      "cited": false,
      "reason": "not_mentioned",
      "method": "scraping"
    }
  ],
  "summary": {
    "total_platforms": 4,
    "citations_found": 2,
    "citation_rate": 0.5
  }
}
```

## Examples

### Check single keyword across all platforms
```
/seo-validate-geo "best project management tool"
```

### Check specific platform only
```
/seo-validate-geo "notion vs asana" --platform chatgpt
```

### JSON output for CI/CD integration
```
/seo-validate-geo "your brand name" --format json
```

### CSV output for spreadsheet analysis
```
/seo-validate-geo "your product" --format csv
```

### Batch mode with keyword file
```
/seo-validate-geo --file keywords.txt --format json
```

### Check single platform with JSON output
```
/seo-validate-geo "ai code assistant" --platform claude --format json
```

### Technical Mode: Validate URL for AI crawler readiness (TASK-141)
```
/seo-validate-geo --technical https://example.com
```

### Technical Mode: JSON output for CI/CD
```
/seo-validate-geo --technical https://example.com --json
```

### Technical Mode: Custom timeout
```
/seo-validate-geo --technical https://slow-site.com --timeout 10000
```

## Reference Skills

- `geo-optimization-patterns`: Platform strategies, citation optimization
- `error-handling`: Standardized error codes (E52X range)
- `seo-validation`: Validation result schema patterns
- `seo-validation/api-clients`: Unified API client interface (TASK-138)
- `seo-validation/otterly-client`: Otterly API patterns (TASK-138)
- `seo-validation/profound-client`: Profound API patterns (TASK-138)
- `seo-validation/rate-limiting`: Rate limit and backoff patterns (TASK-138)
- `seo-validation/mock-mode`: Mock client for testing (TASK-138)
- `seo-validation/claude-detection`: Claude citation detection (TASK-140)
- `seo-validation/gemini-detection`: Gemini citation detection (TASK-140)
- `seo-validation/fixtures`: Test fixtures for Claude/Gemini (TASK-140)

## Notes

- **API Clients (TASK-138)**: Otterly and Profound API integration is complete:
  - Configure via `OTTERLY_API_KEY` or `PROFOUND_API_KEY` environment variables
  - Use `GEO_MOCK_MODE=true` for testing without API keys
  - Use `GEO_PREFERRED_API=profound` to prefer Profound over Otterly
  - Graceful fallback with `GEO_FALLBACK_TO_SCRAPING=true`
- **Platform-Specific Detection**: Full implementation in downstream tasks:
  - TASK-136: ChatGPT citation detection (scraping patterns)
  - TASK-139: Perplexity citation detection (hybrid API + scraping)
  - TASK-140: Claude/Gemini citation detection (implemented)
    - Claude: Scraping-only (no public API), configure session via `ClaudeDetector.refreshSession()`
    - Gemini: Hybrid API + scraping, set `GEMINI_API_KEY` for API access
- **Performance**: Single keyword <2s (API mode), Batch (10 keywords) <15s
- **Rate Limits**:
  - Otterly Free: 1,000 checks/month
  - Otterly Pro: 10,000 checks/month
  - Profound: 5,000 checks/month (premium tier)
- **Confidence Scores**: 0.0-1.0 scale based on detection certainty
- **Error Codes**: E526-E529 for API-specific errors (auth, quota, timeout, no config)
