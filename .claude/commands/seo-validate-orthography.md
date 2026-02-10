---
description: Validate spelling and grammar for SEO content quality
allowed-tools: Glob, Read, WebFetch
argument-hint: "[path|URL] [--lang LANG] [--fix] [--strict] [--json] [--verbose]"
---

# seo-validate-orthography

Validate spelling and grammar for web content using LanguageTool integration. Supports tier1 languages (EN, ES, FR, DE) with in-memory caching for <2s performance.

## When to Use

- Before publishing content to catch spelling/grammar errors
- In content QA pipelines for multi-language sites
- During translation review to ensure quality
- To audit existing content for orthography issues

## Parameters

$ARGUMENTS = File path, glob pattern, or URL to validate

**Flags**:
- `--lang LANG`: Override language detection (en, es, fr, de)
- `--fix`: Show fix suggestions (default: true)
- `--strict`: Fail on warnings too (default: false)
- `--json`: Output results as JSON
- `--verbose`: Show detailed validation with timing

## Instructions

### Phase 0: Input Validation

1. **Parse arguments**:
   - Extract path/URL from `$ARGUMENTS`
   - Check for `--lang` flag with language code
   - Check for `--fix` flag (default: true)
   - Check for `--strict` flag
   - Check for `--json` flag
   - Check for `--verbose` flag

2. **Validate language code** (if provided):
   ```
   tier1_languages = ["en", "es", "fr", "de"]

   If --lang provided AND lang not in tier1_languages:
     [ERROR] E533: Language not supported: [lang]

     Supported languages: en, es, fr, de
     Exit 1
   ```

3. **Store flags for later phases**:
   ```
   lang_override = value of --lang or null
   show_fix = "--fix" in arguments (default true)
   strict_mode = "--strict" in arguments
   json_output = "--json" in arguments
   verbose_mode = "--verbose" in arguments
   target = extracted path/URL or error
   ```

4. **Validate target provided**:
   ```
   If target is empty:
     [ERROR] E005: Missing required argument

     Usage: /seo-validate-orthography [path|URL] [flags]
     Exit 1
   ```

### Phase 1: Content Loading

5. **Determine content source type**:
   ```
   If target starts with "http://" or "https://":
     source_type = "url"
   Else if target contains "*" or "?":
     source_type = "glob"
   Else:
     source_type = "file"
   ```

6. **Load content based on source type**:

   **For URL**:
   ```
   content = WebFetch(url: target, prompt: "Extract all text content from the page body")

   If fetch failed:
     [ERROR] E534: Content not accessible

     URL: [target]
     Check URL is valid and accessible
     Exit 2

   files = [{ path: target, content: content }]
   ```

   **For glob pattern**:
   ```
   matched_files = Glob(pattern: target)

   If matched_files.length == 0:
     [ERROR] E534: Content not accessible

     No files found matching: [target]
     Exit 2

   For each file in matched_files:
     content = Read(file_path: file)
     files.push({ path: file, content: content })
   ```

   **For single file**:
   ```
   content = Read(file_path: target)

   If read failed:
     [ERROR] E534: Content not accessible

     File not found: [target]
     Exit 2

   files = [{ path: target, content: content }]
   ```

7. **Display loading summary** (if verbose_mode):
   ```
   [timestamp] Loading content...
       Source: [source_type]
       Files: [N]
   ```

### Phase 2: Language Detection

For each file in files:

8. **Detect language** (if no override):
   ```
   If lang_override:
     detected_lang = lang_override
   Else:
     # Priority 1: HTML lang attribute
     lang_attr = regex match: <html[^>]*lang="([^"]*)"

     If lang_attr:
       detected_lang = normalize_lang_code(lang_attr[1])
     Else:
       # Priority 2: Content-Language meta tag
       meta_lang = regex match: <meta[^>]*http-equiv="Content-Language"[^>]*content="([^"]*)"

       If meta_lang:
         detected_lang = normalize_lang_code(meta_lang[1])
       Else:
         # Priority 3: Let LanguageTool auto-detect
         detected_lang = "auto"
   ```

