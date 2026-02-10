# ai-crawlers

## Status

🚧 **Deferred** - Implementation planned for EPIC-014

## Description

Validate AI search crawler configuration and optimization. Will cover robots.txt directives, crawler-specific meta tags, and content accessibility for AI indexing.

## Planned Features

- AI crawler user-agent detection (GPTBot, ClaudeBot, PerplexityBot, etc.)
- robots.txt AI-specific rules validation
- AI-friendly content structure analysis
- Crawl budget optimization for AI crawlers
- AI-specific sitemap generation
- Content freshness signals for AI indexing

## Target Epic

**EPIC-014**: GEO Optimization Patterns

## Error Codes (Reserved)

| Code | Message |
|------|---------|
| E540 | AI crawler blocked in robots.txt |
| E541 | Missing AI-specific meta tags |
| E542 | Content structure not AI-optimized |

## Known AI Crawlers

| Crawler | Company | User-Agent |
|---------|---------|------------|
| GPTBot | OpenAI | GPTBot |
| ChatGPT-User | OpenAI | ChatGPT-User |
| ClaudeBot | Anthropic | ClaudeBot |
| PerplexityBot | Perplexity | PerplexityBot |
| Google-Extended | Google | Google-Extended |
| Applebot-Extended | Apple | Applebot-Extended |

## Notes

This stub establishes the file structure for future implementation. The `geo-optimization-patterns` skill provides foundational patterns that this validator will consume.

## See Also

- `.claude/skills/geo-optimization-patterns/` - GEO patterns skill (exists)
- EPIC-014 - GEO Optimization Patterns epic
