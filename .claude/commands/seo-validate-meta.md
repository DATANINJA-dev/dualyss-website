---
description: Validate HTML meta tags for SEO compliance
allowed-tools: Glob, Grep, Read
argument-hint: "[path] [--verbose] [--json]"
---

# seo-validate-meta

Validate HTML meta tags (title, description, Open Graph, Twitter Cards) for SEO compliance with standardized error codes.

## When to Use

- Before deploying changes to validate SEO meta tags
- In CI/CD pipelines to catch missing or invalid meta tags
- To audit existing pages for SEO compliance
- During development to ensure meta tag requirements are met

## Parameters

$ARGUMENTS = File path or glob pattern to validate (default: `**/*.html`)

**Flags**:
- `--verbose`: Show detailed validation with timing
- `--json`: Output results as JSON

## Instructions

### Phase 0: Input Validation

1. **Parse arguments**:
   - Extract path from `$ARGUMENTS` (default: `**/*.html`)
   - Check for `--verbose` flag
   - Check for `--json` flag

2. **Store flags for later phases**:
   ```
   verbose_mode = "--verbose" in arguments
   json_output = "--json" in arguments
   target_path = extracted path or "**/*.html"
   ```

### Phase 1: File Discovery

3. **Find matching HTML files**:

   Use the Glob tool with the target path:
   ```
   files = Glob(pattern: target_path)
   ```

4. **Handle empty results**:
   ```
   If files.length == 0:
     [ERROR] E101: No files found matching: [target_path]
     Exit 2
   ```

5. **Display discovery summary** (if not json_output):
   ```
   Validating [N] files...
   ```

### Phase 2: Validation Loop

For each file in files:

6. **Read file content**:
   ```
   content = Read(file_path: file)
   ```

7. **Extract and validate title**:
   ```
   # Find title tag
   title_match = regex match: <title>([^<]*)</title>

   If no match:
     errors.push({ code: "E501", tag: "title", message: "Missing required tag" })
   Else:
     title_text = title_match[1].trim()
     title_length = title_text.length

     If title_length < 50:
       errors.push({ code: "E500", tag: "title", message: "Title too short ({title_length} chars, min 50)" })
     Else if title_length > 60:
       errors.push({ code: "E500", tag: "title", message: "Title too long ({title_length} chars, max 60)" })
   ```

8. **Extract and validate meta description**:
   ```
   # Find meta description
   desc_match = regex match: <meta name="description" content="([^"]*)"

   If no match:
     errors.push({ code: "E501", tag: "description", message: "Missing required tag" })
   Else:
     desc_text = desc_match[1]
     desc_length = desc_text.length

     If desc_length < 150:
       warnings.push({ code: "E500", tag: "description", message: "Description too short ({desc_length} chars, min 150)" })
     Else if desc_length > 160:
       warnings.push({ code: "E500", tag: "description", message: "Description too long ({desc_length} chars, max 160)" })
   ```

9. **Extract and validate Open Graph tags**:
   ```
   required_og = ["og:title", "og:description", "og:image", "og:url"]
   found_og = []

   For each og_tag in required_og:
     og_match = regex match: <meta property="{og_tag}" content="([^"]*)"

     If match:
       found_og.push(og_tag)

       # Validate og:image and og:url are valid URLs
       If og_tag in ["og:image", "og:url"]:
         If not starts_with(content, "http"):
           errors.push({ code: "E500", tag: og_tag, message: "Invalid URL format" })

   missing_og = required_og - found_og
   If missing_og.length > 0:
     errors.push({ code: "E505", tag: "Open Graph", message: "Missing: {missing_og.join(', ')}" })
   ```

10. **Extract and validate Twitter Card tags**:
    ```
    # Twitter card is optional but if present, validate values
    card_match = regex match: <meta name="twitter:card" content="([^"]*)"

    If card_match:
      card_value = card_match[1]
      valid_cards = ["summary", "summary_large_image", "app", "player"]

      If card_value not in valid_cards:
        errors.push({ code: "E500", tag: "twitter:card", message: "Invalid value: {card_value}" })

    # Check twitter:title length if present (max 70 chars)
    title_match = regex match: <meta name="twitter:title" content="([^"]*)"
    If title_match and title_match[1].length > 70:
      warnings.push({ code: "E500", tag: "twitter:title", message: "Too long ({length} chars, max 70)" })

    # Check twitter:description length if present (max 200 chars)
    desc_match = regex match: <meta name="twitter:description" content="([^"]*)"
    If desc_match and desc_match[1].length > 200:
      warnings.push({ code: "E500", tag: "twitter:description", message: "Too long ({length} chars, max 200)" })
    ```

11. **Determine file status**:
    ```
    If errors.length > 0:
      file_status = "fail"
    Else if warnings.length > 0:
      file_status = "warn"
    Else:
      file_status = "pass"

    Store result for file
    ```

### Phase 3: Output Generation

12. **If --json flag, output JSON**:

    ```json
    {
      "validator": "meta",
      "files_validated": [N],
      "status": "[overall_status]",
      "results": [
        {
          "file": "[path]",
          "status": "[pass|warn|fail]",
          "errors": [...],
          "warnings": [...]
        }
      ],
      "summary": "[N] failed, [N] passed, [N] warnings"
    }
    ```

13. **Otherwise, output markdown report**:

    ```
    ## Meta Tag Validation Report

    [For each file with issues:]

    [FAIL] path/to/file.html
      [E501] Missing required tag: title
      [E505] Missing Open Graph: og:description, og:image

    [WARN] path/to/other.html
      [E500] Description too short (120 chars, min 150)

    [PASS] path/to/good.html

    ---

    Summary: [N] failed, [N] passed, [N] warnings
    ```

14. **If --verbose, add performance info**:
    ```
    Performance: [N] files validated in [X.XX]s ([X.XXX]s/file)
    ```

### Phase 4: Exit Code

15. **Determine exit code**:
    ```
    If any fatal errors (E1XX):
      Exit 2
    Else if any failures (file_status == "fail"):
      Exit 1
    Else:
      Exit 0
    ```

## Error Codes

| Code | Description | Exit |
|------|-------------|------|
| E101 | No files found | 2 |
| E500 | Invalid tag value | 1 |
| E501 | Missing required tag | 1 |
| E505 | Missing Open Graph group | 1 |

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All files passed validation |
| 1 | One or more files failed validation |
| 2 | Fatal error (no files found, etc.) |

## Validation Rules

### Required Tags

| Tag | Length | Error if Missing |
|-----|--------|------------------|
| `<title>` | 50-60 chars | E501 |
| `<meta name="description">` | 150-160 chars | E501 |

### Open Graph Tags (Required for Social)

| Tag | Validation | Error if Missing |
|-----|------------|------------------|
| `og:title` | Present | E505 |
| `og:description` | Present | E505 |
| `og:image` | Valid URL | E505 |
| `og:url` | Valid URL | E505 |

### Twitter Cards (Optional)

| Tag | Validation | Error if Invalid |
|-----|------------|------------------|
| `twitter:card` | summary, summary_large_image, app, player | E500 |
| `twitter:title` | Max 70 chars | E500 |
| `twitter:description` | Max 200 chars | E500 |

## Examples

### Validate all HTML files
```
/seo-validate-meta
```

### Validate specific directory
```
/seo-validate-meta src/**/*.html
```

### JSON output for CI/CD
```
/seo-validate-meta --json
```

### Verbose output with timing
```
/seo-validate-meta --verbose
```

## Reference Skills

- `seo-validation`: Error codes and validation patterns
- `error-handling`: Standardized error format
