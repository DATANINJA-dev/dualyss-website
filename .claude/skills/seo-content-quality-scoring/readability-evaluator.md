# Readability Evaluator

Modular readability scoring helper for content quality validation. Implements Flesch-Kincaid Grade Level and Flesch Reading Ease algorithms with a weighted 20-point scoring system.

## Overview

This evaluator analyzes text content for readability metrics and returns scores with verbal labels and actionable recommendations for improvement.

## Scoring Breakdown (20 points total)

| Metric | Target Range | Penalty |
|--------|--------------|---------|
| FK Grade Level | 6-10 (general web) | -5 per range violation, -10 if >12 |
| Reading Ease | 60-80 | -3 to -5 for difficulty extremes |

## Text Preprocessing

Extract readable text from HTML content before analysis:

```
# Remove script and style tags
text = content
text = regex_replace(text, /<script[^>]*>.*?<\/script>/gis, "")
text = regex_replace(text, /<style[^>]*>.*?<\/style>/gis, "")

# Remove HTML tags
text = regex_replace(text, /<[^>]+>/g, " ")

# Decode HTML entities
text = decode_html_entities(text)

# Normalize whitespace
text = regex_replace(text, /\s+/g, " ").trim()
```

## Text Statistics

Count basic text statistics:

```
# Count sentences (split by sentence-ending punctuation)
sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
sentence_count = sentences.length

# Count words
words = text.split(/\s+/).filter(w => w.length > 0)
word_count = words.length

# Minimum content check
If word_count < 100:
  confidence = "low"
  confidence_warning = "Content < 100 words - scores may be unreliable"
Else:
  confidence = "high"
  confidence_warning = null
```

## Syllable Counting

Count syllables using vowel group method (~85% accurate):

```
# SAFE: Fixed pattern, no backtracking risk
syllable_count = 0

For each word in words:
  # Count vowel groups (a, e, i, o, u, y)
  vowel_groups = word.match(/[aeiouy]+/gi) || []
  # Every word has at least 1 syllable
  syllable_count += max(1, vowel_groups.length)

# Calculate averages
avg_sentence_length = word_count / sentence_count
avg_syllables_per_word = syllable_count / word_count
```

## Flesch-Kincaid Grade Level Calculation

```
# Formula: 0.39 × (words/sentences) + 11.8 × (syllables/words) - 15.59
If sentence_count == 0 OR word_count == 0:
  fk_grade = 0
Else:
  fk_grade = 0.39 * (word_count / sentence_count) +
             11.8 * (syllable_count / word_count) -
             15.59

# Round to 1 decimal place
fk_grade = round(fk_grade, 1)
```

## Flesch Reading Ease Calculation

```
# Formula: 206.835 - 1.015 × (words/sentences) - 84.6 × (syllables/words)
If sentence_count == 0 OR word_count == 0:
  reading_ease = 0
Else:
  reading_ease = 206.835 -
                 1.015 * (word_count / sentence_count) -
                 84.6 * (syllable_count / word_count)

# Clamp to 0-100 range
reading_ease = max(0, min(100, reading_ease))
reading_ease = round(reading_ease, 1)
```

## Verbal Labels

### Grade Level Labels

```
function getGradeLabel(fk_grade):
  If fk_grade <= 6:
    return "5th-6th grade - Simple, easy to read"
  Else if fk_grade <= 9:
    return "7th-9th grade - Good for web content"
  Else if fk_grade <= 12:
    return "10th-12th grade - High school level"
  Else if fk_grade <= 16:
    return "College level - Complex"
  Else:
    return "Graduate level - Very complex"
```

### Reading Ease Labels

```
function getReadingEaseLabel(reading_ease):
  If reading_ease >= 90:
    return "Very easy - 5th grade level"
  Else if reading_ease >= 80:
    return "Easy - 6th grade level"
  Else if reading_ease >= 70:
    return "Fairly easy - 7th grade level"
  Else if reading_ease >= 60:
    return "Standard - 8th-9th grade level"
  Else if reading_ease >= 50:
    return "Fairly difficult - 10th-12th grade"
  Else if reading_ease >= 30:
    return "Difficult - College level"
  Else:
    return "Very difficult - Graduate level"
```

