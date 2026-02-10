# AI Crawler Configuration

Technical guide for configuring web server access for AI crawlers. Proper configuration is prerequisite for GEO visibility.

## Known AI Crawler User Agents

### OpenAI Crawlers

| Crawler | User Agent String | Purpose | Controllable |
|---------|-------------------|---------|--------------|
| GPTBot | `Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.3; +https://openai.com/gptbot)` | AI training data collection for GPT models | Yes (robots.txt) |
| ChatGPT-User | `Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ChatGPT-User/1.0; +https://openai.com/bot)` | Real-time web browsing for ChatGPT users | Yes (robots.txt) |
| OAI-SearchBot | `Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)` | ChatGPT search features | Yes (robots.txt) |

**Verification**: OpenAI publishes IP ranges at:
- `openai.com/gptbot.json`
- `openai.com/searchbot.json`
- `openai.com/chatgpt-user.json`

### Anthropic Crawlers

| Crawler | User Agent String | Purpose | Controllable |
|---------|-------------------|---------|--------------|
| ClaudeBot | `Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)` | AI training data for Claude models | Yes (robots.txt) |
| Claude-User | `Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-User/1.0)` | Real-time web access for Claude users | Yes (robots.txt) |

### Google AI Crawlers

| Crawler | User Agent String | Purpose | Controllable |
|---------|-------------------|---------|--------------|
| Google-Extended | `Mozilla/5.0 (compatible; Google-Extended)` | Controls Gemini and Vertex AI training | Yes (robots.txt) |
| Gemini-Deep-Research | Varies | Gemini's Deep Research feature | Partially |
| Google-CloudVertexBot | `Mozilla/5.0 (compatible; Google-CloudVertexBot)` | Vertex AI Agent Builder | Yes (robots.txt) |

### Other Major Crawlers

| Crawler | Organization | User Agent | Purpose |
|---------|--------------|------------|---------|
| PerplexityBot | Perplexity | `Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/bot)` | AI search indexing |
| Meta-ExternalAgent | Meta | `Mozilla/5.0 (compatible; Meta-ExternalAgent/1.0)` | Meta AI training |
| Amazonbot | Amazon | `Mozilla/5.0 (compatible; Amazonbot/0.1)` | Alexa/Amazon AI services |
| CCBot | Common Crawl | `CCBot/2.0` | Open dataset for AI training |
| Bytespider | ByteDance | `Bytespider` | TikTok/ByteDance AI |
| AppleBot-Extended | Apple | `Applebot-Extended` | Apple Intelligence training |

## robots.txt Templates

### Template 1: Allow All AI Crawlers (Recommended for Visibility)

```
# Allow all AI crawlers for maximum GEO visibility
# Use this for content you want cited in AI answers

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Gemini-Deep-Research
Allow: /

User-agent: Meta-ExternalAgent
Allow: /

User-agent: Amazonbot
Allow: /
```

### Template 2: Allow Search, Block Training

```
# Allow real-time AI search, block model training
# Use when you want AI visibility but not training data extraction

# OpenAI - Block training, allow search
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

# Anthropic - Block training, allow search
User-agent: ClaudeBot
Disallow: /

User-agent: Claude-User
Allow: /

# Google - Block training
User-agent: Google-Extended
Disallow: /

# Perplexity - Allow search
User-agent: PerplexityBot
Allow: /

# Block all training-focused crawlers
User-agent: CCBot
Disallow: /

User-agent: Meta-ExternalAgent
Disallow: /
```

### Template 3: Block All AI Crawlers (Not Recommended)

```
# Block all AI crawlers
# WARNING: This results in zero AI visibility
# Only use for genuinely private content

User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: OAI-SearchBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: Claude-User
Disallow: /

User-agent: PerplexityBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: Meta-ExternalAgent
Disallow: /
```

### Template 4: Selective Path Control

```
# Fine-grained control by path
# Allow public content, block private/sensitive areas

# OpenAI
User-agent: GPTBot
Allow: /blog/
Allow: /docs/
Allow: /products/
Disallow: /admin/
Disallow: /user-data/
Disallow: /private/

User-agent: ChatGPT-User
Allow: /

# Similar pattern for other crawlers...
```

