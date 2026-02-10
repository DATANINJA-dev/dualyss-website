# languagetool-client

## Status

**Active** - Implemented in TASK-144 (EPIC-015)

## Description

LanguageTool HTTP client with tiered dictionary caching for optimized multi-language spell/grammar validation. Implements three-tier caching strategy: tier1 (memory-permanent), tier2 (session), tier3 (disk with TTL).

## Auto-Activation Triggers

- When implementing `/seo-validate-orthography` command
- When validating multi-language content (tier2/tier3 languages)
- When optimizing spell-check performance
- User mentions: "tiered caching", "languagetool", "dictionary loading"

## LanguageToolClient Interface

```typescript
interface ValidationResult {
  language: string;
  matches: ValidationMatch[];
  executionTime: number;
  cacheStatus: 'tier1' | 'tier2' | 'tier3' | 'miss';
}

interface ValidationMatch {
  message: string;
  offset: number;
  length: number;
  replacements: string[];
  rule: {
    id: string;
    category: string;
  };
}

interface CacheStats {
  tier1: { loaded: number; total: number; languages: string[] };
  tier2: { loaded: number; languages: string[] };
  tier3: { cached: number; languages: string[]; diskSize: number };
  hitRate: number;
}

interface LanguageToolClient {
  /**
   * Validate text for spelling/grammar errors
   * @param text - Content to validate
   * @param language - Target language code (e.g., "en", "es")
   * @returns Validation result with matches
   */
  validate(text: string, language: string): Promise<ValidationResult>;

  /**
   * Check if LanguageTool service is available
   * @returns true if service reachable within timeout
   */
  isAvailable(): Promise<boolean>;

  /**
   * Get supported languages from server
   * @returns Array of language codes
   */
  getSupportedLanguages(): Promise<string[]>;

  /**
   * Get cache statistics
   * @returns Cache hit/miss stats by tier
   */
  getCacheStats(): CacheStats;

  /**
   * Validate multiple languages in parallel
   * @param text - Content to validate
   * @param languages - Array of language codes
   * @returns Array of validation results
   */
  validateParallel(text: string, languages: string[]): Promise<ValidationResult[]>;

  /**
   * Initialize tier1 dictionaries at startup
   * Loads EN, ES, FR, DE into memory cache
   */
  initializeTier1(): Promise<void>;

  /**
   * Clear session cache (tier2)
   */
  clearSessionCache(): void;

  /**
   * Clear disk cache (tier3) or specific language
   * @param language - Optional specific language to clear
   */
  clearDiskCache(language?: string): Promise<void>;
}
```

## Tiered Dictionary Caching

### Tier Classification

| Tier | Languages | Storage | Lifecycle | Memory |
|------|-----------|---------|-----------|--------|
| Tier1 | en, es, fr, de | Memory | Permanent | ~50MB total |
| Tier2 | ja, zh, ar, ru | Memory | Session | ~20MB each |
| Tier3 | All others | Disk | 7-day TTL | Loaded on-demand |

### TieredDictionaryCache Implementation

```pseudocode
class TieredDictionaryCache:
  # Configuration
  tier1Languages = ["en", "es", "fr", "de"]
  tier2Languages = ["ja", "zh", "ar", "ru"]
  tier3Source = "https://hunspell-dictionaries.github.io"
  tier3TTLDays = 7
  tier3Path = ".cache/hunspell/"

  # Storage
  tier1Cache: Map<string, DictionaryData>   # Memory (permanent)
  tier2Cache: Map<string, DictionaryData>   # Session (cleared on exit)

  # Statistics
  stats: CacheStats = {
    tier1: { loaded: 0, total: 4, languages: [] },
    tier2: { loaded: 0, languages: [] },
    tier3: { cached: 0, languages: [], diskSize: 0 },
    hitRate: 0
  }

  hits: number = 0
  misses: number = 0

  function getTier(language):
    if language in tier1Languages:
      return "tier1"
    if language in tier2Languages:
      return "tier2"
    return "tier3"

  function getDictionary(language):
    tier = getTier(language)

    switch tier:
      case "tier1":
        return getTier1Dictionary(language)
      case "tier2":
        return getTier2Dictionary(language)
      case "tier3":
        return getTier3Dictionary(language)
      default:
        throw Error("E533: Language not supported: " + language)

  function getTier1Dictionary(language):
    if tier1Cache.has(language):
      hits++
      return tier1Cache.get(language)

    # Tier1 should be pre-loaded at startup
    misses++
    dict = await loadFromLanguageTool(language)
    tier1Cache.set(language, dict)
    stats.tier1.loaded++
    stats.tier1.languages.push(language)
    return dict

  function getTier2Dictionary(language):
    if tier2Cache.has(language):
      hits++
      return tier2Cache.get(language)

    # Load on-demand for this session
    misses++
    dict = await loadFromLanguageTool(language)
    tier2Cache.set(language, dict)
    stats.tier2.loaded++
    stats.tier2.languages.push(language)
    return dict

  function getTier3Dictionary(language):
    diskPath = tier3Path + language + ".dic"

    # Check disk cache with TTL
    if exists(diskPath):
      fileAge = daysSince(getModifiedTime(diskPath))
      if fileAge < tier3TTLDays:
        hits++
        return loadFromDisk(diskPath)
      else:
        # Expired, remove and re-download
        delete(diskPath)

    # Download from Hunspell remote
    misses++
    dict = await downloadHunspell(language)
    await saveToDisk(diskPath, dict)
    stats.tier3.cached++
    stats.tier3.languages.push(language)
    stats.tier3.diskSize += getFileSize(diskPath)
    return dict

  function getCacheStats():
    stats.hitRate = hits / (hits + misses) if (hits + misses) > 0 else 0
    return stats

  function clearSession():
    tier2Cache.clear()
    stats.tier2 = { loaded: 0, languages: [] }

  async function clearDiskCache(language = null):
    if language:
      diskPath = tier3Path + language + ".dic"
      if exists(diskPath):
        delete(diskPath)
        stats.tier3.languages.remove(language)
        stats.tier3.cached--
    else:
      # Clear all tier3 cache
      deleteDirectory(tier3Path)
      stats.tier3 = { cached: 0, languages: [], diskSize: 0 }
```

