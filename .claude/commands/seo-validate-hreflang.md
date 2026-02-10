---
description: Validate hreflang tags for multi-language sites
allowed-tools: Glob, Grep, Read
argument-hint: "[path] [--verbose] [--json]"
---

# seo-validate-hreflang

Validate hreflang tags for multi-language sites, checking reciprocal links, x-default presence, and valid ISO language/region codes.

## When to Use

- Before deploying multi-language site changes
- In CI/CD pipelines to catch hreflang configuration errors
- To audit existing sites for international SEO compliance
- During development to ensure proper language targeting

## Parameters

$ARGUMENTS = File path, directory, or sitemap.xml to validate (default: `.`)

**Flags**:
- `--verbose`: Show detailed validation with timing
- `--json`: Output results as JSON

## Instructions

### Phase 0: Input Validation

1. **Parse arguments**:
   - Extract path from `$ARGUMENTS` (default: `.`)
   - Check for `--verbose` flag
   - Check for `--json` flag

2. **Store flags for later phases**:
   ```
   verbose_mode = "--verbose" in arguments
   json_output = "--json" in arguments
   target_path = extracted path or "."
   ```

3. **Determine input type**:
   ```
   If target_path ends with "sitemap.xml":
     input_type = "sitemap"
   Else if target_path ends with ".html":
     input_type = "single_file"
   Else:
     input_type = "directory"
   ```

### Phase 1: File Discovery

4. **Find files to validate based on input type**:

   **If sitemap**:
   ```
   content = Read(file_path: target_path)
   # Extract URLs from sitemap
   # Parse xhtml:link elements for hreflang data
   ```

   **If single_file**:
   ```
   files = [target_path]
   ```

   **If directory**:
   ```
   files = Glob(pattern: target_path + "/**/*.html")
   ```

5. **Handle empty results**:
   ```
   If files.length == 0 AND input_type != "sitemap":
     [ERROR] E101: No HTML files found in: [target_path]
     Exit 2
   ```

6. **Display discovery summary** (if not json_output):
   ```
   Analyzing [N] pages...
   ```

### Phase 2: Hreflang Extraction

7. **Initialize data structures**:
   ```
   hreflang_graph = {}      # page -> { lang_code -> target_url }
   all_languages = Set()    # Track all language codes found
   all_pages = Set()        # Track all pages
   x_default_pages = Set()  # Pages with x-default
   ```

8. **For each file, extract hreflang declarations**:
   ```
   content = Read(file_path: file)

   # Regex pattern for hreflang links
   # <link rel="alternate" hreflang="CODE" href="URL">
   # Supports both single and double quotes, any attribute order

   pattern = <link[^>]*rel=["']alternate["'][^>]*hreflang=["']([^"']+)["'][^>]*href=["']([^"']+)["']
   alternative_pattern = <link[^>]*hreflang=["']([^"']+)["'][^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["']

   For each match:
     lang_code = match[1]
     target_url = match[2]

     hreflang_graph[file][lang_code] = target_url
     all_languages.add(lang_code)
     all_pages.add(target_url)

     If lang_code == "x-default":
       x_default_pages.add(file)
   ```

9. **For sitemap input, parse XML hreflang**:
   ```
   # Pattern for sitemap xhtml:link elements
   # <xhtml:link rel="alternate" hreflang="CODE" href="URL"/>

   pattern = <xhtml:link[^>]*hreflang=["']([^"']+)["'][^>]*href=["']([^"']+)["']

   Group by <loc> URL to build graph
   ```

### Phase 3: Validation

Initialize results:
```
errors = []
warnings = []
file_results = {}
```

#### Phase 3a: ISO Code Validation (E502)

10. **Validate language codes**:
    ```
    # Valid ISO 639-1 codes (2 lowercase letters)
    # Valid combinations: xx, xx-XX, xx-Xxxx (script variant)
    # Plus x-default

    valid_pattern = ^[a-z]{2}(-[A-Z]{2}|-[A-Za-z]{4})?$|^x-default$

    For each file in hreflang_graph:
      For each lang_code in hreflang_graph[file]:
        If lang_code does NOT match valid_pattern:
          errors.push({
            file: file,
            code: "E502",
            message: "Invalid hreflang code: \"{lang_code}\"",
            context: get_suggestion(lang_code)
          })
    ```