9. **Normalize language code**:
   ```
   function normalize_lang_code(code):
     # Extract base language from locale (e.g., "en-US" -> "en")
     base = code.split("-")[0].lower()

     tier1 = ["en", "es", "fr", "de"]
     If base in tier1:
       return base
     Else:
       return null  # Will trigger E533 or fall back to auto
   ```

10. **Handle unsupported language**:
    ```
    If detected_lang is null AND lang_override is null:
      [WARNING] Detected language not in tier1, using auto-detection
      detected_lang = "auto"

    Store detected_lang for file
    ```

### Phase 3: LanguageTool Validation

11. **Check LanguageTool availability**:
    ```
    # Test connection to LanguageTool server
    Try:
      response = HTTP GET http://localhost:8081/v2/languages (timeout: 2000ms)

      If response.status != 200:
        Raise error
    Catch:
      [ERROR] E535: LanguageTool not available

      LanguageTool server not responding at localhost:8081

      To start LanguageTool:
        java -cp languagetool-server.jar org.languagetool.server.HTTPServer --port 8081

      Exit 2
    ```

12. **Extract text content from HTML** (if HTML file):
    ```
    # Remove script and style tags
    text = content
    text = regex_replace(text, "<script[^>]*>.*?</script>", "")
    text = regex_replace(text, "<style[^>]*>.*?</style>", "")

    # Remove HTML tags but keep text
    text = regex_replace(text, "<[^>]+>", " ")

    # Decode HTML entities
    text = decode_html_entities(text)

    # Normalize whitespace
    text = regex_replace(text, "\s+", " ").trim()

    word_count = text.split(" ").length
    ```

13. **Call LanguageTool API**:
    ```
    For each file in files:
      request_body = {
        text: extracted_text,
        language: detected_lang  # "en", "es", "fr", "de", or "auto"
      }

      response = HTTP POST http://localhost:8081/v2/check
        Content-Type: application/x-www-form-urlencoded
        Body: text={text}&language={language}
        Timeout: 10000ms

      If response.status != 200:
        [ERROR] E530: Orthography validation failed

        LanguageTool returned error: [status]
        Exit 2

      matches = response.body.matches
      detected_language = response.body.language
    ```

14. **Process LanguageTool matches**:
    ```
    errors = []
    warnings = []

    For each match in matches:
      category = match.rule.category.id

      # Classify by category
      If category in ["TYPOS", "CASING"]:
        type = "spelling"
        code = "E531"
        list = errors
      Else if category in ["GRAMMAR", "PUNCTUATION"]:
        type = "grammar"
        code = "E532"
        list = errors
      Else if category in ["STYLE", "REDUNDANCY"]:
        type = "style"
        code = null  # No error code for warnings
        list = warnings
      Else:
        type = "other"
        code = null
        list = warnings

      issue = {
        code: code,
        type: type,
        location: calculate_line_column(content, match.offset),
        issue: extract_text(content, match.offset, match.length),
        message: match.message,
        suggestions: match.replacements.map(r => r.value).slice(0, 3),
        context: match.context.text,
        rule_id: match.rule.id
      }

      list.push(issue)
    ```

### Phase 4: Report Generation

15. **Calculate file status**:
    ```
    For each file:
      If errors.length > 0:
        file_status = "fail"
      Else if warnings.length > 0 AND strict_mode:
        file_status = "fail"
      Else if warnings.length > 0:
        file_status = "warn"
      Else:
        file_status = "pass"
    ```

16. **If --json flag, output JSON**:
    ```json
    {
      "validator": "orthography",
      "language_detected": "[lang-code]",
      "words_analyzed": [N],
      "status": "[pass|warn|fail]",
      "execution_time_ms": [N],
      "errors": [
        {
          "code": "E531",
          "location": { "line": 15, "column": 23 },
          "issue": "recieve",
          "type": "spelling",
          "suggestions": ["receive"],
          "context": "...to recieve the..."
        }
      ],
      "warnings": [],
      "summary": "[N] spelling, [N] grammar"
    }
    ```

