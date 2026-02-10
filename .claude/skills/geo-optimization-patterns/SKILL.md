---
name: geo-optimization-patterns
description: |
  Provides Generative Engine Optimization (GEO) patterns for AI search platforms.
  Auto-activates when tasks involve AI search optimization, ChatGPT visibility,
  Perplexity citations, AI crawler configuration, or content optimization for
  generative engines like Claude and Gemini.
---

# GEO Optimization Patterns Skill

This skill provides comprehensive patterns for optimizing content visibility in AI-powered search engines and answer platforms. As traditional search volume shifts to generative engines (Gartner predicts 25% drop by 2026), GEO becomes essential for digital visibility.

## When This Skill Activates

- Tasks mentioning GEO, generative engine optimization
- AI search optimization for ChatGPT, Perplexity, Claude, Gemini
- AI crawler configuration (GPTBot, PerplexityBot, ClaudeBot)
- robots.txt rules for AI crawlers
- Content citation optimization for LLMs
- Answer engine optimization (AEO)
- AI-generated answer visibility

### Activation Keywords

| Keyword Pattern | Confidence |
|-----------------|------------|
| GEO, generative engine optimization | High |
| ChatGPT, Perplexity, Gemini (search context) | High |
| AI crawler, GPTBot, ClaudeBot, PerplexityBot | High |
| AI search, AI answer, AI citation | High |
| llm.txt, robots.txt ai | Medium |
| cited by AI, appear in ChatGPT | Medium |

## Core Principles

### The 4-Layer Framework

GEO operates within a layered search optimization model:

1. **SXO (Search Experience Optimization)**: Traditional search UX
2. **AIO (Answer Engine Optimization)**: Featured snippets, knowledge panels
3. **GEO (Generative Engine Optimization)**: AI-generated answer visibility
4. **AEO (AI Experience Optimization)**: Full AI journey optimization

See `four-layer-framework.md` for detailed layer definitions.

### Key GEO Success Factors

| Factor | Impact | Implementation |
|--------|--------|----------------|
| Content Structure | High | Answer-first formatting, clear H2/H3s |
| Original Data | High | Statistics, research, expert quotes |
| E-E-A-T Signals | High | Author bios, citations, trust markers |
| Technical Access | Critical | robots.txt allows AI crawlers |
| Freshness | Medium | Regular updates, timestamps |

### The Citation Paradigm Shift

> "In the old world, we optimized for clicks; in the new world, we optimize for citations."

Traditional SEO success (Google Page 1) doesn't guarantee AI visibility - only 12% of ChatGPT citations match Google's first page results.

## Supporting Files

| File | Purpose |
|------|---------|
| `four-layer-framework.md` | SXO → AIO → GEO → AEO layer definitions and interactions |
| `ai-crawler-config.md` | User agents, robots.txt templates, verification methods |
| `platform-strategies.md` | Platform-specific tactics for ChatGPT, Perplexity, Claude, Gemini |
| `citation-optimization.md` | How to increase citation probability in AI answers |
| `perplexity-detection.md` | Hybrid API + scraping citation detection for Perplexity (TASK-139) |

## Usage

This skill is automatically activated when GEO-related tasks are detected. Reference the supporting files for:

- **Planning**: Use four-layer-framework.md to identify which layers apply
- **Technical Setup**: Use ai-crawler-config.md for crawler access configuration
- **Content Strategy**: Use citation-optimization.md for content structure patterns
- **Platform Targeting**: Use platform-strategies.md for platform-specific tactics
- **Perplexity Detection**: Use perplexity-detection.md for hybrid API + scraping citation detection

## Constraints

- GEO is a rapidly evolving field; patterns documented as of January 2026
- AI platform policies change frequently; verify current crawler behavior
- GEO complements (doesn't replace) traditional SEO
- Focus on content quality over manipulation tactics
- Some platforms (AI browsers) cannot be controlled via robots.txt

## Quick Reference

### Minimum Viable GEO Checklist

- [ ] robots.txt allows GPTBot, PerplexityBot, ClaudeBot
- [ ] Content uses answer-first formatting (key info in first 120-160 words)
- [ ] Clear question-based H2/H3 headers
- [ ] Schema.org Article markup implemented
- [ ] Author bios and E-E-A-T signals present
- [ ] Original data/statistics included where relevant
- [ ] Content updated with visible timestamps

### robots.txt Quick Config

```
# Allow AI crawlers (recommended for visibility)
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /
```

## Research Sources

- [Search Engine Journal - AI Crawler User Agents List (Dec 2025)](https://www.searchenginejournal.com/ai-crawler-user-agents-list/558130/)
- [SEMrush - How to Optimize Content for AI Search Engines (2026)](https://www.semrush.com/blog/how-to-optimize-content-for-ai-search-engines/)
- [Cloudflare - From Googlebot to GPTBot (2025)](https://blog.cloudflare.com/from-googlebot-to-gptbot-whos-crawling-your-site-in-2025/)
- [SEO.com - Rising GEO Trends for 2026](https://www.seo.com/blog/geo-trends/)
