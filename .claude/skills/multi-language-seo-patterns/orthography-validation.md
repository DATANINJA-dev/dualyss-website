# Orthography Validation Workflow

This document covers translation quality assurance, spell-checking integration, and validation patterns for multi-language content. Orthography errors in translated content can damage brand credibility and SEO performance.

## Translation QA Process

### The Four-Stage Workflow

```
Stage 1: Machine Translation (MT)
    ↓
Stage 2: Human Post-Editing (PE)
    ↓
Stage 3: Automated Validation
    ↓
Stage 4: Native Speaker Review
```

### Stage 1: Machine Translation

**When to Use MT**:
- Large content volumes
- Technical/repetitive content
- Internal documentation
- Initial draft generation

**MT Quality Tiers**:

| Tier | Engine | Quality | Best For |
|------|--------|---------|----------|
| Premium | DeepL Pro, Google Cloud Translation | High | Marketing, UI text |
| Standard | Google Translate, Microsoft | Medium | Support docs, internal |
| Basic | Free tier services | Variable | Draft/reference only |

**MT Limitations**:
- Struggles with idioms and cultural references
- May miss context (homonyms, ambiguity)
- Doesn't understand brand terminology
- Can produce "fluent nonsense"

### Stage 2: Human Post-Editing

**Post-Editing Levels**:

| Level | Effort | Output Quality | Use Case |
|-------|--------|----------------|----------|
| Light PE | 20-30% of full translation | Good | Internal, low-visibility |
| Full PE | 50-70% of full translation | High | External, customer-facing |
| Transcreation | 100%+ of translation | Premium | Marketing, creative |

**Post-Editor Checklist**:
- [ ] Correct meaning preserved
- [ ] Grammar and syntax correct
- [ ] Terminology consistent
- [ ] Cultural appropriateness verified
- [ ] Brand voice maintained
- [ ] No literal translations of idioms
- [ ] Numbers, dates, currencies correct

### Stage 3: Automated Validation

Automated tools catch systematic errors at scale.

**Validation Categories**:

| Category | What It Catches | Tools |
|----------|-----------------|-------|
| Spelling | Typos, misspellings | LanguageTool, Hunspell |
| Grammar | Syntax errors, agreement | LanguageTool, Grammarly |
| Terminology | Inconsistent terms | SDL MultiTerm, Phrase |
| Formatting | Numbers, dates, placeholders | Custom regex |
| Completeness | Missing translations | Diff tools |

### Stage 4: Native Speaker Review

**Why Native Review is Critical**:
- Catches unnatural phrasing
- Identifies cultural issues
- Validates local expressions
- Ensures brand consistency

**Review Checklist**:
- [ ] Does it sound natural?
- [ ] Would a local person say this?
- [ ] Are regional variations correct?
- [ ] Is the tone appropriate?
- [ ] Are cultural references accurate?

## Spell-Check Tools

### LanguageTool

**Overview**: Open-source grammar and spell checker supporting 30+ languages.

**Integration Options**:

| Method | Use Case | Complexity |
|--------|----------|------------|
| Browser extension | Manual review | Low |
| API | CI/CD integration | Medium |
| Self-hosted | Enterprise, privacy | High |

**API Example**:
```bash
curl -X POST "https://api.languagetool.org/v2/check" \
  -d "text=This is a tset sentnce." \
  -d "language=en-US"
```

**Response**:
```json
{
  "matches": [
    {
      "message": "Possible spelling mistake found.",
      "offset": 10,
      "length": 4,
      "replacements": [{"value": "test"}]
    }
  ]
}
```

**Language Support** (Tier 1 - Best Support):
- English (US, UK, AU, CA)
- German (DE, AT, CH)
- French
- Spanish
- Portuguese (PT, BR)
- Dutch

### Microsoft Speller100

**Overview**: Zero-shot spelling correction for 100+ languages using language family patterns.

**Key Features**:
- No per-language training required
- Works with low-resource languages
- Handles code-switching (mixed languages)
- Production-ready at scale

**Language Families Supported**:
- Indo-European (Romance, Germanic, Slavic)
- Sino-Tibetan (Chinese variants)
- Afroasiatic (Arabic, Hebrew)
- Austronesian (Indonesian, Filipino)
- And many more

**Use Case**: Ideal for applications supporting many languages without maintaining separate models per language.

### WebSpellChecker

**Overview**: Commercial spell-checking service with CMS integrations.

**Integrations**:
- WordPress
- Drupal
- Froala Editor
- TinyMCE
- CKEditor

**Features**:
- 168 languages
- Custom dictionaries
- Real-time checking
- Accessibility compliance

### Hunspell

**Overview**: Open-source spell checker used by LibreOffice, Firefox, Chrome.

**Advantages**:
- Free and open source
- Extensive language dictionaries
- Offline capable
- Programmable

**Integration** (Node.js example):
```javascript
const Hunspell = require('hunspell-spellchecker');

const spellchecker = new Hunspell();
spellchecker.use(dictionary);

const isCorrect = spellchecker.check('hello');
const suggestions = spellchecker.suggest('helo');
```

## Common Orthography Errors by Language

### English

| Error Type | Example | Correct |
|------------|---------|---------|
| Homophones | their/there/they're | Context-dependent |
| Double letters | accomodate | accommodate |
| Silent letters | knowledege | knowledge |
| -ible/-able | responsable | responsible |

### Spanish

| Error Type | Example | Correct |
|------------|---------|---------|
| Accent marks | informacion | información |
| B/V confusion | tubo (had) | tuvo |
| H placement | haora | ahora |
| LL/Y (yeísmo) | Regional variation | Accept both |