17. **Otherwise, output markdown report**:
    ```
    ## Orthography Validation Report

    **Target**: [path or URL]
    **Language**: [detected_lang]
    **Words analyzed**: [word_count]

    [For each file with issues:]

    ### [FAIL] path/to/file.html

    | Location | Issue | Type | Suggestion |
    |----------|-------|------|------------|
    | Line 15, Col 23 | "recieve" | Spelling | "receive" |
    | Line 42, Col 8 | "their is" | Grammar | "there is" |

    [For files with only warnings:]

    ### [WARN] path/to/other.html

    | Location | Issue | Type | Note |
    |----------|-------|------|------|
    | Line 10, Col 5 | "very unique" | Style | "unique" is absolute |

    [For passing files:]

    ### [PASS] path/to/good.html

    ---

    **Summary**: [N] spelling errors, [N] grammar errors, [N] style warnings
    **Status**: [PASS|WARN|FAIL] ([error_code if fail])
    ```

18. **If --verbose, add performance info**:
    ```
    ---

    Performance:
      Language detection: [X.XX]s
      LanguageTool API: [X.XX]s
      Report generation: [X.XX]s
      Total: [X.XX]s
    ```

### Phase 5: Exit Code Determination

19. **Determine overall status and exit code**:
    ```
    has_errors = any file has errors (spelling or grammar)
    has_warnings = any file has warnings (style)

    If has_errors:
      overall_status = "fail"
      # Determine primary error code
      If spelling_errors > 0:
        error_code = "E531"
      Else:
        error_code = "E532"
      Exit 1
    Else if has_warnings AND strict_mode:
      overall_status = "fail"
      error_code = "E530"
      Exit 1
    Else if has_warnings:
      overall_status = "warn"
      Exit 0
    Else:
      overall_status = "pass"
      Exit 0
    ```

## Error Codes

| Code | Description | Exit |
|------|-------------|------|
| E530 | Orthography validation failed | 1 |
| E531 | Spelling errors found | 1 |
| E532 | Grammar errors found | 1 |
| E533 | Language not supported | 1 |
| E534 | Content not accessible | 2 |
| E535 | LanguageTool not available | 2 |

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All content passed validation (or warnings only without --strict) |
| 1 | Spelling or grammar errors found |
| 2 | System error (LanguageTool unavailable, content not accessible) |

## Supported Languages (Tier1)

| Code | Language | Variants |
|------|----------|----------|
| en | English | en-US, en-GB |
| es | Spanish | es-ES, es-MX |
| fr | French | fr-FR, fr-CA |
| de | German | de-DE, de-AT |

## Performance Budget

| Operation | Budget |
|-----------|--------|
| Language detection | 0.1s |
| LanguageTool API call | 1.5s |
| Report generation | 0.2s |
| **Total** | **<2.0s** |

## Examples

### Validate a single file
```
/seo-validate-orthography content/blog-post.html
```

### Validate with language override
```
/seo-validate-orthography content/es/*.html --lang es
```

### Validate URL content
```
/seo-validate-orthography https://example.com/about
```

### JSON output for CI/CD
```
/seo-validate-orthography content/**/*.html --json
```

### Strict mode (fail on style warnings)
```
/seo-validate-orthography content/*.html --strict
```

### Verbose output with timing
```
/seo-validate-orthography content/*.html --verbose
```

## Reference Skills

- `seo-validation/orthography.md`: LanguageTool integration patterns
- `error-handling`: Standardized error codes (E53X range)
- `multi-language-seo-patterns`: Language detection patterns

## LanguageTool Setup

LanguageTool must be running locally on port 8081.

### Quick Start
```bash
# Download LanguageTool (requires Java 8+)
wget https://languagetool.org/download/LanguageTool-stable.zip
unzip LanguageTool-stable.zip

# Start server
cd LanguageTool-*
java -cp languagetool-server.jar org.languagetool.server.HTTPServer --port 8081
```

### Verify Server
```bash
curl -s http://localhost:8081/v2/languages | head -5
```

### Docker Alternative
```bash
docker run -d -p 8081:8010 erikvl87/languagetool
```