### Initialization Pattern

```pseudocode
async function initializeClient():
  client = new LanguageToolClient()

  # Check availability with timeout
  available = await client.isAvailable()
  if not available:
    throw Error("E535: LanguageTool not available")

  # Pre-load tier1 dictionaries (parallel)
  await Promise.all([
    client.cache.getTier1Dictionary("en"),
    client.cache.getTier1Dictionary("es"),
    client.cache.getTier1Dictionary("fr"),
    client.cache.getTier1Dictionary("de")
  ])

  return client
```

## Parallel Validation

```pseudocode
async function validateMultipleLanguages(text, detectedLanguages):
  # Filter to supported languages
  validLangs = detectedLanguages.filter(lang =>
    getTier(lang) != null
  )

  if validLangs.length == 0:
    throw Error("E533: No supported languages in " + detectedLanguages.join(", "))

  # Parallel validation with individual error handling
  results = await Promise.all(
    validLangs.map(lang =>
      client.validate(text, lang)
        .then(result => ({ success: true, result, lang }))
        .catch(error => ({ success: false, error, lang }))
    )
  )

  # Separate successes and failures
  successes = results.filter(r => r.success)
  failures = results.filter(r => !r.success)

  if failures.length > 0:
    # Log warnings for failed languages, continue with successes
    for failure in failures:
      console.warn("[WARNING] Validation failed for " + failure.lang + ": " + failure.error.message)

  return successes.map(r => r.result)
```

## Availability Check

```pseudocode
async function checkAvailability():
  endpoints = [
    { name: "self-hosted", url: "http://localhost:8081/v2/languages" },
    { name: "premium", url: "https://api.languagetoolplus.com/v2/languages" }
  ]

  for endpoint in endpoints:
    try:
      response = await http_get(endpoint.url, {
        timeout: 2000,  # 2s timeout
        headers: getAuthHeaders(endpoint.name)
      })

      if response.status == 200:
        return { available: true, mode: endpoint.name }
    catch error:
      continue  # Try next endpoint

  return { available: false, mode: null }

function getAuthHeaders(mode):
  if mode == "premium" and env.LANGUAGETOOL_API_KEY:
    return { "x-api-key": env.LANGUAGETOOL_API_KEY }
  return {}
```

## Graceful Degradation

```pseudocode
async function validateWithFallback(text, language):
  try:
    # Check availability
    availability = await checkAvailability()

    if not availability.available:
      throw Error("E535: LanguageTool not available")

    # Attempt validation
    result = await client.validate(text, language)
    return result

  catch error:
    # Check if fallback enabled
    if env.SEO_FALLBACK_TO_HUNSPELL == "true":
      console.warn("[INFO] LanguageTool unavailable, using basic spell check")
      return await hunspellFallback(text, language)
    else:
      throw error

async function hunspellFallback(text, language):
  # Basic spell check only (no grammar)
  dictionary = await loadHunspellDictionary(language)

  if not dictionary:
    throw Error("E536: Hunspell download failed for " + language)

  words = tokenize(text)
  misspelled = words.filter(word => !dictionary.check(word))

  return {
    language: language,
    matches: misspelled.map(word => ({
      message: "Possible spelling mistake",
      offset: text.indexOf(word),
      length: word.length,
      replacements: dictionary.suggest(word).slice(0, 3),
      rule: { id: "HUNSPELL_SPELL", category: "TYPOS" }
    })),
    executionTime: 0,
    cacheStatus: "tier3",
    fallbackMode: true
  }
```