## Score Aggregation

Calculate 20-point readability score:

```
readability_score = 20

# Grade level penalties (target: 6-10)
If fk_grade < 6:
  readability_score -= 5
  grade_issue = "too_simple"
Else if fk_grade > 12:
  readability_score -= 10  # Way too complex
  grade_issue = "very_complex"
Else if fk_grade > 10:
  readability_score -= 5
  grade_issue = "complex"
Else:
  grade_issue = null

# Reading ease penalties (target: 60-80)
If reading_ease < 30:
  readability_score -= 5   # Very difficult
  ease_issue = "very_difficult"
Else if reading_ease < 50:
  readability_score -= 3   # Difficult
  ease_issue = "difficult"
Else if reading_ease > 90:
  readability_score -= 2   # Too simple (credibility risk)
  ease_issue = "too_easy"
Else:
  ease_issue = null

# Ensure minimum score of 0
readability_score = max(0, readability_score)
```

## Recommendation Generator

Generate actionable recommendations based on detected issues:

```
recommendations = []

# Grade level recommendations
If grade_issue == "very_complex":
  recommendations.push({
    action: "Simplify content to grade 6-10 level (currently grade {fk_grade})",
    priority: "HIGH",
    points_potential: 10,
    fixes: [
      "Break long sentences into shorter ones",
      "Replace complex words with simpler alternatives",
      "Target 15-20 words per sentence"
    ]
  })
Else if grade_issue == "complex":
  recommendations.push({
    action: "Reduce reading complexity from grade {fk_grade} to grade 6-10",
    priority: "MEDIUM",
    points_potential: 5,
    fixes: [
      "Shorten sentences exceeding 25 words",
      "Replace multi-syllable words where possible"
    ]
  })
Else if grade_issue == "too_simple":
  recommendations.push({
    action: "Content may be too simple (grade {fk_grade}) - consider adding depth",
    priority: "LOW",
    points_potential: 5,
    fixes: [
      "Add more detailed explanations",
      "Include technical terms where appropriate"
    ]
  })

# Reading ease recommendations
If ease_issue == "very_difficult":
  recommendations.push({
    action: "Increase reading ease from {reading_ease} to 60-80 range",
    priority: "HIGH",
    points_potential: 5,
    fixes: [
      "Use active voice instead of passive",
      "Replace jargon with common words",
      "Break complex sentences into simpler ones"
    ]
  })
Else if ease_issue == "difficult":
  recommendations.push({
    action: "Improve reading ease from {reading_ease} to 60-80 range",
    priority: "MEDIUM",
    points_potential: 3,
    fixes: [
      "Reduce average sentence length",
      "Use shorter, common words"
    ]
  })
Else if ease_issue == "too_easy":
  recommendations.push({
    action: "Content may lack credibility (ease {reading_ease}) - add substance",
    priority: "LOW",
    points_potential: 2,
    fixes: [
      "Add specific details and examples",
      "Include supporting evidence"
    ]
  })

# Sentence length recommendations
If avg_sentence_length > 25:
  recommendations.push({
    action: "Break up long sentences (avg: {avg_sentence_length} words)",
    priority: "MEDIUM",
    points_potential: 2,
    fixes: [
      "Target 15-20 words per sentence",
      "Split sentences at conjunctions (and, but, or)"
    ]
  })

# Sort by priority then points
priority_order = { "HIGH": 0, "MEDIUM": 1, "LOW": 2 }
recommendations.sort((a, b) => {
  If priority_order[a.priority] != priority_order[b.priority]:
    return priority_order[a.priority] - priority_order[b.priority]
  return b.points_potential - a.points_potential
})

# Return top 3 recommendations
return recommendations.slice(0, 3)
```

## Word Replacement Suggestions

Common complex-to-simple word replacements:

