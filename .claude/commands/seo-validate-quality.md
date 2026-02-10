---
description: Score content quality for SEO (E-E-A-T, readability, structure, keywords)
allowed-tools: Glob, Read, WebFetch
argument-hint: "[path|URL] [--threshold N] [--keyword WORD] [--json] [--verbose]"
---

# seo-validate-quality

Score content quality across E-E-A-T signals, readability (Flesch-Kincaid), structure, keywords, and completeness. Provides 100-point composite score with configurable threshold for deployment gates.

## When to Use

- Before publishing content to validate quality meets standards
- In CI/CD pipelines with `--json` for automated quality gates
- To audit existing content for SEO quality improvements
- During content development to track quality improvements

## Parameters

$ARGUMENTS = File path, glob pattern, or URL to validate

**Flags**:
- `--threshold N`: Minimum score for pass (default: 70)
- `--keyword WORD`: Primary keyword for density/placement checks
- `--json`: Output results as JSON for CI/CD integration
- `--verbose`: Show per-section breakdown with details

## Instructions

### Phase 0: Input Validation

1. **Parse arguments**:
   - Extract path/URL from `$ARGUMENTS`
   - Check for `--threshold N` flag (default: 70)
   - Check for `--keyword` flag with word
   - Check for `--json` flag
   - Check for `--verbose` flag

2. **Validate threshold** (if provided):
   ```
   If threshold < 0 OR threshold > 100:
     [ERROR] E420: Invalid threshold value: [N]

     Threshold must be between 0 and 100.
     Exit 1
   ```

3. **Store flags for later phases**:
   ```
   threshold = value of --threshold or 70
   primary_keyword = value of --keyword or null
   json_output = "--json" in arguments
   verbose_mode = "--verbose" in arguments
   target = extracted path/URL or error
   ```

4. **Validate target provided**:
   ```
   If target is empty:
     [ERROR] E005: Missing required argument

     Usage: /seo-validate-quality [path|URL] [flags]
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
   content = WebFetch(url: target, prompt: "Extract the full HTML content of the page")

   If fetch failed:
     [ERROR] E422: Content not accessible

     URL: [target]
     Check URL is valid and accessible
     Exit 2

   files = [{ path: target, content: content, source: "url" }]
   ```

   **For glob pattern**:
   ```
   matched_files = Glob(pattern: target)

   If matched_files.length == 0:
     [ERROR] E422: Content not accessible

     No files found matching: [target]
     Exit 2

   For each file in matched_files:
     content = Read(file_path: file)
     files.push({ path: file, content: content, source: "file" })
   ```

   **For single file**:
   ```
   content = Read(file_path: target)

   If read failed:
     [ERROR] E422: Content not accessible

     File not found: [target]
     Exit 2

   files = [{ path: target, content: content, source: "file" }]
   ```

7. **Validate content** (non-empty check):
   ```
   For each file in files:
     If file.content.trim().length < 50:
       [WARNING] Content too short for reliable scoring: [file.path]
       file.skip_scoring = true
   ```

### Phase 2: Content Analysis (5 Dimensions)

For each file in files (that is not skipped):

#### Phase 2a: E-E-A-T Signal Detection (30 points)

Uses the `eeat-evaluator` helper from `seo-content-quality-scoring` skill for weighted 30-point scoring.

8. **Apply E-E-A-T evaluator patterns**:
   ```
   # Load eeat-evaluator patterns from skill
   # Reference: .claude/skills/seo-content-quality-scoring/eeat-evaluator.md

   # Experience detection (0-7 points)
   experience_score = 0

   # First-person experience language (+2 points max)
   experience_first_person = [
     /\b(I've|I have|my experience|in my|years of experience)\b/i,
     /\b(I tested|I used|I tried|I found|personally)\b/i
   ]
   For each pattern in experience_first_person:
     If pattern matches content:
       experience_score += 2
       experience_signals.push("first-person language")
       Break

   # Case studies / examples (+2 points max)
   experience_case_study = [
     /\b(case study|real example|hands-on|first-hand)\b/i,
     /\b(we implemented|we built|we tested|in practice)\b/i
   ]
   For each pattern in experience_case_study:
     If pattern matches content:
       experience_score += 2
       experience_signals.push("case study")
       Break

   # Personal examples with specifics (+2 points max)
   experience_specifics = [
     /\b(for example|specifically|in this case)\b/i,
     /\b(when I|after I|before I)\b/i
   ]
   For each pattern in experience_specifics:
     If pattern matches content:
       experience_score += 2
       experience_signals.push("specific examples")
       Break

   # Visual evidence (+1 point)
   If content matches /<img[^>]*alt="[^"]*(screenshot|photo|example|demo)/i:
     experience_score += 1
     experience_signals.push("visual evidence")

   experience_score = min(experience_score, 7)
   ```