## Hunspell Remote Download

```pseudocode
async function downloadHunspell(language):
  baseUrl = "https://hunspell-dictionaries.github.io/dictionaries"

  # Map language code to Hunspell dictionary name
  dictMap = {
    "pt": "pt_BR",
    "zh": "zh_CN",
    "sr": "sr_Latn",
    # ... other mappings
  }

  dictName = dictMap[language] or language
  url = baseUrl + "/" + dictName + "/" + dictName + ".dic"

  try:
    response = await http_get(url, {
      timeout: 10000,  # 10s timeout for large dictionaries
      retries: 3,
      retryDelay: 1000
    })

    if response.status != 200:
      throw Error("E536: Hunspell download failed: HTTP " + response.status)

    return {
      data: response.body,
      language: language,
      downloadedAt: now(),
      size: response.body.length
    }

  catch error:
    if error.code == "ETIMEDOUT":
      throw Error("E536: Hunspell download failed: Network timeout")
    throw Error("E536: Hunspell download failed: " + error.message)
```

## Error Codes (E536-E537)

| Code | Message | Suggested Fix | Exit |
|------|---------|---------------|------|
| E536 | Hunspell download failed | Check network connectivity, try again later | 2 |
| E537 | Cache corrupted | Clear cache with `--clear-cache`, reload dictionaries | 2 |

### Error Message Format

```
[ERROR] E536: Hunspell download failed

Details: Failed to download dictionary for language "pt"
         Network timeout after 10000ms (3 retries)

Suggested fix:
  → Check internet connectivity
  → Try again later (dictionary server may be down)
  → Use tier1/tier2 languages only: en, es, fr, de, ja, zh, ar, ru
```

```
[ERROR] E537: Cache corrupted

Details: Dictionary file corrupted or invalid
         File: .cache/hunspell/pt.dic
         Expected format: Hunspell .dic, got: unknown

Suggested fix:
  → Clear cache: /seo-validate-orthography --clear-cache
  → Re-run validation to re-download dictionaries
```

## Performance Targets

| Scenario | Target | Implementation |
|----------|--------|----------------|
| 2 tier1 languages | <1.5s | Memory cache + parallel validation |
| 5 languages (tier1+tier2) | <2.2s | On-demand load + parallel |
| 50 languages (all tiers) | <8s first, <3s cached | Disk cache + parallel |
| Tier3 first-time download | <10s | Network dependent |

## Timeout Configuration

| Operation | Timeout | Retries | Notes |
|-----------|---------|---------|-------|
| Availability check | 2000ms | 1 | Fast fail for startup |
| Validation request | 5000ms | 2 | Allow for cold start |
| Hunspell download | 10000ms | 3 | Network dependency |
| Cache read (disk) | 100ms | 0 | Local operation |
| Cache read (memory) | 0ms | 0 | Instant |

## Service Priority

```
1. Self-hosted LanguageTool (localhost:8081) - Default, fastest
2. Premium API (api.languagetoolplus.com) - If LANGUAGETOOL_API_KEY set
3. Hunspell-only fallback - Degraded mode, spell-only (no grammar)
```

## Verbose Output

```
[2026-01-15T12:00:00Z] LanguageTool Client
    ├─ Mode: self-hosted (localhost:8081)
    ├─ Cache Stats:
    │   ├─ Tier1 (memory): 4/4 languages loaded [en, es, fr, de]
    │   ├─ Tier2 (session): 1 language cached [ja]
    │   └─ Tier3 (disk): 2 languages cached [pt, nl] (3.2MB)
    ├─ Hit Rate: 87.5%
    └─ Service available: yes
```

## Integration Points

This client is consumed by:
- `.claude/skills/seo-validation/orthography.md` - Language detection and validation
- `/seo-validate-orthography` command (TASK-143)
- `set-up-seo.md` agent content quality analysis (TASK-150)

## Security Considerations

### Credential Handling

| Concern | Implementation |
|---------|----------------|
| Premium API key | Environment variable `LANGUAGETOOL_API_KEY`, never logged |
| API key masking | Use `[REDACTED]` in verbose output |
| Content privacy | Self-hosted default ensures text stays local |

### Network Security

| Concern | Implementation |
|---------|----------------|
| Hunspell download | HTTPS only from trusted source |
| Premium API | TLS 1.2+ required |
| Cache integrity | Validate dictionary format on load, clear if invalid |

## See Also

- `.claude/skills/seo-validation/orthography.md` - Core orthography patterns
- `.claude/skills/seo-validation/SKILL.md` - Skill registration
- `.claude/skills/error-handling/error-codes.md` - E53X error codes
- EPIC-015 - Multi-Language & Content Quality epic