```
word_replacements = {
  "utilize": "use",
  "implement": "do, start",
  "facilitate": "help",
  "demonstrate": "show",
  "accomplish": "do, finish",
  "approximately": "about",
  "subsequently": "then, later",
  "nevertheless": "but, however",
  "notwithstanding": "despite",
  "methodology": "method",
  "functionality": "feature",
  "optimization": "improvement",
  "infrastructure": "system",
  "comprehensive": "complete"
}

# Detect complex words in content
detected_complex = []
For word, replacement in word_replacements:
  pattern = new RegExp("\\b" + word + "\\b", "gi")
  matches = content.match(pattern)
  If matches:
    detected_complex.push({
      word: word,
      replacement: replacement,
      count: matches.length
    })
```

## Output Contract

The evaluator returns:

```javascript
{
  score: 0-20,                          // Weighted readability score
  max: 20,
  details: "Grade 8.2 (target: 6-10)",  // Summary string
  metrics: {
    flesch_kincaid_grade: 8.2,
    flesch_kincaid_label: "7th-9th grade - Good for web content",
    flesch_reading_ease: 65.4,
    flesch_reading_ease_label: "Standard - 8th-9th grade level",
    avg_sentence_length: 15.3,
    avg_syllables_per_word: 1.4,
    word_count: 850,
    sentence_count: 56,
    syllable_count: 1190
  },
  confidence: "high" | "low",
  confidence_warning: null | "Content < 100 words...",
  recommendations: [
    {
      action: "Break up long sentences (avg: 22 words)",
      priority: "MEDIUM",
      points_potential: 2,
      fixes: ["Target 15-20 words per sentence", ...]
    },
    ...
  ],
  complex_words: [
    { word: "utilize", replacement: "use", count: 2 },
    ...
  ]
}
```

## Verbose Output Format

When verbose mode is enabled, display detailed metrics:

```
### Readability Metrics
| Metric | Value | Interpretation | Target |
|--------|-------|----------------|--------|
| Flesch-Kincaid Grade | 8.2 | 8th grade level | 6-10 (web) |
| Flesch Reading Ease | 65.4 | Standard difficulty | 60-80 (web) |
| Avg Sentence Length | 15.3 words | Good | < 20 |
| Avg Syllables/Word | 1.4 | Appropriate | 1.3-1.6 |
| Word Count | 850 | Sufficient | 300+ |

### Readability Recommendations
| Priority | Action | Potential |
|----------|--------|-----------|
| MEDIUM | Break up 3 sentences exceeding 25 words | +2 |
| LOW | Replace 'utilize' (2x) with 'use' | +1 |
```

## Target Ranges by Content Type

| Content Type | Grade Level | Reading Ease | Use Case |
|--------------|-------------|--------------|----------|
| General web | 6-10 | 60-80 | Blogs, landing pages |
| Technical docs | 10-14 | 40-60 | API docs, tutorials |
| Academic | 14-18 | 20-40 | Research, papers |
| Children | 3-6 | 80-100 | Kids content |

## Integration with seo-validate-quality

This evaluator is called from Phase 2b of `/seo-validate-quality`:

```
# Load readability-evaluator patterns from skill
# Reference: .claude/skills/seo-content-quality-scoring/readability-evaluator.md

readability_result = apply readability-evaluator patterns to extracted text

readability_score = readability_result.score
readability_max = 20
readability_details = readability_result.details
readability_metrics = readability_result.metrics
readability_recommendations = readability_result.recommendations
```

## Reference

Based on readability research:
- Flesch, R. (1948). A new readability yardstick. Journal of Applied Psychology
- Kincaid, J.P. et al. (1975). Derivation of New Readability Formulas
- Nielsen Norman Group - How Users Read on the Web

## Limitations

- **English only**: Flesch-Kincaid formulas calibrated for English text
- **Syllable accuracy**: Vowel group method ~85% accurate (simplified algorithm)
- **Short content**: Content <100 words produces unreliable scores
- **Context-blind**: Cannot assess if complexity is appropriate for topic
- **No jargon awareness**: Technical terms may be appropriate for technical audiences