## Verification Methods

### How to Verify AI Crawler Access

1. **Check robots.txt is accessible**:
   ```bash
   curl -I https://yoursite.com/robots.txt
   # Should return 200 OK
   ```

2. **Verify crawler IP addresses** (for security):
   ```bash
   # OpenAI IPs
   curl https://openai.com/gptbot.json

   # Check if incoming IP matches
   host [incoming-ip]
   ```

3. **Server log analysis**:
   ```bash
   # Find GPTBot requests
   grep "GPTBot" /var/log/nginx/access.log

   # Count AI crawler hits
   grep -E "(GPTBot|ClaudeBot|PerplexityBot)" access.log | wc -l
   ```

4. **Google Search Console**:
   - Check "Crawl Stats" for AI bot activity
   - Review robots.txt tester

### Traffic Patterns to Expect

| Crawler | Typical Pattern | Volume |
|---------|-----------------|--------|
| GPTBot | Systematic, regular | High (training) |
| ChatGPT-User | Bursty, unpredictable | Variable (user requests) |
| PerplexityBot | Continuous indexing | Medium |
| ClaudeBot | Periodic crawls | Medium |

## Uncontrollable AI Access

### AI Browsers (Cannot Block)

Some AI systems use browser-based access that bypasses robots.txt:

| System | Issue | Mitigation |
|--------|-------|------------|
| ChatGPT Atlas | Uses Chrome user agent | Cannot distinguish from users |
| AI-powered browsers | Standard browser fingerprint | Rate limiting only |
| Operator agents | Automated browser sessions | CAPTCHA, bot detection |

**Key Insight**: As of 2025, AI agent traffic grew 6,900% YoY. Much of this is indistinguishable from normal user traffic.

### Recommendations for Uncontrollable Access

1. **Rate limiting**: Apply to all traffic, not just identified bots
2. **Bot detection services**: Use behavioral analysis (HUMAN, Cloudflare Bot Management)
3. **Accept visibility tradeoff**: If you want AI citations, content must be accessible

## llm.txt (Emerging Standard)

> **Status**: Proposed but not widely adopted as of January 2026

Some sites are experimenting with `llm.txt` as a companion to robots.txt specifically for LLM guidance:

```
# /llm.txt - Experimental
# Guidance for LLM content extraction

# Site description for LLM context
description: Technical documentation for the Acme API platform

# Preferred citation format
cite-as: "Acme API Documentation (https://docs.acme.com)"

# Content licensing for AI training
training: allowed
commercial-training: disallowed

# Important pages to prioritize
important:
  - /docs/getting-started
  - /docs/api-reference
  - /blog/best-practices
```

**Recommendation**: Monitor llm.txt development but don't rely on it yet. Focus on robots.txt which is universally respected.

## Troubleshooting

### Common Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| AI not citing content | robots.txt blocks crawlers | Allow AI crawlers |
| Wrong content cited | AI cached old version | Add timestamps, request recrawl |
| Sensitive data exposed | Over-permissive robots.txt | Use path-based restrictions |
| Fake AI crawler traffic | Spoofed user agents | Verify IPs against official lists |
| High server load | Aggressive crawling | Crawl-delay directive |

### robots.txt Debugging

```
# Check current robots.txt
curl https://yoursite.com/robots.txt

# Test specific crawler access
# Google: Use Search Console robots.txt tester
# Manual: Check rules match intended paths

# Validate syntax
# Use online robots.txt validators
```

## References

- [OpenAI - GPTBot Documentation](https://platform.openai.com/docs/bots)
- [Search Engine Journal - AI Crawler User Agents List](https://www.searchenginejournal.com/ai-crawler-user-agents-list/558130/)
- [Cloudflare - From Googlebot to GPTBot](https://blog.cloudflare.com/from-googlebot-to-gptbot-whos-crawling-your-site-in-2025/)
- [Paul Calvano - AI Bots and Robots.txt](https://paulcalvano.com/2025-08-21-ai-bots-and-robots-txt/)