### German

| Error Type | Example | Correct |
|------------|---------|---------|
| Compound words | Schiff fahrt | Schifffahrt |
| ß/ss rules | Straße/Strasse | Both valid (regional) |
| Umlaut | Muenchen | München |
| Case (nouns) | der computer | der Computer |

### French

| Error Type | Example | Correct |
|------------|---------|---------|
| Accents | cafe | café |
| Gender agreement | une problème | un problème |
| Silent letters | fréquament | fréquemment |
| Liaison | Context-dependent | Follow rules |

### Portuguese (BR vs PT)

| Feature | Brazilian | European |
|---------|-----------|----------|
| Spelling reform | Accepted | Accepted |
| Diacritics | Some removed | Traditional |
| "você" usage | Common | Formal only |
| Gerund vs infinitive | Gerund preferred | Infinitive preferred |

## Validation Workflow Implementation

### CI/CD Integration

**GitHub Actions Example**:
```yaml
name: Translation QA

on:
  pull_request:
    paths:
      - 'locales/**'

jobs:
  spell-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install LanguageTool
        run: |
          wget https://languagetool.org/download/LanguageTool-stable.zip
          unzip LanguageTool-stable.zip

      - name: Check translations
        run: |
          for file in locales/*.json; do
            java -jar LanguageTool-*/languagetool-commandline.jar \
              --language auto \
              --json \
              "$file" > "results_$(basename $file).json"
          done

      - name: Report errors
        run: |
          # Parse results and fail if errors found
          node scripts/check-spelling-results.js
```

### Pre-Commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Check modified translation files
TRANSLATION_FILES=$(git diff --cached --name-only | grep "locales/")

if [ -n "$TRANSLATION_FILES" ]; then
  echo "Checking translation files..."

  for file in $TRANSLATION_FILES; do
    # Run spell check
    result=$(languagetool --language auto "$file" 2>&1)

    if echo "$result" | grep -q "Error"; then
      echo "Spelling errors found in $file:"
      echo "$result"
      exit 1
    fi
  done

  echo "All translation files passed spell check."
fi
```

### Terminology Consistency Check

```javascript
// Check for consistent terminology usage
const TERMINOLOGY = {
  en: {
    'shopping cart': 'cart',      // Preferred: cart
    'basket': 'cart',              // Normalize to: cart
  },
  de: {
    'Einkaufswagen': 'Warenkorb', // Preferred: Warenkorb
  }
};

function checkTerminology(content, language) {
  const terms = TERMINOLOGY[language] || {};
  const issues = [];

  for (const [nonPreferred, preferred] of Object.entries(terms)) {
    if (content.includes(nonPreferred)) {
      issues.push({
        found: nonPreferred,
        preferred: preferred,
        message: `Use "${preferred}" instead of "${nonPreferred}"`
      });
    }
  }

  return issues;
}
```

## Quality Metrics

### Translation Quality Score (TQS)

| Metric | Weight | Measurement |
|--------|--------|-------------|
| Accuracy | 30% | Meaning preservation |
| Fluency | 25% | Natural expression |
| Terminology | 20% | Consistent terms |
| Style | 15% | Brand voice |
| Formatting | 10% | Numbers, dates, etc. |

### Error Severity Levels

| Level | Definition | Impact |
|-------|------------|--------|
| Critical | Meaning changed, offensive | Block publication |
| Major | Grammar error, awkward | Requires fix |
| Minor | Typo, style inconsistency | Should fix |
| Preference | Style choice | Optional fix |

### Quality Thresholds

| Content Type | Minimum TQS | Error Tolerance |
|--------------|-------------|-----------------|
| Marketing | 95% | 0 critical, 0 major |
| Product UI | 90% | 0 critical, <3 major |
| Support docs | 85% | 0 critical, <5 major |
| Internal | 80% | <2 critical |

## Validation Checklist

### Before Publishing

**Automated Checks**:
- [ ] Spell check passed (all languages)
- [ ] Grammar check passed
- [ ] Terminology consistency verified
- [ ] Placeholder integrity confirmed
- [ ] Number/date format correct
- [ ] No empty translations

**Human Review**:
- [ ] Native speaker approved
- [ ] Cultural appropriateness verified
- [ ] Brand voice consistent
- [ ] Links and CTAs work
- [ ] Images/media localized

### Post-Publishing

- [ ] Monitor bounce rates by language
- [ ] Track search console errors
- [ ] Review user feedback
- [ ] Check support tickets for language issues
- [ ] A/B test translations if possible

## Tools Summary

| Tool | Type | Languages | Best For |
|------|------|-----------|----------|
| LanguageTool | Grammar + Spell | 30+ | General validation |
| Speller100 | Spell | 100+ | Multi-language scale |
| WebSpellChecker | Spell | 168 | CMS integration |
| Hunspell | Spell | 100+ | Offline/embedded |
| Grammarly | Grammar + Style | English | Premium English |
| DeepL Write | Style | 6 | Style improvement |
| Phrase TMS | Full QA | All | Enterprise workflow |
| Memsource | Full QA | All | Translation management |

## References

- [LanguageTool Documentation](https://languagetool.org/dev)
- [Microsoft Research: Speller100](https://www.microsoft.com/en-us/research/blog/speller100-zero-shot-spelling-correction-at-scale-for-100-plus-languages/)
- [W3C: Internationalization Best Practices](https://www.w3.org/International/questions/qa-i18n)
- [Phrase: Translation Quality Assurance](https://phrase.com/blog/posts/translation-quality-assurance/)
