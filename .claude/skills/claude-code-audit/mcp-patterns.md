# MCP Patterns

Reference patterns for MCP (Model Context Protocol) server integration recommendations based on project stack and use cases.

## Stack-Based Recommendations

### Universal MCPs (Any Project)

| MCP | Purpose | Priority |
|-----|---------|----------|
| **Serena** | Semantic code understanding, symbolic editing | High |
| **Memory** | Persistent context across sessions | Medium |
| **Filesystem** | File operations with access control | Low (built-in usually sufficient) |

### Web Development

| Stack | Recommended MCPs | Rationale |
|-------|-----------------|-----------|
| React/Next.js | Playwright, Puppeteer | Component testing, screenshots, E2E |
| Vue/Nuxt | Playwright | E2E testing, visual validation |
| Angular | Playwright | E2E automation |
| Static sites | Puppeteer | Screenshot validation |

### API Development

| Stack | Recommended MCPs | Rationale |
|-------|-----------------|-----------|
| REST APIs | Apidog | API spec to code generation |
| GraphQL | Apidog | Schema-first development |
| gRPC | Custom | Protobuf handling |
| OpenAPI | Apidog | Auto-documentation, client generation |

### Infrastructure

| Platform | Recommended MCPs | Rationale |
|----------|-----------------|-----------|
| AWS | AWS MCP (CDK, CloudFormation) | Infrastructure as code |
| GCP | GCP MCP | Cloud resource management |
| Azure | Azure MCP | Azure DevOps integration |
| Kubernetes | K8s MCP | Cluster management |

### Version Control & CI/CD

| Need | Recommended MCPs | Rationale |
|------|-----------------|-----------|
| GitHub projects | GitHub MCP | PRs, issues, actions, releases |
| GitLab projects | GitLab MCP | CI/CD pipelines, merge requests |
| Bitbucket | Bitbucket MCP | PR management |

### Research & Documentation

| Need | Recommended MCPs | Rationale |
|------|-----------------|-----------|
| Web research | Brave Search | Real-time search results |
| Documentation | Firecrawl | Web scraping, doc fetching |
| Knowledge base | Memory MCP | Persistent learnings |

---

## Detection Patterns

### Project Stack Detection

```yaml
# What to check for stack detection
package.json:
  - react, next, vue, angular → Web frontend
  - express, fastify, nest → Node.js backend
  - jest, vitest, cypress → Testing framework

requirements.txt / pyproject.toml:
  - django, flask, fastapi → Python web
  - pytest → Python testing
  - boto3 → AWS

Dockerfile / docker-compose.yml:
  - Containerized deployment

.github/workflows/:
  - GitHub Actions CI/CD

terraform/, pulumi/:
  - Infrastructure as code

openapi.yaml / swagger.json:
  - API documentation
```

### MCP Config Analysis

```yaml
# .mcp.json structure
{
  "mcpServers": {
    "[name]": {
      "type": "stdio" | "sse",
      "command": "[executable]",
      "args": [...],
      "env": {
        "[KEY]": "[value or env reference]"
      }
    }
  }
}
```

---

## Security Patterns

### Good Practices

```yaml
# Environment variable references (secure)
"env": {
  "SERENA_API_KEY": "${SERENA_API_KEY}",
  "GITHUB_TOKEN": "${GITHUB_TOKEN}"
}
```

### Anti-Patterns

```yaml
# Hardcoded secrets (insecure)
"env": {
  "SERENA_API_KEY": "sk-live-xxxxx",  # CRITICAL: Hardcoded secret
  "GITHUB_TOKEN": "ghp_xxxxxxx"        # CRITICAL: Hardcoded token
}
```

### Security Checklist

| Check | Expected | Severity |
|-------|----------|----------|
| No hardcoded API keys | `${VAR}` syntax | Critical |
| No hardcoded tokens | `${VAR}` syntax | Critical |
| No exposed passwords | Environment only | Critical |
| Minimal file access | Scoped paths | High |
| Documented permissions | Comments explain | Medium |

---

## Optimization Patterns

### MCP Selection by Effort

| MCP | Integration Effort | Impact | Priority |
|-----|-------------------|--------|----------|
| Serena | Low (single command) | High | P0 |
| Playwright | Low (npm install) | High | P0 |
| GitHub | Medium (token setup) | High | P1 |
| Memory | Low | Medium | P1 |
| Brave Search | Low (API key) | Medium | P2 |
| AWS MCP | High (IAM setup) | High | P2 |

### Redundancy Detection

| Scenario | Issue | Fix |
|----------|-------|-----|
| Playwright + Puppeteer | Overlapping functionality | Keep one |
| Multiple search MCPs | Unnecessary duplication | Choose primary |
| Serena + basic file tools | Serena supersedes | Remove basic |

---

## MCP Compatibility Matrix

### Tool Availability by MCP

| MCP | Read | Write | Search | Execute | Web |
|-----|------|-------|--------|---------|-----|
| Serena | Symbolic | Symbolic | Pattern | - | - |
| Playwright | Screenshot | Form fill | - | JS | Navigate |
| GitHub | API | API | Issues/PRs | Actions | - |
| Memory | Recall | Store | Query | - | - |
| Brave | - | - | Web | - | Fetch |

---

## Implementation Sketches

### Adding Playwright MCP

```json
// .mcp.json addition
{
  "mcpServers": {
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["@anthropic/mcp-playwright"],
      "env": {}
    }
  }
}
```

**Setup steps:**
1. `npm install @anthropic/mcp-playwright`
2. Add to `.mcp.json`
3. Restart Claude Code

### Adding GitHub MCP

```json
// .mcp.json addition
{
  "mcpServers": {
    "github": {
      "type": "stdio",
      "command": "npx",
      "args": ["@anthropic/mcp-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

**Setup steps:**
1. Create GitHub personal access token
2. Export `GITHUB_TOKEN` in shell
3. Add to `.mcp.json`
4. Restart Claude Code

---

## Gap Detection Algorithm

```
FOR each detected_stack IN project_stacks:
    recommended = LOOKUP(stack_recommendations[detected_stack])
    FOR each mcp IN recommended:
        IF mcp NOT IN current_mcps:
            ADD to gaps with:
                - MCP name
                - Why recommended (rationale)
                - Integration effort
                - Expected impact
```

---

## Sources

- [10 Must-Have MCP Servers](https://roobia.medium.com/the-10-must-have-mcp-servers-for-claude-code-2025-developer-edition-43dc3c15c887)
- [Anthropic Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [MCP Specification](https://github.com/anthropics/mcp)
