---
description: Generate AI crawler robots.txt rules with presets
allowed-tools: Glob, Grep, Read, Write, AskUserQuestion
argument-hint: "[--preset PRESET] [--output PATH] [--merge] [--crawl-delay N]"
---

# seo-generate-robots

Generate robots.txt rules for AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc.) with preset configurations for controlling how AI platforms index content.

## When to Use

- To create initial AI crawler rules for a new project
- To update existing robots.txt with AI crawler sections
- To switch between allow/block strategies for AI indexing
- To customize crawl-delay settings for AI bots

## Parameters

$ARGUMENTS = Optional flags for configuration

**Flags**:
- `--preset PRESET`: Configuration preset - allow-all (default), block-all, allow-content-only, custom
- `--output PATH`: Output file path (default: robots.txt in project root)
- `--merge`: Merge with existing robots.txt instead of replacing AI section
- `--crawl-delay N`: Set crawl-delay in seconds for AI bots (default: 1)
- `--dry-run`: Preview output without writing to file

## AI Crawler Registry

The following AI crawlers are supported (from geo-optimization-patterns skill):

| Crawler | Organization | Purpose | robots.txt Name |
|---------|--------------|---------|-----------------|
| GPTBot | OpenAI | ChatGPT training/search | GPTBot |
| ChatGPT-User | OpenAI | Real-time ChatGPT browsing | ChatGPT-User |
| OAI-SearchBot | OpenAI | ChatGPT search features | OAI-SearchBot |
| ClaudeBot | Anthropic | Claude training | ClaudeBot |
| Claude-User | Anthropic | Real-time Claude browsing | Claude-User |
| PerplexityBot | Perplexity | AI search indexing | PerplexityBot |
| Google-Extended | Google | Gemini/Vertex AI training | Google-Extended |
| Gemini-Deep-Research | Google | Gemini Deep Research | Gemini-Deep-Research |
| Meta-ExternalAgent | Meta | Meta AI training | Meta-ExternalAgent |
| Amazonbot | Amazon | Alexa/Amazon AI | Amazonbot |
| CCBot | Common Crawl | Open dataset for AI training | CCBot |
| Bytespider | ByteDance | TikTok/ByteDance AI | Bytespider |
| AppleBot-Extended | Apple | Apple Intelligence training | Applebot-Extended |
| Google-CloudVertexBot | Google | Vertex AI Agent Builder | Google-CloudVertexBot |

## Presets

| Preset | Description | Use Case |
|--------|-------------|----------|
| **allow-all** | Allow all AI crawlers full access | Maximum AI visibility, recommended for public content |
| **block-all** | Disallow all AI crawlers | Private content, no AI visibility |
| **allow-content-only** | Allow /blog/, /docs/, /public/; block /admin/, /api/, /private/ | Selective visibility for public content only |
| **custom** | Interactive per-crawler configuration | Fine-grained control per AI platform |

## Instructions

### Phase 0: Input Validation

1. **Parse arguments**:
   - Extract `--preset` flag (default: "allow-all")
   - Extract `--output` flag (default: "robots.txt")
   - Extract `--merge` flag (default: false)
   - Extract `--crawl-delay` flag (default: 1)
   - Extract `--dry-run` flag (default: false)

2. **Store flags for later phases**:
   ```
   preset = "--preset" value or "allow-all"
   output_path = "--output" value or "robots.txt"
   merge_mode = "--merge" flag present
   crawl_delay = "--crawl-delay" value or 1
   dry_run = "--dry-run" flag present
   ```

3. **Validate preset**:
   ```
   valid_presets = ["allow-all", "block-all", "allow-content-only", "custom"]

   If preset not in valid_presets:
     [ERROR] E530: Invalid preset "[preset]"

     Details: Valid presets are: allow-all, block-all, allow-content-only, custom

     Suggested fix:
       → /seo-generate-robots --preset allow-all
       → /seo-generate-robots --preset block-all
     Exit 1
   ```

4. **Validate crawl-delay**:
   ```
   If crawl_delay is not a positive integer:
     [ERROR] E531: Invalid crawl-delay "[crawl_delay]"

     Details: Crawl-delay must be a positive integer (seconds)

     Suggested fix:
       → /seo-generate-robots --crawl-delay 1
       → /seo-generate-robots --crawl-delay 2
     Exit 1

   If crawl_delay > 10:
     [WARNING] High crawl-delay ([crawl_delay]s) may significantly slow AI indexing.
   ```

5. **Validate output path**:
   ```
   If output_path contains invalid characters:
     [ERROR] E100: Invalid output path "[output_path]"

     Details: Path contains invalid characters

     Suggested fix:
       → Use a valid file path
     Exit 1
   ```

### Phase 1: Load Crawler Registry

