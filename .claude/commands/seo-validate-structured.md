---
description: Validate JSON-LD structured data for SEO compliance
allowed-tools: Glob, Grep, Read
argument-hint: "[path] [--verbose] [--json] [--type TYPE]"
---

# seo-validate-structured

Validate JSON-LD structured data against schema.org schemas and Google Rich Results requirements with standardized error codes.

## When to Use

- Before deploying changes to validate structured data markup
- In CI/CD pipelines to catch invalid or incomplete JSON-LD
- To audit existing pages for Google Rich Results compliance
- During development to ensure schema.org requirements are met

## Parameters

$ARGUMENTS = File path or glob pattern to validate (default: `**/*.html`)

**Flags**:
- `--verbose`: Show detailed validation with timing
- `--json`: Output results as JSON
- `--type TYPE`: Filter by schema type (Article, Product, LocalBusiness, FAQ, HowTo)

## Instructions

### Phase 0: Input Validation

1. **Parse arguments**:
   - Extract path from `$ARGUMENTS` (default: `**/*.html`)
   - Check for `--verbose` flag
   - Check for `--json` flag
   - Check for `--type TYPE` flag (optional filter)

2. **Store flags for later phases**:
   ```
   verbose_mode = "--verbose" in arguments
   json_output = "--json" in arguments
   type_filter = extract value after "--type" if present
   target_path = extracted path or "**/*.html"
   ```

3. **Validate type filter** (if provided):
   ```
   valid_types = ["Article", "Product", "LocalBusiness", "FAQ", "HowTo", "FAQPage", "Organization", "BreadcrumbList", "Recipe"]

   If type_filter AND type_filter NOT in valid_types:
     [WARNING] Unknown schema type: [type_filter]. Validating anyway.
   ```

### Phase 1: File Discovery

4. **Determine input type**:
   ```
   If target_path ends with ".json":
     input_type = "json_file"
   Else if target_path ends with ".html" or contains glob pattern:
     input_type = "html_files"
   Else:
     input_type = "directory"
     target_path = target_path + "/**/*.html"
   ```

5. **Find matching files**:

   Use the Glob tool with the target path:
   ```
   files = Glob(pattern: target_path)
   ```

   For JSON files, also check for `.json` extension:
   ```
   If input_type == "directory":
     json_files = Glob(pattern: target_path.replace("**/*.html", "**/*.json"))
     # Filter to likely JSON-LD files
     json_files = json_files.filter(f => f contains "schema" or "ld" or "structured")
     files = files + json_files
   ```

6. **Handle empty results**:
   ```
   If files.length == 0:
     [ERROR] E101: No files found matching: [target_path]
     Exit 2
   ```

7. **Display discovery summary** (if not json_output):
   ```
   Validating [N] files...
   ```

### Phase 2: JSON-LD Extraction

For each file in files:

8. **Read file content**:
   ```
   content = Read(file_path: file)
   ```

9. **Extract JSON-LD based on file type**:

   **For HTML files**:
   ```
   # Regex pattern to extract JSON-LD script blocks
   pattern = <script\s+type=["']application/ld\+json["'][^>]*>([\s\S]*?)</script>

   json_ld_blocks = []
   For each match in content:
     json_text = match[1].trim()
     json_ld_blocks.push({
       source: "inline",
       line: approximate_line_number,
       content: json_text
     })
   ```

   **For JSON files**:
   ```
   json_ld_blocks = [{
     source: "external",
     line: 1,
     content: content
   }]
   ```

10. **Handle files with no JSON-LD**:
    ```
    If json_ld_blocks.length == 0:
      # Not an error - file simply has no structured data
      file_results[file] = {
        status: "pass",
        schemas_found: 0,
        errors: [],
        warnings: []
      }
      Continue to next file
    ```

### Phase 3: Schema Validation

For each json_ld_block in json_ld_blocks:

#### Phase 3a: JSON Syntax Validation

11. **Parse JSON**:
    ```
    Try:
      parsed = JSON.parse(json_ld_block.content)
    Catch ParseError:
      errors.push({
        code: "E504",
        message: "Invalid JSON syntax",
        location: "{file}:{json_ld_block.line}",
        context: error.message,
        fix: "Check for missing commas, quotes, or brackets"
      })
      Continue to next block
    ```

#### Phase 3b: @context Validation