11. **Helper: Suggest correct code**:
    ```
    common_mistakes = {
      "english": "en",
      "spanish": "es",
      "german": "de",
      "french": "fr",
      "US": "en-US",
      "GB": "en-GB",
      "MX": "es-MX",
      "DE": "de-DE"
    }

    If lang_code in common_mistakes:
      return "(use \"{common_mistakes[lang_code]}\")"
    Else:
      return "(must be ISO 639-1 format)"
    ```

#### Phase 3b: Self-Reference Validation (E503)

12. **Check self-reference for each page**:
    ```
    For each file in hreflang_graph:
      # Normalize file path to URL for comparison
      file_url = normalize_to_url(file)

      has_self_reference = false
      For each target_url in hreflang_graph[file].values():
        If normalize_url(target_url) == file_url:
          has_self_reference = true
          break

      If NOT has_self_reference:
        errors.push({
          file: file,
          code: "E503",
          message: "Missing self-reference hreflang",
          context: "Page must include hreflang pointing to itself"
        })
    ```

#### Phase 3c: Reciprocal Link Validation (E503)

13. **Check bidirectional links**:
    ```
    For each file_a in hreflang_graph:
      For each (lang_code, target_url) in hreflang_graph[file_a]:
        If lang_code == "x-default":
          continue  # x-default doesn't require reciprocal

        # Find the target file in our graph
        file_b = resolve_url_to_file(target_url)

        If file_b NOT in hreflang_graph:
          # Target not in our validated set - skip (external URL)
          continue

        # Check if file_b links back to file_a
        file_a_url = normalize_to_url(file_a)
        has_reciprocal = false

        For each (_, back_url) in hreflang_graph[file_b]:
          If normalize_url(back_url) == file_a_url:
            has_reciprocal = true
            break

        If NOT has_reciprocal:
          # Get language code of file_a
          file_a_lang = get_self_lang(hreflang_graph[file_a], file_a)

          errors.push({
            file: file,
            code: "E503",
            message: "Missing reciprocal hreflang link",
            context: "{file_a_lang} -> {lang_code} ({target_url} missing link back)"
          })
    ```

#### Phase 3d: x-default Validation (Warning)

14. **Check x-default presence**:
    ```
    For each file in hreflang_graph:
      If file NOT in x_default_pages:
        # Only warn if page has multiple hreflang entries
        If hreflang_graph[file].length > 1:
          warnings.push({
            file: file,
            code: "E502",
            message: "Missing x-default declaration",
            context: "Recommended for fallback language targeting"
          })
    ```

#### Phase 3e: Determine File Status

15. **Calculate status for each file**:
    ```
    For each file in hreflang_graph:
      file_errors = errors.filter(e => e.file == file)
      file_warnings = warnings.filter(w => w.file == file)

      If file_errors.length > 0:
        file_results[file] = "fail"
      Else if file_warnings.length > 0:
        file_results[file] = "warn"
      Else:
        file_results[file] = "pass"
    ```

### Phase 4: Output Generation

16. **Prepare summary statistics**:
    ```
    failed_count = count(file_results where status == "fail")
    warned_count = count(file_results where status == "warn")
    passed_count = count(file_results where status == "pass")
    languages_found = all_languages.size - (1 if "x-default" in all_languages else 0)
    ```

17. **If --json flag, output JSON**:
    ```json
    {
      "validator": "hreflang",
      "files_validated": [N],
      "languages": [N],
      "status": "[overall_status]",
      "results": [
        {
          "file": "[path]",
          "status": "[pass|warn|fail]",
          "errors": [
            {
              "code": "E503",
              "message": "Missing reciprocal hreflang link",
              "context": "en -> es (/es/page.html missing link back)"
            }
          ],
          "warnings": [...]
        }
      ],
      "summary": "[N] failed, [N] warning, [N] passed"
    }
    ```

18. **Otherwise, output markdown report**:
    ```
    Analyzing [N] pages across [languages_found] languages...

    [For each file with issues, sorted by status (fail first):]

    [FAIL] path/to/file.html
      [E503] Missing reciprocal hreflang link
             en -> es (/es/page.html missing link back)
      [E502] Invalid hreflang code: "english" (use "en")

    [WARN] path/to/other.html
      [E502] Missing x-default declaration

    [PASS] path/to/good.html

    ---

    Summary: [N] failed, [N] warning, [N] passed
    ```