6. **Define AI crawler list** (from geo-optimization-patterns):
   ```
   ai_crawlers = [
     { name: "GPTBot", org: "OpenAI", purpose: "ChatGPT training/search" },
     { name: "ChatGPT-User", org: "OpenAI", purpose: "Real-time ChatGPT browsing" },
     { name: "OAI-SearchBot", org: "OpenAI", purpose: "ChatGPT search features" },
     { name: "ClaudeBot", org: "Anthropic", purpose: "Claude training" },
     { name: "Claude-User", org: "Anthropic", purpose: "Real-time Claude browsing" },
     { name: "PerplexityBot", org: "Perplexity", purpose: "AI search indexing" },
     { name: "Google-Extended", org: "Google", purpose: "Gemini/Vertex AI training" },
     { name: "Gemini-Deep-Research", org: "Google", purpose: "Gemini Deep Research" },
     { name: "Meta-ExternalAgent", org: "Meta", purpose: "Meta AI training" },
     { name: "Amazonbot", org: "Amazon", purpose: "Alexa/Amazon AI" },
     { name: "CCBot", org: "Common Crawl", purpose: "Open dataset for AI training" },
     { name: "Bytespider", org: "ByteDance", purpose: "TikTok/ByteDance AI" },
     { name: "Applebot-Extended", org: "Apple", purpose: "Apple Intelligence training" },
     { name: "Google-CloudVertexBot", org: "Google", purpose: "Vertex AI Agent Builder" }
   ]
   ```

7. **Display crawler count**:
   ```
   Loaded [14] AI crawlers from registry.
   ```

### Phase 2: Apply Preset Rules

8. **Generate rules based on preset**:

   **If preset == "allow-all"**:
   ```
   For each crawler in ai_crawlers:
     rules.push({
       user_agent: crawler.name,
       directives: ["Allow: /"],
       crawl_delay: crawl_delay
     })
   ```

   **If preset == "block-all"**:
   ```
   For each crawler in ai_crawlers:
     rules.push({
       user_agent: crawler.name,
       directives: ["Disallow: /"],
       crawl_delay: null  # No crawl-delay needed for blocked crawlers
     })
   ```

   **If preset == "allow-content-only"**:
   ```
   allowed_paths = ["/blog/", "/docs/", "/public/", "/articles/"]
   blocked_paths = ["/admin/", "/api/", "/private/", "/user/", "/internal/"]

   For each crawler in ai_crawlers:
     directives = []
     For each path in allowed_paths:
       directives.push("Allow: " + path)
     For each path in blocked_paths:
       directives.push("Disallow: " + path)

     rules.push({
       user_agent: crawler.name,
       directives: directives,
       crawl_delay: crawl_delay
     })
   ```

   **If preset == "custom"**:
   ```
   ## Custom Configuration Mode

   Configure each AI crawler individually:

   For each crawler in ai_crawlers:
     Use AskUserQuestion:
       question: "Configure [crawler.name] ([crawler.org] - [crawler.purpose])?"
       header: "[crawler.name]"
       multiSelect: false
       options:
         - label: "Allow all"
           description: "Allow: / - Full access to site"
         - label: "Block all"
           description: "Disallow: / - No access"
         - label: "Content only"
           description: "Allow /blog/, /docs/; Block /admin/, /api/"
         - label: "Skip"
           description: "Don't include rules for this crawler"

     Based on user response, add appropriate rules
   ```

### Phase 3: Generate robots.txt Content

9. **Build robots.txt content**:
   ```
   output = ""

   # Add header comment
   output += "# ============================================\n"
   output += "# AI Crawler Rules\n"
   output += "# Generated by: /seo-generate-robots\n"
   output += "# Preset: [preset]\n"
   output += "# Generated: [ISO_8601_NOW]\n"
   output += "# Crawlers: [ai_crawlers.length]\n"
   output += "# ============================================\n\n"

   # Group crawlers by organization for readability
   orgs = ["OpenAI", "Anthropic", "Google", "Perplexity", "Meta", "Amazon", "Common Crawl", "ByteDance", "Apple"]

   For each org in orgs:
     org_crawlers = rules.filter(r => r.org == org)
     If org_crawlers.length > 0:
       output += "# " + org + "\n"
       For each rule in org_crawlers:
         output += "User-agent: " + rule.user_agent + "\n"
         For each directive in rule.directives:
           output += directive + "\n"
         If rule.crawl_delay:
           output += "Crawl-delay: " + rule.crawl_delay + "\n"
         output += "\n"
   ```

### Phase 4: Validate Syntax

10. **Validate RFC 9309 compliance**:
    ```
    # Check for common robots.txt errors
    errors = []

    If output contains "User-agent:" without following directive:
      errors.push("User-agent without directive")

    If output contains invalid directive keywords:
      errors.push("Invalid directive keyword")

    If errors.length > 0:
      [ERROR] E532: Generated robots.txt has syntax errors

      Details: [errors.join(", ")]

      This is an internal error. Please report.
      Exit 2
    ```

11. **Display validation result**:
    ```
    Syntax validation: PASS (RFC 9309 compliant)
    ```

