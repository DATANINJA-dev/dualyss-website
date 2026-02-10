# orthography

## Status

**Active** - Implemented in TASK-143 (EPIC-015)

## Description

Validate content spelling and grammar for SEO content quality using LanguageTool integration. Supports tier1 languages (EN, ES, FR, DE) with in-memory caching for <2s performance.

## Auto-Activation Triggers

- User mentions: "spelling", "grammar", "orthography", "proofreading", "typos"
- When implementing `/seo-validate-orthography` command
- During content quality validation
- When reviewing multi-language content

## LanguageTool Client

For tiered dictionary caching, parallel validation, and graceful degradation patterns, see:
- `.claude/skills/seo-validation/languagetool-client.md` (TASK-144)

The client implements:
- **Tier1 (memory)**: en, es, fr, de - permanent cache, ~50MB
- **Tier2 (session)**: ja, zh, ar, ru - on-demand, cleared on exit
- **Tier3 (disk)**: All others - 7-day TTL, downloaded from Hunspell

## Language Support

### Tier1 Languages (In-Memory)

| Code | Language | Detection | Notes |
|------|----------|-----------|-------|
| en | English | `lang="en"`, `en-US`, `en-GB` | Default if auto-detected |
| es | Spanish | `lang="es"`, `es-ES`, `es-MX` | Include Latin American variants |
| fr | French | `lang="fr"`, `fr-FR`, `fr-CA` | Include Canadian French |
| de | German | `lang="de"`, `de-DE`, `de-AT` | Include Austrian German |

### Language Detection Priority

1. **HTML lang attribute**: `<html lang="en-US">`
2. **Content-Language meta**: `<meta http-equiv="Content-Language" content="en">`
3. **Auto-detection**: LanguageTool automatic language detection

```pseudocode
function detectLanguage(content):
    # Priority 1: HTML lang attribute
    lang_attr = regex_match(content, '<html[^>]*lang="([^"]*)"')
    if lang_attr:
        return normalize_lang_code(lang_attr[1])

    # Priority 2: Content-Language meta tag
    meta_lang = regex_match(content, '<meta[^>]*http-equiv="Content-Language"[^>]*content="([^"]*)"')
    if meta_lang:
        return normalize_lang_code(meta_lang[1])

    # Priority 3: LanguageTool auto-detection
    return "auto"

function normalize_lang_code(code):
    # Extract base language from locale (e.g., "en-US" -> "en")
    base = code.split("-")[0].lower()

    tier1 = ["en", "es", "fr", "de"]
    if base in tier1:
        return base
    else:
        return null  # Unsupported language
```

## LanguageTool Integration

### HTTP API Contract

LanguageTool provides a self-hosted HTTP API for text checking.

**Endpoint**: `http://localhost:8081/v2/check`

**Request**:
```json
POST /v2/check
Content-Type: application/x-www-form-urlencoded

text=Your+text+to+check&language=en-US&enabledOnly=false
```

**Response**:
```json
{
  "software": { "name": "LanguageTool", "version": "6.x" },
  "language": { "code": "en-US", "name": "English (US)" },
  "matches": [
    {
      "message": "Possible spelling mistake found.",
      "shortMessage": "Spelling mistake",
      "replacements": [{ "value": "receive" }],
      "offset": 23,
      "length": 7,
      "context": {
        "text": "...to recieve the package...",
        "offset": 4,
        "length": 7
      },
      "rule": {
        "id": "MORFOLOGIK_RULE_EN_US",
        "category": { "id": "TYPOS", "name": "Possible Typo" }
      }
    }
  ]
}
```

### Error Type Classification

| Rule Category | Type | Error Code |
|---------------|------|------------|
| TYPOS | spelling | E531 |
| GRAMMAR | grammar | E532 |
| PUNCTUATION | grammar | E532 |
| STYLE | warning | - |
| REDUNDANCY | warning | - |
| CASING | spelling | E531 |

### Availability Check

```pseudocode
function languageTool_available():
    try:
        response = http_get("http://localhost:8081/v2/languages", timeout: 2000ms)
        return response.status == 200
    catch:
        return false
```

## Validation Result Schema

Consistent with seo-validation skill JSON output:

```json
{
  "validator": "orthography",
  "language_detected": "en-US",
  "words_analyzed": 1234,
  "status": "pass|warn|fail",
  "execution_time_ms": 450,
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
  "summary": "2 spelling, 1 grammar"
}
```

### Status Values

| Status | Condition | Exit Code |
|--------|-----------|-----------|
| pass | No errors or warnings | 0 |
| warn | Only warnings (style issues) | 0 |
| fail | Spelling or grammar errors found | 1 |

## Error Codes (E53X Range)

| Code | Message | Suggested Fix | Exit |
|------|---------|---------------|------|
| E530 | Orthography validation failed | Review errors below, fix content issues | 1 |
| E531 | Spelling errors found | Fix misspelled words shown in report | 1 |
| E532 | Grammar errors found | Fix grammar issues shown in report | 1 |
| E533 | Language not supported | Use tier1 languages: en, es, fr, de | 1 |
| E534 | Content not accessible | Check file path/URL is valid and readable | 2 |
| E535 | LanguageTool not available | Install LanguageTool or check server is running | 2 |
| E536 | Hunspell download failed | Check network connectivity, try again later | 2 |
| E537 | Cache corrupted | Clear cache with --clear-cache, reload dictionaries | 2 |

## Performance Budget

Pre-commit and validation must complete within budget:

| Operation | Budget | Condition |
|-----------|--------|-----------|
| Language detection | 0.1s | Always |
| LanguageTool API call | 1.5s | Tier1 language |
| Report generation | 0.2s | Always |
| **Total** | **<2.0s** | Target |

## Quick Reference

### Check LanguageTool Status
```bash
curl -s http://localhost:8081/v2/languages | jq '.[].code' | head -5
```

### Run Validation (CLI)
```bash
# Check a file
echo "This is a tset with spelling erors." | curl -s -X POST \
  http://localhost:8081/v2/check \
  -d "text=$(cat -)&language=en-US" | jq '.matches'
```

### Start LanguageTool Server
```bash
# Java 8+ required
java -cp languagetool-server.jar org.languagetool.server.HTTPServer --port 8081
```

## Integration Points

This skill is consumed by:
- `/seo-validate-orthography` command (TASK-143)
- Pre-commit hook integration (future)
- `set-up-seo.md` agent content quality analysis (TASK-150)

## See Also

- `.claude/skills/error-handling/error-codes.md` - E53X error code registry
- `.claude/skills/seo-content-quality-scoring/` - E-E-A-T and readability patterns
- `.claude/skills/multi-language-seo-patterns/` - Internationalization patterns
- EPIC-015 - Multi-Language & Content Quality epic