19. **If --verbose, add performance info**:
    ```
    ---
    Performance: [N] files validated in [X.XX]s ([X.XXX]s/file)
    Languages detected: [list of language codes]
    Graph edges: [total hreflang links]
    ```

### Phase 5: Exit Code

20. **Determine exit code**:
    ```
    If any fatal errors (E1XX):
      Exit 2
    Else if failed_count > 0:
      Exit 1
    Else:
      Exit 0
    ```

## Error Codes

| Code | Description | Exit |
|------|-------------|------|
| E101 | No files found | 2 |
| E502 | Invalid hreflang code | 1 |
| E503 | Missing reciprocal hreflang link | 1 |

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All files passed validation |
| 1 | One or more files failed validation |
| 2 | Fatal error (no files found, etc.) |

## Validation Rules

### Language Code Format

| Format | Example | Valid |
|--------|---------|-------|
| ISO 639-1 | `en`, `es`, `de` | Yes |
| ISO 639-1 + Region | `en-US`, `es-MX` | Yes |
| Script variant | `zh-Hans`, `zh-Hant` | Yes |
| x-default | `x-default` | Yes |
| Country only | `US`, `GB` | No (E502) |
| Full word | `english`, `spanish` | No (E502) |
| Invalid format | `eng`, `e-US` | No (E502) |

### Reciprocal Link Rules

| Rule | Requirement | Error |
|------|-------------|-------|
| Self-reference | Page must link to itself | E503 |
| Bidirectional | A->B requires B->A | E503 |
| x-default | Present for fallback | Warning |

### Common ISO 639-1 Codes

| Code | Language | Regional Variants |
|------|----------|-------------------|
| en | English | en-US, en-GB, en-AU |
| es | Spanish | es-ES, es-MX, es-AR |
| de | German | de-DE, de-AT, de-CH |
| fr | French | fr-FR, fr-CA, fr-BE |
| pt | Portuguese | pt-BR, pt-PT |
| zh | Chinese | zh-Hans, zh-Hant |
| ja | Japanese | ja-JP |
| ko | Korean | ko-KR |
| it | Italian | it-IT |
| ru | Russian | ru-RU |
| ar | Arabic | ar-SA, ar-EG |
| hi | Hindi | hi-IN |
| nl | Dutch | nl-NL, nl-BE |
| pl | Polish | pl-PL |
| tr | Turkish | tr-TR |

## Examples

### Validate current directory
```
/seo-validate-hreflang
```

### Validate specific directory
```
/seo-validate-hreflang src/pages/
```

### Validate from sitemap
```
/seo-validate-hreflang sitemap.xml
```

### JSON output for CI/CD
```
/seo-validate-hreflang --json
```

### Verbose output with timing
```
/seo-validate-hreflang --verbose
```

## Sample Output

### Standard Output
```
/seo-validate-hreflang src/

Analyzing 24 pages across 3 languages...

[FAIL] src/products/widget.html
  [E503] Missing reciprocal: es -> en (en has es, es missing en)
  [E502] Invalid hreflang code: "english" (use "en")

[WARN] src/about.html
  [E502] Missing x-default declaration

[PASS] src/index.html
[PASS] src/contact.html

---

Summary: 1 failed, 1 warning, 22 passed
```

### JSON Output
```json
{
  "validator": "hreflang",
  "files_validated": 24,
  "languages": 3,
  "status": "fail",
  "results": [
    {
      "file": "src/products/widget.html",
      "status": "fail",
      "errors": [
        {
          "code": "E503",
          "message": "Missing reciprocal hreflang link",
          "context": "es -> en (en has es, es missing en)"
        },
        {
          "code": "E502",
          "message": "Invalid hreflang code: \"english\"",
          "context": "(use \"en\")"
        }
      ],
      "warnings": []
    }
  ],
  "summary": "1 failed, 1 warning, 22 passed"
}
```

## Reference Skills

- `seo-validation`: Error codes and validation patterns
- `seo-validation/hreflang`: Detailed hreflang validation patterns
- `multi-language-seo-patterns`: i18n SEO best practices
- `error-handling`: Standardized error format

## Performance

- **Target**: < 0.5s per site
- **Strategy**: Local file validation only (no HTTP requests)
- **Optimization**: Regex-based extraction, in-memory graph