### Phase 5: Merge with Existing (if --merge)

12. **Check for existing robots.txt**:
    ```
    If merge_mode:
      Try:
        existing_content = Read(file_path: output_path)

        If existing_content is empty:
          [INFO] No existing robots.txt found. Creating new file.
          merge_mode = false
        Else:
          [INFO] Found existing robots.txt ([existing_content.length] bytes)
      Catch:
        [INFO] No existing robots.txt found at [output_path]. Creating new file.
        merge_mode = false
    ```

13. **Merge content** (if existing found):
    ```
    If merge_mode AND existing_content:
      # Detect AI crawler section markers
      ai_section_start = "# ============================================\n# AI Crawler Rules"
      ai_section_end_pattern = /^# [A-Za-z]+ Crawler Rules|^User-agent: (?!GPTBot|ChatGPT|Claude|Perplexity|Google-Extended|Meta|Amazon|CCBot|Bytespider|Apple)/m

      If existing_content contains ai_section_start:
        # Replace existing AI section
        start_index = existing_content.indexOf(ai_section_start)
        end_match = existing_content.substring(start_index + ai_section_start.length).match(ai_section_end_pattern)

        If end_match:
          end_index = start_index + ai_section_start.length + end_match.index
        Else:
          end_index = existing_content.length

        merged_content = existing_content.substring(0, start_index) + output + existing_content.substring(end_index)
        [INFO] Replaced existing AI crawler section.
      Else:
        # Append AI section at end
        merged_content = existing_content + "\n" + output
        [INFO] Appended AI crawler section to existing robots.txt.

      output = merged_content
    ```

### Phase 6: Output

14. **Preview output** (if --dry-run or always show preview):
    ```
    ## Generated robots.txt

    \`\`\`
    [output]
    \`\`\`

    | Metric | Value |
    |--------|-------|
    | Preset | [preset] |
    | Crawlers | [ai_crawlers.length] |
    | Crawl-delay | [crawl_delay]s |
    | Lines | [output.split("\n").length] |
    | Bytes | [output.length] |
    ```

15. **Handle dry-run**:
    ```
    If dry_run:
      [INFO] Dry-run mode. No files written.
      Exit 0
    ```

16. **Write to file**:
    ```
    Try:
      Write(file_path: output_path, content: output)

      [OK] robots.txt written to: [output_path]

      ### Summary
      | Field | Value |
      |-------|-------|
      | File | [output_path] |
      | Preset | [preset] |
      | Crawlers | [ai_crawlers.length] |
      | Crawl-delay | [crawl_delay]s |
      | Mode | [merge_mode ? "Merged" : "Created"] |

      ### Next Steps
      1. Review the generated rules
      2. Test with: `curl https://yoursite.com/robots.txt`
      3. Verify AI crawler access with server logs

    Catch write_error:
      [ERROR] E101: Cannot write to [output_path]

      Details: [write_error.message]

      Suggested fix:
        → Check file permissions
        → Use --output to specify different path
      Exit 2
    ```

17. **Exit with success**:
    ```
    Exit 0
    ```

## Error Codes

| Code | Description | Exit |
|------|-------------|------|
| E100 | Invalid output path | 1 |
| E101 | Cannot write to file | 2 |
| E530 | Invalid preset | 1 |
| E531 | Invalid crawl-delay | 1 |
| E532 | Syntax validation failed | 2 |
| E533 | Merge parse error | 1 |

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success - robots.txt generated |
| 1 | User input error (invalid preset, path, etc.) |
| 2 | System error (write failure, internal error) |

## Examples

### Generate default allow-all rules
```
/seo-generate-robots
```

### Block all AI crawlers
```
/seo-generate-robots --preset block-all
```

### Allow content directories only
```
/seo-generate-robots --preset allow-content-only
```

### Custom per-crawler configuration
```
/seo-generate-robots --preset custom
```

### Merge with existing robots.txt
```
/seo-generate-robots --merge
```

### Preview without writing (dry-run)
```
/seo-generate-robots --dry-run
```

### Set custom crawl-delay
```
/seo-generate-robots --crawl-delay 2
```

### Output to custom path
```
/seo-generate-robots --output public/robots.txt
```

### Combine flags
```
/seo-generate-robots --preset allow-content-only --merge --crawl-delay 2 --output dist/robots.txt
```

## Reference Skills

- `geo-optimization-patterns`: AI crawler registry, robots.txt templates, platform strategies
- `error-handling`: Standardized error codes (E530-E539 range)

## Notes

- **RFC 9309**: Output follows the current robots.txt specification standard
- **Crawl-delay**: Recommended 1-2 seconds for AI bots to prevent server overload
- **Merge Mode**: Preserves existing non-AI crawler rules when merging
- **Custom Mode**: Interactive configuration for fine-grained control
- **Validation**: Syntax validation ensures RFC 9309 compliance before writing