9. **Detect Expertise signals** (0-8 points):
   ```
   expertise_score = 0

   # Author credentials (+2 points)
   credential_pattern = /\b(MD|PhD|CPA|JD|MBA|RN|PE|CFA|PMP|CISSP|certified|licensed)\b/i
   If credential_pattern matches content:
     expertise_score += 2
     expertise_signals.push("credentials found")

   # Author bio present (+2 points)
   If content matches /<(div|section|span|p)[^>]*class="[^"]*author[^"]*"/i:
     expertise_score += 2
     expertise_signals.push("author bio")
   Else if content matches /<(div|section)[^>]*id="[^"]*author[^"]*"/i:
     expertise_score += 2
     expertise_signals.push("author bio")

   # Technical depth (+2 points)
   technical_patterns = [
     /<(pre|code)|```/i,
     /\b(algorithm|implementation|architecture)\b/i,
     /<table[^>]*>.*?(data|results|comparison)/is
   ]
   For each pattern in technical_patterns:
     If pattern matches content:
       expertise_score += 2
       expertise_signals.push("technical depth")
       Break

   # Industry terminology (+2 points)
   tech_terms = content.match(/\b(API|SDK|framework|methodology|protocol|infrastructure)\b/gi) || []
   If tech_terms.length > 5:
     expertise_score += 2
     expertise_signals.push("industry terminology")

   expertise_score = min(expertise_score, 8)
   ```

10. **Detect Authority signals** (0-8 points):
    ```
    authority_score = 0

    # External citations (+3 points for 3+, +1 for 1-2)
    external_link_pattern = /<a[^>]*href="https?:\/\/[^"]*"/gi
    external_links = content.match(external_link_pattern) || []
    external_link_count = external_links.length

    If external_link_count >= 3:
      authority_score += 3
      authority_signals.push("3+ external citations")
    Else if external_link_count >= 1:
      authority_score += 1
      authority_signals.push(external_link_count + " external link(s)")

    # Authoritative domain links (+2 points)
    authoritative_domains = /\.(gov|edu|org|ac\.uk|ieee|acm|nature|science)\b/i
    For each link in external_links:
      If link matches authoritative_domains:
        authority_score += 2
        authority_signals.push("authoritative source")
        Break

    # Citation markers (+2 points)
    citation_patterns = [
      /\[\d+\]/,
      /\(\d{4}\)/,
      /\bet al\.\b/i,
      /according to/i
    ]
    For each pattern in citation_patterns:
      If pattern matches content:
        authority_score += 2
        authority_signals.push("citation markers")
        Break

    # Schema.org author markup (+1 point)
    If content matches /itemtype="[^"]*Person"|"@type":\s*"Person"/i:
      authority_score += 1
      authority_signals.push("schema.org markup")

    authority_score = min(authority_score, 8)
    ```

11. **Detect Trust signals** (0-7 points):
    ```
    trust_score = 0

    # HTTPS (+1 point) - assumed for file analysis
    trust_score += 1
    trust_signals.push("HTTPS")

    # Privacy policy links (+1 point)
    If content matches /href="[^"]*\/(privacy|policy|terms)/i:
      trust_score += 1
      trust_signals.push("privacy policy")

    # Contact page links (+1 point)
    If content matches /href="[^"]*\/(contact|about|team)/i:
      trust_score += 1
      trust_signals.push("contact info")

    # About section with details (+2 points)
    about_signals = [
      /\b(about us|our team|our company|our story)\b/i,
      /\b(founded|established|since \d{4})\b/i
    ]
    For each pattern in about_signals:
      If pattern matches content:
        trust_score += 2
        trust_signals.push("company details")
        Break

    # No misleading claims (+2 points)
    misleading_patterns = [
      /\b(guaranteed|100%|miracle|secret)\b/i,
      /\b(act now|limited time|don't miss)\b/i,
      /\b(get rich|make money fast|no risk)\b/i
    ]
    has_misleading = false
    For each pattern in misleading_patterns:
      If pattern matches content:
        has_misleading = true
        trust_signals.push("misleading claims detected")
        Break

    If NOT has_misleading:
      trust_score += 2

    trust_score = min(trust_score, 7)
    ```

12. **Calculate E-E-A-T dimension score**:
    ```
    # Sum weighted scores (total max: 30)
    eeat_score = experience_score + expertise_score + authority_score + trust_score
    eeat_max = 30

    # Build details string
    all_signals = experience_signals + expertise_signals + authority_signals + trust_signals
    eeat_details = all_signals.slice(0, 3).join(", ") or "No E-E-A-T signals"

    # Store breakdown for verbose output
    eeat_breakdown = {
      experience: { score: experience_score, max: 7, signals: experience_signals },
      expertise: { score: expertise_score, max: 8, signals: expertise_signals },
      authority: { score: authority_score, max: 8, signals: authority_signals },
      trust: { score: trust_score, max: 7, signals: trust_signals }
    }

    # Generate E-E-A-T recommendations (see eeat-evaluator.md)
    eeat_recommendations = []

    If experience_score < 5:
      eeat_recommendations.push({
        dimension: "experience",
        action: "Add first-person language or case studies",
        points: 7 - experience_score
      })

    If expertise_score < 6:
      eeat_recommendations.push({
        dimension: "expertise",
        action: "Add author credentials or bio section",
        points: 8 - expertise_score
      })

    If authority_score < 6:
      eeat_recommendations.push({
        dimension: "authority",
        action: "Add external citations from authoritative sources",
        points: 8 - authority_score
      })

    If trust_score < 5:
      eeat_recommendations.push({
        dimension: "trust",
        action: "Add contact/privacy links and company details",
        points: 7 - trust_score
      })
    ```

#### Phase 2b: Readability Calculation (20 points)

Uses the `readability-evaluator` helper from `seo-content-quality-scoring` skill for weighted 20-point scoring with Flesch-Kincaid Grade Level and Reading Ease metrics.

13. **Apply readability evaluator patterns**:
    ```
    # Load readability-evaluator patterns from skill
    # Reference: .claude/skills/seo-content-quality-scoring/readability-evaluator.md

    readability_result = apply readability-evaluator patterns to content

    readability_score = readability_result.score
    readability_max = 20
    readability_details = readability_result.details
    readability_metrics = readability_result.metrics
    readability_recommendations = readability_result.recommendations
    readability_complex_words = readability_result.complex_words

    # Extract commonly used values for later phases
    word_count = readability_metrics.word_count
    fk_grade = readability_metrics.flesch_kincaid_grade
    reading_ease = readability_metrics.flesch_reading_ease
    confidence = readability_result.confidence
    ```

#### Phase 2c: Structure Analysis (20 points)

14. **Check heading structure** (10 points):
    ```
    structure_score = 0

    # H1 present and singular
    h1_count = count of /<h1[^>]*>/gi in content
    If h1_count == 1:
      structure_score += 5
    Else if h1_count > 1:
      structure_issues.push("Multiple H1 tags ({h1_count})")

    # Heading hierarchy (no skips)
    heading_levels = extract all <h[1-6]> levels in order
    has_skip = false
    For i = 1 to heading_levels.length - 1:
      If heading_levels[i] > heading_levels[i-1] + 1:
        has_skip = true
        structure_issues.push("H{prev} -> H{current} skip")

    If NOT has_skip AND heading_levels.length > 1:
      structure_score += 5
    ```

15. **Check content structure** (10 points):
    ```
    # Paragraph length (5 points)
    paragraphs = content.match(/<p[^>]*>.*?<\/p>/gis) || []
    If paragraphs.length > 0:
      avg_para_words = average word count per paragraph
      If avg_para_words <= 150:
        structure_score += 5
      Else:
        structure_issues.push("Avg paragraph: {avg_para_words} words (target: <150)")

    # Lists present for longer content (5 points)
    has_lists = content.match(/<(ul|ol)[^>]*>/i)
    If word_count >= 500 AND has_lists:
      structure_score += 5
    Else if word_count >= 500:
      structure_issues.push("No lists in 500+ word content")
    Else if word_count < 500:
      structure_score += 5  # Lists not required for short content

    structure_max = 20
    structure_details = build from structure_issues or "Well structured"
    ```

#### Phase 2d: Keyword Analysis (15 points)

**LSI Term Database** (static, pre-lowercased for O(1) lookup):
```
LSI_TERMS = {
  "seo": ["search engine optimization", "ranking", "keywords", "backlinks", "serp", "organic traffic", "crawling", "indexing"],
  "content marketing": ["blog", "audience", "engagement", "strategy", "conversion", "editorial calendar", "storytelling", "distribution"],
  "web development": ["html", "css", "javascript", "framework", "responsive", "api", "browser", "frontend", "backend"],
  "machine learning": ["algorithm", "neural network", "training", "model", "dataset", "prediction", "classification", "deep learning"],
  "e-commerce": ["shopping cart", "checkout", "product catalog", "inventory", "payment", "conversion rate", "customer", "order"],
  "digital marketing": ["advertising", "social media", "analytics", "campaign", "roi", "targeting", "conversion", "funnel"],
  "user experience": ["usability", "interface", "interaction", "accessibility", "design", "navigation", "prototype", "wireframe"],
  "cybersecurity": ["encryption", "firewall", "vulnerability", "authentication", "malware", "threat", "security", "penetration"],
  "cloud computing": ["aws", "azure", "serverless", "container", "kubernetes", "deployment", "scalability", "microservices"],
  "data science": ["analytics", "visualization", "statistics", "python", "pandas", "regression", "clustering", "insights"]
}
```

16. **Check keyword presence** (if keyword provided):
    ```
    If primary_keyword is null:
      # Try to extract from title
      title_match = content.match(/<title[^>]*>([^<]+)<\/title>/i)
      If title_match:
        # Use first significant word from title (>3 chars, not common)
        title_words = title_match[1].split(/\s+/)
        common_words = ["the", "and", "for", "with", "how", "what", "your", "this", "that"]
        For word in title_words:
          If word.length > 3 AND word.toLowerCase() not in common_words:
            primary_keyword = word
            auto_extracted = true
            Break

    If primary_keyword:
      keyword_issues = []
      keyword_lower = primary_keyword.toLowerCase()

      # Initialize scoring components
      density_score = 0
      placement_score = 0
      lsi_score = 0

      # Initialize placement tracking
      placement = {
        title: false,
        h1: false,
        first_paragraph: false,
        meta_description: false
      }

      # ========================================
      # Step 2: Keyword Density (5 points)
      # ========================================
      # Use split() for counting - ReDoS safe (no regex on user input)
      text_lower = text.toLowerCase()
      keyword_count = text_lower.split(keyword_lower).length - 1

      # Calculate density percentage
      density = (keyword_count / word_count) * 100
      density_status = "missing"

      If density >= 1 AND density <= 3:
        density_score = 5
        density_status = "optimal"
      Else if density > 0.5 AND density < 1:
        density_score = 3
        density_status = "low"
        keyword_issues.push("Density slightly low: {density:.1f}% (target: 1-3%)")
      Else if density > 3 AND density <= 4:
        density_score = 2
        density_status = "high"
        keyword_issues.push("Density slightly high: {density:.1f}% (target: 1-3%)")
      Else if density > 4:
        density_score = 0
        density_status = "over-optimized"
        keyword_issues.push("⚠ Over-optimized: {density:.1f}% exceeds 3% threshold (risk of penalty)")
      Else if density > 0 AND density <= 0.5:
        density_score = 1
        density_status = "under-optimized"
        keyword_issues.push("Density too low: {density:.1f}% (target: 1-3%)")
      Else:
        density_score = 0
        density_status = "missing"
        keyword_issues.push("Keyword not found in content")

      # ========================================
      # Step 3: Keyword Placement (6 points)
      # ========================================

      # Title check (2 points)
      title_match = content.match(/<title[^>]*>([^<]+)<\/title>/i)
      If title_match AND title_match[1].toLowerCase().includes(keyword_lower):
        placement.title = true
        placement_score += 2
      Else:
        keyword_issues.push("Add keyword to title tag for +2 points")

      # H1 check (2 points)
      h1_match = content.match(/<h1[^>]*>([^<]*)<\/h1>/i)
      If h1_match AND h1_match[1].toLowerCase().includes(keyword_lower):
        placement.h1 = true
        placement_score += 2
      Else:
        keyword_issues.push("Add keyword to H1 for +2 points")

      # First paragraph check (1 point)
      first_100_lower = words.slice(0, 100).join(" ").toLowerCase()
      If first_100_lower.includes(keyword_lower):
        placement.first_paragraph = true
        placement_score += 1

      # Meta description check (1 point)
      meta_desc = content.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/i)
      If meta_desc AND meta_desc[1].toLowerCase().includes(keyword_lower):
        placement.meta_description = true
        placement_score += 1
      Else:
        keyword_issues.push("Add keyword to meta description for +1 point")

      # ========================================
      # Step 4: LSI Term Detection (4 points)
      # ========================================
      lsi_coverage = { found: [], missing: [], coverage: 0 }

      # Normalize keyword for LSI lookup
      keyword_normalized = keyword_lower.trim()

      # Get LSI terms for this keyword (or empty if not in database)
      related_terms = LSI_TERMS[keyword_normalized] || []

      If related_terms.length > 0:
        # Check for multi-word phrases using includes on full text
        For each term in related_terms:
          If text_lower.includes(term):
            lsi_coverage.found.push(term)
          Else:
            lsi_coverage.missing.push(term)

        # Calculate coverage ratio
        lsi_coverage.coverage = lsi_coverage.found.length / related_terms.length

        # Score based on coverage (4 points total)
        If lsi_coverage.coverage >= 0.6:
          lsi_score = 4
        Else if lsi_coverage.coverage >= 0.3:
          lsi_score = 2
        Else:
          lsi_score = 0
          keyword_issues.push("LSI coverage low: {lsi_coverage.coverage * 100:.0f}%")
      Else:
        # No LSI database for this keyword - give neutral score
        lsi_score = 2  # Benefit of doubt
        lsi_coverage.coverage = null
        keyword_issues.push("No LSI terms defined for '{primary_keyword}'")

      # ========================================
      # Step 5: Aggregate Score & Recommendations
      # ========================================
      keyword_score = density_score + placement_score + lsi_score
      keyword_max = 15

      # Generate recommendations for missing LSI terms
      If lsi_coverage.missing.length > 0 AND lsi_coverage.missing.length <= 5:
        top_missing = lsi_coverage.missing.slice(0, 3)
        keyword_issues.push("Consider adding LSI terms: " + top_missing.join(", "))

      # Build keyword details string
      keyword_details = "Density: {density:.1f}% ({density_status})"
      If auto_extracted:
        keyword_details += " [auto: '{primary_keyword}']"

      # Store expanded output structure for JSON
      keyword_output = {
        score: keyword_score,
        max: keyword_max,
        primary_keyword: primary_keyword,
        auto_extracted: auto_extracted,
        density: {
          value: density,
          target: "1-3%",
          status: density_status,
          score: density_score
        },
        placement: placement,
        placement_score: placement_score,
        lsi_coverage: lsi_coverage,
        lsi_score: lsi_score,
        recommendations: keyword_issues
      }

    Else:
      # No keyword - skip dimension, note in output
      keyword_score = 0
      keyword_max = 0  # Don't count against total
      keyword_details = "No keyword specified"
      keyword_output = null
    ```

#### Phase 2e: Completeness Checks (15 points)

17. **Check content completeness**:
    ```
    completeness_score = 0
    completeness_issues = []

    # Meta description (3 points)
    meta_desc = content.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/i)
    If meta_desc:
      desc_length = meta_desc[1].length
      If desc_length >= 150 AND desc_length <= 160:
        completeness_score += 3
      Else if desc_length > 0:
        completeness_score += 2
        completeness_issues.push("Meta description: {desc_length} chars")
    Else:
      completeness_issues.push("Missing meta description")

    # Images with alt text (3 points)
    images = content.match(/<img[^>]*>/gi) || []
    images_with_alt = images.filter(img => /alt="[^"]+"/i.test(img))
    If images.length == 0:
      completeness_score += 3  # No images, no penalty
    Else if images_with_alt.length == images.length:
      completeness_score += 3
    Else:
      completeness_score += 1
      completeness_issues.push("{images.length - images_with_alt.length} images missing alt")

    # Internal links (3 points)
    internal_links = content.match(/<a[^>]*href="(?!https?:\/\/)[^"]*"/gi) || []
    If internal_links.length >= 2:
      completeness_score += 3
    Else if internal_links.length >= 1:
      completeness_score += 2
      completeness_issues.push("Only {internal_links.length} internal link(s)")
    Else:
      completeness_issues.push("No internal links")

    # External sources (3 points)
    external_links = content.match(/<a[^>]*href="https?:\/\/[^"]*"/gi) || []
    If external_links.length >= 1:
      completeness_score += 3
    Else:
      completeness_issues.push("No external citations")

    # Word count minimum (3 points)
    If word_count >= 300:
      completeness_score += 3
    Else if word_count >= 150:
      completeness_score += 1
      completeness_issues.push("Only {word_count} words (min: 300)")
    Else:
      completeness_issues.push("Content too short: {word_count} words")

    completeness_max = 15
    completeness_details = completeness_issues.length ? completeness_issues[0] : "Complete"
    ```

### Phase 3: Score Calculation

18. **Calculate composite score**:
    ```
    # Adjust max for keyword dimension
    total_max = 100
    If keyword_max == 0:
      total_max = 85  # Keyword dimension excluded

    raw_score = eeat_score + readability_score + structure_score + keyword_score + completeness_score

    # Normalize to 100 if keyword excluded
    If total_max == 85:
      normalized_score = (raw_score / 85) * 100
    Else:
      normalized_score = raw_score

    final_score = round(normalized_score)
    ```

19. **Determine status**:
    ```
    If final_score >= threshold:
      status = "pass"
    Else:
      status = "fail"
    ```

20. **Generate recommendations**:
    ```
    recommendations = []

    # Priority order: biggest point gains first
    If eeat_score < 20:
      recommendations.push("Add author bio with credentials to improve E-E-A-T")

    If readability_score < 15:
      recommendations.push("Simplify language to reach grade 7-9 reading level")

    If structure_score < 15:
      recommendations.push("Fix heading hierarchy and add paragraph breaks")

    If keyword_score < 10 AND keyword_output:
      # Use the first specific recommendation from keyword analysis
      If keyword_output.recommendations.length > 0:
        recommendations.push(keyword_output.recommendations[0])
      Else:
        recommendations.push("Improve keyword density and placement")

    If completeness_score < 10:
      recommendations.push("Add meta description, alt text, and internal links")

    # Limit to top 3
    recommendations = recommendations.slice(0, 3)
    ```

### Phase 4: Report Generation

21. **If --json flag, output JSON**:
    ```json
    {
      "validator": "quality",
      "url": "[target]",
      "status": "[pass|fail]",
      "score": [final_score],
      "threshold": [threshold],
      "word_count": [word_count],
      "dimensions": {
        "eeat": {
          "score": [eeat_score],
          "max": 30,
          "details": "[eeat_details]",
          "breakdown": {
            "experience": {
              "score": [experience_score],
              "max": 7,
              "signals": [experience_signals]
            },
            "expertise": {
              "score": [expertise_score],
              "max": 8,
              "signals": [expertise_signals]
            },
            "authority": {
              "score": [authority_score],
              "max": 8,
              "signals": [authority_signals]
            },
            "trust": {
              "score": [trust_score],
              "max": 7,
              "signals": [trust_signals]
            }
          },
          "recommendations": [eeat_recommendations]
        },
        "readability": {
          "score": [readability_score],
          "max": 20,
          "details": "[readability_details]",
          "metrics": {
            "flesch_kincaid_grade": [fk_grade],
            "flesch_kincaid_label": "[readability_metrics.flesch_kincaid_label]",
            "flesch_reading_ease": [reading_ease],
            "flesch_reading_ease_label": "[readability_metrics.flesch_reading_ease_label]",
            "avg_sentence_length": [readability_metrics.avg_sentence_length],
            "avg_syllables_per_word": [readability_metrics.avg_syllables_per_word],
            "word_count": [word_count],
            "sentence_count": [readability_metrics.sentence_count],
            "syllable_count": [readability_metrics.syllable_count]
          },
          "confidence": "[confidence]",
          "recommendations": [readability_recommendations],
          "complex_words": [readability_complex_words]
        },
        "structure": {
          "score": [structure_score],
          "max": 20,
          "details": "[structure_details]"
        },
        "keywords": keyword_output ? {
          "score": keyword_output.score,
          "max": keyword_output.max,
          "details": keyword_details,
          "primary_keyword": keyword_output.primary_keyword,
          "auto_extracted": keyword_output.auto_extracted,
          "density": keyword_output.density,
          "placement": keyword_output.placement,
          "placement_score": keyword_output.placement_score,
          "lsi_coverage": keyword_output.lsi_coverage,
          "lsi_score": keyword_output.lsi_score,
          "recommendations": keyword_output.recommendations
        } : {
          "score": 0,
          "max": 0,
          "details": "No keyword specified"
        },
        "completeness": {
          "score": [completeness_score],
          "max": 15,
          "details": "[completeness_details]"
        }
      },
      "recommendations": [recommendations],
      "execution_time_ms": [execution_time]
    }
    ```

22. **Otherwise, output markdown report**:

    **For single file**:
    ```
    ## Content Quality Analysis: [target]

    | Dimension | Score | Max | Details |
    |-----------|-------|-----|---------|
    | E-E-A-T | [eeat_score]/30 | 30 | [eeat_details] |
    | Readability | [readability_score]/20 | 20 | [readability_details] |
    | Structure | [structure_score]/20 | 20 | [structure_details] |
    | Keywords | [keyword_score]/[keyword_max] | [keyword_max] | [keyword_details] |
    | Completeness | [completeness_score]/15 | 15 | [completeness_details] |

    **Total Score**: [final_score]/100
    **Threshold**: [threshold]
    **Status**: [PASS|FAIL]
    **Words**: [word_count]

    ### Recommendations
    1. [recommendation 1]
    2. [recommendation 2]
    3. [recommendation 3]
    ```

    **For multiple files** (glob pattern):
    ```
    ## Content Quality Analysis

    | File | Score | Status | Top Issue |
    |------|-------|--------|-----------|
    | [file1] | [score]/100 | [PASS/FAIL] | [top recommendation or "None"] |
    | [file2] | [score]/100 | [PASS/FAIL] | [top recommendation] |

    **Summary**: [passed] passed, [failed] failed (threshold: [threshold])

    [If --verbose, show detailed breakdown for each file]
    ```

23. **If --verbose, add per-dimension details**:
    ```
    ### E-E-A-T Breakdown
    | Dimension | Score | Max | Evidence |
    |-----------|-------|-----|----------|
    | Experience | [experience_score]/7 | 7 | [experience_signals.join(", ") or "Not found"] |
    | Expertise | [expertise_score]/8 | 8 | [expertise_signals.join(", ") or "Not found"] |
    | Authority | [authority_score]/8 | 8 | [authority_signals.join(", ") or "Not found"] |
    | Trust | [trust_score]/7 | 7 | [trust_signals.join(", ") or "Not found"] |

    ### E-E-A-T Recommendations
    If eeat_recommendations.length > 0:
      | Priority | Dimension | Action | Potential |
      |----------|-----------|--------|-----------|
      For each rec in eeat_recommendations (sorted by points desc):
        | [HIGH if points > 4 else MEDIUM if points > 2 else LOW] | [rec.dimension] | [rec.action] | +[rec.points] |

    ### Readability Metrics
    | Metric | Value | Interpretation | Target |
    |--------|-------|----------------|--------|
    | Flesch-Kincaid Grade | [fk_grade] | [readability_metrics.flesch_kincaid_label] | 6-10 (web) |
    | Flesch Reading Ease | [reading_ease] | [readability_metrics.flesch_reading_ease_label] | 60-80 (web) |
    | Avg Sentence Length | [readability_metrics.avg_sentence_length] words | [Good if <20, else Long] | < 20 |
    | Avg Syllables/Word | [readability_metrics.avg_syllables_per_word] | [Appropriate if 1.3-1.6] | 1.3-1.6 |
    | Word Count | [word_count] | [Sufficient if >= 300] | 300+ |

    If confidence == "low":
      ⚠️ [readability_result.confidence_warning]

    ### Readability Recommendations
    If readability_recommendations.length > 0:
      | Priority | Action | Potential |
      |----------|--------|-----------|
      For each rec in readability_recommendations:
        | [rec.priority] | [rec.action] | +[rec.points_potential] |

    If readability_complex_words.length > 0:
      ### Complex Word Suggestions
      | Word | Replacement | Count |
      |------|-------------|-------|
      For each entry in readability_complex_words:
        | [entry.word] | [entry.replacement] | [entry.count] |

    ### Keyword Analysis
    If keyword_output:
      **Primary Keyword**: "{keyword_output.primary_keyword}" [auto_extracted ? "(auto-detected)" : ""]

      | Component | Score | Max | Details |
      |-----------|-------|-----|---------|
      | Density | {keyword_output.density.score}/5 | 5 | {keyword_output.density.value:.1f}% ({keyword_output.density.status}) |
      | Placement | {keyword_output.placement_score}/6 | 6 | See breakdown below |
      | LSI Coverage | {keyword_output.lsi_score}/4 | 4 | {keyword_output.lsi_coverage.coverage ? (keyword_output.lsi_coverage.coverage * 100):.0f + "%" : "N/A"} |

      **Placement Details**:
      | Location | Found | Points |
      |----------|-------|--------|
      | Title | {keyword_output.placement.title ? "✓" : "✗"} | {keyword_output.placement.title ? "2" : "0"}/2 |
      | H1 | {keyword_output.placement.h1 ? "✓" : "✗"} | {keyword_output.placement.h1 ? "2" : "0"}/2 |
      | First 100 Words | {keyword_output.placement.first_paragraph ? "✓" : "✗"} | {keyword_output.placement.first_paragraph ? "1" : "0"}/1 |
      | Meta Description | {keyword_output.placement.meta_description ? "✓" : "✗"} | {keyword_output.placement.meta_description ? "1" : "0"}/1 |

      If keyword_output.lsi_coverage.found.length > 0:
        **LSI Terms Found**: {keyword_output.lsi_coverage.found.join(", ")}

      If keyword_output.lsi_coverage.missing.length > 0:
        **LSI Terms Missing**: {keyword_output.lsi_coverage.missing.slice(0, 5).join(", ")}

      If keyword_output.recommendations.length > 0:
        **Keyword Recommendations**:
        For each rec in keyword_output.recommendations:
          - [rec]
    Else:
      **Keywords**: No primary keyword provided or detected
    ```

### Phase 5: Exit Code Determination

24. **Determine exit code**:
    ```
    If any fatal errors (E4XX where XX < 20):
      Exit 2

    # For glob patterns, check if any file failed
    failed_count = files.filter(f => f.status == "fail").length

    If failed_count > 0:
      Exit 1
    Else:
      Exit 0
    ```

## Error Codes

| Code | Description | Exit |
|------|-------------|------|
| E420 | Invalid threshold or parameter value | 1 |
| E421 | Score below threshold | 1 |
| E422 | Content not accessible (file/URL not found) | 2 |
| E423 | Unable to parse content structure | 2 |

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All content passed quality threshold |
| 1 | One or more files below quality threshold |
| 2 | System error (content not accessible, parse failure) |

## Scoring Weights

| Dimension | Weight | What It Measures |
|-----------|--------|------------------|
| E-E-A-T | 30 | Experience, Expertise, Authority, Trust signals |
| Readability | 20 | Flesch-Kincaid Grade Level (target: 7-9) |
| Structure | 20 | Heading hierarchy, paragraph length, lists |
| Keywords | 15 | Placement, density (1-2% optimal) |
| Completeness | 15 | Meta tags, alt text, links, word count |

**Note**: If `--keyword` not provided, keyword dimension is excluded and score normalized to 100.

## Thresholds

| Score | Status | Interpretation |
|-------|--------|----------------|
| >= 70 | PASS | Content meets quality standards |
| 50-69 | FAIL | Significant improvements needed |
| < 50 | FAIL | Major quality issues, not recommended |

## Examples

### Validate a single file
```
/seo-validate-quality content/blog-post.html
```

### Validate with keyword analysis
```
/seo-validate-quality content/seo-guide.html --keyword "SEO"
```

### Validate with custom threshold
```
/seo-validate-quality content/*.html --threshold 80
```

### Validate URL
```
/seo-validate-quality https://example.com/about
```

### JSON output for CI/CD
```
/seo-validate-quality content/**/*.html --json --threshold 70
```

### Verbose output with full breakdown
```
/seo-validate-quality content/article.html --verbose
```

## Reference Skills

- `seo-content-quality-scoring`: E-E-A-T framework, readability algorithms
- `seo-validation`: Error codes and validation patterns
- `error-handling`: Standardized error format

## Limitations

- **Readability**: Flesch-Kincaid calibrated for English only
- **E-E-A-T**: Heuristic detection, not Google's actual algorithm
- **Keywords**: Requires `--keyword` flag or auto-extracts from title
- **Short content**: Content <100 words may produce unreliable scores