12. **Check @context**:
    ```
    context = parsed["@context"]

    If context is undefined or null:
      errors.push({
        code: "E504",
        message: "Missing @context",
        location: "{file}:{json_ld_block.line}",
        context: "JSON-LD requires @context field",
        fix: 'Add "@context": "https://schema.org"'
      })
    Else if context is string:
      If context != "https://schema.org" AND context != "http://schema.org":
        errors.push({
          code: "E504",
          message: "@context must be schema.org",
          location: "{file}:{json_ld_block.line}",
          context: "Found: {context}",
          fix: 'Use "https://schema.org" (prefer https)'
        })
    Else if context is array:
      If NOT context.includes("https://schema.org") AND NOT context.includes("http://schema.org"):
        errors.push({
          code: "E504",
          message: "@context must include schema.org",
          location: "{file}:{json_ld_block.line}",
          context: "Found: {context.join(', ')}",
          fix: 'Include "https://schema.org" in the array'
        })
    ```

#### Phase 3c: @type Validation

13. **Check @type exists**:
    ```
    schema_type = parsed["@type"]

    If schema_type is undefined or null:
      errors.push({
        code: "E505",
        message: "Missing @type",
        location: "{file}:{json_ld_block.line}",
        context: "JSON-LD requires @type field",
        fix: "Add @type with a valid schema.org type (e.g., Article, Product)"
      })
      Continue to next block
    ```

14. **Validate @type value**:
    ```
    # Handle array types (multiple types per entity)
    types_to_check = schema_type is array ? schema_type : [schema_type]

    For each type in types_to_check:
      # Check against known schema.org types
      known_types = ["Article", "Product", "LocalBusiness", "FAQ", "FAQPage",
                     "HowTo", "Organization", "Person", "BreadcrumbList",
                     "WebPage", "WebSite", "Event", "Recipe", "Review",
                     "VideoObject", "ImageObject", "ItemList", "ListItem",
                     "Service", "Offer", "AggregateRating", "PostalAddress"]

      If type NOT in known_types:
        warnings.push({
          code: "E505",
          message: "Unknown schema.org type: {type}",
          location: "{file}:{json_ld_block.line}",
          context: "Type not in common validation list",
          fix: "Verify type exists at schema.org/{type}"
        })
    ```

15. **Apply type filter** (if --type provided):
    ```
    If type_filter AND types_to_check NOT includes type_filter:
      # Skip this block - doesn't match filter
      Continue to next block
    ```

#### Phase 3d: Required Fields Validation

16. **Check required fields per type**:

    ```
    required_fields = {
      "Article": {
        required: ["headline", "author", "datePublished"],
        recommended: ["image", "dateModified", "publisher"]
      },
      "Product": {
        required: ["name", "image"],
        recommended: ["description", "offers", "brand", "aggregateRating"]
      },
      "LocalBusiness": {
        required: ["name", "address"],
        recommended: ["telephone", "openingHours", "geo", "image"]
      },
      "FAQ": {
        required: ["mainEntity"],
        recommended: []
      },
      "FAQPage": {
        required: ["mainEntity"],
        recommended: []
      },
      "HowTo": {
        required: ["name", "step"],
        recommended: ["totalTime", "estimatedCost", "image"]
      },
      "Organization": {
        required: ["name", "url"],
        recommended: ["logo", "contactPoint", "sameAs"]
      },
      "BreadcrumbList": {
        required: ["itemListElement"],
        recommended: []
      },
      "Recipe": {
        required: ["name", "recipeIngredient"],
        recommended: ["image", "cookTime", "nutrition", "recipeInstructions"]
      }
    }

    For each type in types_to_check:
      If type in required_fields:
        type_def = required_fields[type]

        # Check required fields
        For each field in type_def.required:
          If field NOT in parsed OR parsed[field] is null or empty:
            errors.push({
              code: "E505",
              message: "{type}: Missing required field \"{field}\"",
              location: "{file}:{json_ld_block.line}",
              context: "Required by Google Rich Results",
              fix: "Add the {field} property with a valid value"
            })

        # Check recommended fields (warnings only)
        For each field in type_def.recommended:
          If field NOT in parsed:
            warnings.push({
              code: "E505",
              message: "{type}: Missing recommended field \"{field}\"",
              location: "{file}:{json_ld_block.line}",
              context: "Recommended for better Rich Results",
              fix: "Consider adding {field} for enhanced visibility"
            })
    ```

#### Phase 3e: Nested Structure Validation

17. **Validate nested structures for specific types**:

    **For FAQ/FAQPage**:
    ```
    If type in ["FAQ", "FAQPage"]:
      mainEntity = parsed["mainEntity"]

      If mainEntity is array:
        For each (index, item) in mainEntity:
          If item["@type"] != "Question":
            errors.push({
              code: "E505",
              message: "FAQ: mainEntity[{index}] must have @type \"Question\"",
              location: "{file}",
              fix: 'Add "@type": "Question" to each mainEntity item'
            })

          If NOT item["name"]:
            errors.push({
              code: "E505",
              message: "FAQ: mainEntity[{index}] missing question text (name)",
              location: "{file}",
              fix: "Add 'name' property with the question text"
            })

          If NOT item["acceptedAnswer"]:
            errors.push({
              code: "E505",
              message: "FAQ: mainEntity[{index}] missing acceptedAnswer",
              location: "{file}",
              fix: "Add 'acceptedAnswer' with @type Answer"
            })
    ```

    **For HowTo**:
    ```
    If type == "HowTo":
      steps = parsed["step"]

      If steps is array:
        For each (index, step) in steps:
          If NOT step["name"] AND NOT step["text"]:
            errors.push({
              code: "E505",
              message: "HowTo: step[{index}] missing name or text",
              location: "{file}",
              fix: "Add 'name' or 'text' property to describe the step"
            })
    ```

    **For BreadcrumbList**:
    ```
    If type == "BreadcrumbList":
      items = parsed["itemListElement"]

      If items is array:
        For each (index, item) in items:
          If NOT item["position"]:
            errors.push({
              code: "E505",
              message: "BreadcrumbList: itemListElement[{index}] missing position",
              location: "{file}",
              fix: "Add 'position' property (1, 2, 3, ...)"
            })

          If NOT item["item"] AND NOT item["name"]:
            warnings.push({
              code: "E505",
              message: "BreadcrumbList: itemListElement[{index}] missing item or name",
              location: "{file}",
              fix: "Add 'item' with @id and 'name' properties"
            })
    ```

#### Phase 3f: URL and Date Validation

18. **Validate URLs and dates**:
    ```
    url_fields = ["url", "image", "@id", "logo", "sameAs"]
    date_fields = ["datePublished", "dateModified", "dateCreated"]

    For each field in parsed:
      # URL validation
      If field in url_fields:
        value = parsed[field]
        If value is string AND NOT value.startsWith("http"):
          If NOT value.startsWith("/"):  # Allow absolute paths
            warnings.push({
              code: "E505",
              message: "Invalid URL format for {field}",
              location: "{file}",
              context: "Found: {value}",
              fix: "Use absolute URLs starting with http:// or https://"
            })

      # Date validation (ISO 8601)
      If field in date_fields:
        value = parsed[field]
        If value is string:
          iso_pattern = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/
          If NOT value.matches(iso_pattern):
            errors.push({
              code: "E505",
              message: "Invalid date format for {field}",
              location: "{file}",
              context: "Found: {value}",
              fix: "Use ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)"
            })
    ```

#### Phase 3g: Determine File Status

19. **Calculate status for each file**:
    ```
    file_errors = errors.filter(e => e.location.startsWith(file))
    file_warnings = warnings.filter(w => w.location.startsWith(file))

    If file_errors.length > 0:
      file_results[file] = "fail"
    Else if file_warnings.length > 0:
      file_results[file] = "warn"
    Else:
      file_results[file] = "pass"

    # Track schemas found per file
    schemas_per_file[file] = {
      count: json_ld_blocks.length,
      types: types_found
    }
    ```

### Phase 4: Output Generation

20. **Prepare summary statistics**:
    ```
    failed_count = count(file_results where status == "fail")
    warned_count = count(file_results where status == "warn")
    passed_count = count(file_results where status == "pass")
    total_schemas = sum(schemas_per_file[file].count for all files)
    types_found = unique(all types from schemas_per_file)
    ```

21. **If --json flag, output JSON**:

    ```json
    {
      "validator": "structured-data",
      "files_validated": [N],
      "schemas_found": [N],
      "types": ["Article", "Product"],
      "status": "[pass|warn|fail]",
      "results": [
        {
          "file": "[path]",
          "status": "[pass|warn|fail]",
          "schemas": [N],
          "types": ["Article"],
          "errors": [
            {
              "code": "E505",
              "message": "Article: Missing required field \"author\"",
              "location": "index.html:45",
              "context": "Required by Google Rich Results",
              "fix": "Add the author property"
            }
          ],
          "warnings": [...]
        }
      ],
      "summary": "[N] failed, [N] passed, [N] warnings"
    }
    ```

22. **Otherwise, output markdown report**:

    ```
    ## Structured Data Validation Report

    Validating [N] files ([total_schemas] schemas found)...

    [For each file with issues, sorted by status (fail first):]

    [FAIL] path/to/file.html (Article, Product)
      [E505] Article: Missing required field "author"
             Required by Google Rich Results
      [E505] Product: Missing required field "offers"
             Required by Google Rich Results

    [WARN] path/to/other.html (FAQ)
      [E505] FAQ: Missing recommended field "dateModified"

    [PASS] path/to/good.html (Article)

    ---

    Summary: [N] failed, [N] passed, [N] warnings
    Types validated: Article, Product, FAQ
    ```

23. **If --verbose, add performance info**:
    ```
    ---
    Performance: [N] files validated in [X.XX]s ([X.XXX]s/file)
    Schemas processed: [N]
    Types found: [list of types]
    ```

### Phase 5: Exit Code

24. **Determine exit code**:
    ```
    If any fatal errors (E1XX - file not found, etc.):
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
| E504 | Invalid JSON-LD (syntax, @context) | 1 |
| E505 | Schema validation error (type, required fields) | 1 |

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All files passed validation |
| 1 | One or more files failed validation |
| 2 | Fatal error (no files found, etc.) |

## Validation Rules

### Required: @context

Must be `"https://schema.org"` (preferred) or `"http://schema.org"`.

### Required: @type

Must be a valid schema.org type.

### Google Rich Results Types

| Type | Required Fields | Google Support |
|------|-----------------|----------------|
| Article | headline, author, datePublished | Yes |
| Product | name, image | Yes |
| LocalBusiness | name, address | Yes |
| FAQ/FAQPage | mainEntity (with Questions) | Yes |
| HowTo | name, step | Yes |
| BreadcrumbList | itemListElement | Yes |
| Recipe | name, recipeIngredient | Yes |
| Organization | name, url | Yes |

### Date Format

All dates must use ISO 8601 format:
- `YYYY-MM-DD` (e.g., 2026-01-15)
- `YYYY-MM-DDTHH:MM:SS` (e.g., 2026-01-15T14:30:00)

### URL Format

All URLs should be absolute (starting with `http://` or `https://`).

## Examples

### Validate all HTML files
```
/seo-validate-structured
```

### Validate specific directory
```
/seo-validate-structured src/**/*.html
```

### Validate only Article schemas
```
/seo-validate-structured --type Article
```

### JSON output for CI/CD
```
/seo-validate-structured --json
```

### Validate external JSON-LD file
```
/seo-validate-structured schema/product.json
```

### Verbose output with timing
```
/seo-validate-structured --verbose
```

## Sample Output

### Standard Output
```
/seo-validate-structured src/**/*.html

Validating 8 files (12 schemas found)...

[FAIL] src/products/widget.html (Product)
  [E505] Product: Missing required field "offers"
         Required by Google Rich Results
  [E505] Product: Missing recommended field "aggregateRating"

[WARN] src/blog/article.html (Article)
  [E505] Article: Missing recommended field "dateModified"

[PASS] src/index.html (Organization, BreadcrumbList)
[PASS] src/faq.html (FAQPage)

---

Summary: 1 failed, 1 warning, 2 passed
Types validated: Product, Article, Organization, BreadcrumbList, FAQPage
```

### JSON Output
```json
{
  "validator": "structured-data",
  "files_validated": 8,
  "schemas_found": 12,
  "types": ["Product", "Article", "Organization", "BreadcrumbList", "FAQPage"],
  "status": "fail",
  "results": [
    {
      "file": "src/products/widget.html",
      "status": "fail",
      "schemas": 1,
      "types": ["Product"],
      "errors": [
        {
          "code": "E505",
          "message": "Product: Missing required field \"offers\"",
          "location": "src/products/widget.html:45",
          "context": "Required by Google Rich Results",
          "fix": "Add the offers property with a valid value"
        }
      ],
      "warnings": [
        {
          "code": "E505",
          "message": "Product: Missing recommended field \"aggregateRating\"",
          "location": "src/products/widget.html:45",
          "context": "Recommended for better Rich Results",
          "fix": "Consider adding aggregateRating for enhanced visibility"
        }
      ]
    }
  ],
  "summary": "1 failed, 1 warning, 2 passed"
}
```

## Reference Skills

- `seo-validation`: Error codes and validation patterns
- `seo-validation/structured-data`: Detailed JSON-LD validation patterns
- `error-handling`: Standardized error format

## Performance

- **Target**: < 0.8s per file
- **Strategy**: Local validation only (no HTTP requests)
- **Optimization**: Regex-based extraction, in-memory validation
