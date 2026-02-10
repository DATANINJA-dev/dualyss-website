# Security Testing Guide

Guidance for integrating security testing into development workflows. Covers SAST, DAST, SCA, and secret scanning.

---

## Testing Types Overview

| Type | When | What | Speed |
|------|------|------|-------|
| SAST | Build time | Source code analysis | Fast |
| DAST | Runtime | Running application | Slow |
| SCA | Build time | Dependencies | Fast |
| Secret Scanning | Commit time | Credentials in code | Fast |

---

## SAST (Static Application Security Testing)

Analyzes source code for security vulnerabilities without executing the application.

### Popular Tools

| Tool | Languages | Integration |
|------|-----------|-------------|
| Semgrep | Multi-language | CI/CD, IDE |
| SonarQube | Multi-language | CI/CD |
| CodeQL | Multi-language | GitHub native |
| Bandit | Python | CI/CD, CLI |
| ESLint Security | JavaScript | IDE, CI/CD |
| Brakeman | Ruby/Rails | CI/CD |

### Configuration Best Practices

- [ ] Run on every PR
- [ ] Block merge on critical findings
- [ ] Use baseline to track new issues only
- [ ] Configure rules for your tech stack
- [ ] Integrate with IDE for early feedback

---

## DAST (Dynamic Application Security Testing)

Tests running applications for vulnerabilities by simulating attacks.

### Popular Tools

| Tool | Type | Best For |
|------|------|----------|
| OWASP ZAP | Open source | General web apps |
| Burp Suite | Commercial | Professional pentesting |
| Nuclei | Open source | Template-based scanning |
| Nikto | Open source | Web server scanning |

### Testing Checklist

- [ ] Authentication bypass attempts
- [ ] Session management testing
- [ ] Input validation fuzzing
- [ ] Error handling analysis
- [ ] SSL/TLS configuration
- [ ] Header security validation

---

## SCA (Software Composition Analysis)

Identifies vulnerabilities in third-party dependencies and open source components.

### Popular Tools

| Tool | Ecosystem | Integration |
|------|-----------|-------------|
| Snyk | Multi-language | CI/CD, IDE, GitHub |
| Dependabot | Multi-language | GitHub native |
| npm audit | Node.js | CLI, CI/CD |
| pip-audit | Python | CLI, CI/CD |
| OWASP Dependency-Check | Java, .NET | CI/CD |
| Trivy | Containers | CI/CD |

### Key Metrics

| Metric | Description |
|--------|-------------|
| CVE count | Known vulnerabilities |
| CVSS score | Severity rating (0-10) |
| Fix availability | Patch or upgrade available |
| Exploitability | Active exploitation in wild |

### Configuration Best Practices

- [ ] Scan on every build
- [ ] Block on high/critical CVEs
- [ ] Auto-create PRs for updates
- [ ] Monitor for new CVEs in production deps
- [ ] Maintain dependency lock files

---

## Supply Chain Security Testing

Comprehensive testing of the software supply chain, including dependencies, build processes, and artifact integrity.

> **New for OWASP 2025 A03**: Supply chain attacks are a critical threat vector requiring dedicated testing.

### Dependency Vulnerability Scanning

| Tool | Language | Command | CI Integration |
|------|----------|---------|----------------|
| npm audit | JavaScript | `npm audit --json` | Native |
| pip-audit | Python | `pip-audit -r requirements.txt` | GitHub Action |
| cargo audit | Rust | `cargo audit` | GitHub Action |
| bundler-audit | Ruby | `bundle-audit check` | CI/CD |
| Trivy | Multi | `trivy fs .` | CI/CD, GitHub Action |
| Snyk | Multi | `snyk test` | CI/CD, IDE |
| OWASP Dependency-Check | Java/.NET | `dependency-check --project test` | CI/CD |

### SBOM Generation

Generate Software Bill of Materials for every release:

| Format | Tool | Command | Output |
|--------|------|---------|--------|
| CycloneDX | cdxgen | `cdxgen -o bom.json` | JSON |
| CycloneDX | cyclonedx-npm | `npx @cyclonedx/cyclonedx-npm --output-file bom.json` | JSON |
| SPDX | syft | `syft . -o spdx-json > sbom.spdx.json` | JSON |
| SPDX | spdx-sbom-generator | `spdx-sbom-generator -p .` | Tag-value |

### SBOM Validation

```bash
# Validate CycloneDX SBOM
npx @cyclonedx/cyclonedx-cli validate --input-file bom.json

# Scan SBOM for vulnerabilities
trivy sbom bom.json
grype sbom:./bom.json
```

### Build Integrity Verification

| Check | Tool | Purpose |
|-------|------|---------|
| Lockfile integrity | npm ci, pip --require-hashes | Verify dependency checksums |
| Reproducible builds | repro-build | Same source → same artifact |
| Artifact signing | Sigstore/cosign | Cryptographic attestation |
| Provenance | SLSA framework | Build process documentation |

### Sigstore/Cosign Verification

```bash
# Sign container image
cosign sign --key cosign.key myregistry/myimage:v1.0.0

# Verify signature
cosign verify --key cosign.pub myregistry/myimage:v1.0.0

# Keyless signing (recommended)
cosign sign myregistry/myimage:v1.0.0  # Uses OIDC
cosign verify --certificate-identity user@example.com \
  --certificate-oidc-issuer https://accounts.google.com \
  myregistry/myimage:v1.0.0
```

### CI/CD Integration Example

```yaml
# GitHub Actions supply chain security
name: Supply Chain Security
on: [push, pull_request]

jobs:
  supply-chain:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install dependencies with integrity check
        run: npm ci  # Uses package-lock.json checksums

      - name: Dependency vulnerability scan
        run: npm audit --audit-level=high

      - name: Generate SBOM
        run: npx @cyclonedx/cyclonedx-npm --output-file bom.json

      - name: Scan SBOM for vulnerabilities
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'sbom'
          scan-ref: 'bom.json'
          severity: 'CRITICAL,HIGH'
          exit-code: '1'

      - name: Upload SBOM artifact
        uses: actions/upload-artifact@v4
        with:
          name: sbom
          path: bom.json
```

### Supply Chain Testing Checklist

- [ ] Dependency vulnerability scanning in CI
- [ ] Lock files committed and enforced (`npm ci` not `npm install`)
- [ ] SBOM generated for each release
- [ ] SBOM stored with release artifacts
- [ ] Build artifacts signed (Sigstore, GPG)
- [ ] Private registry properly configured (avoid dependency confusion)
- [ ] New dependencies require review before merging
- [ ] Transitive dependencies visible and scanned

---

## Secret Scanning

Detects credentials, API keys, and secrets accidentally committed to repositories.

### Popular Tools

| Tool | Integration | Features |
|------|-------------|----------|
| GitHub Secret Scanning | GitHub native | Push protection |
| GitLeaks | CI/CD, pre-commit | Regex patterns |
| TruffleHog | CI/CD, CLI | Entropy analysis |
| detect-secrets | Pre-commit | Baseline tracking |

### Common Secrets to Detect

| Category | Examples |
|----------|----------|
| Cloud credentials | AWS keys, GCP service accounts, Azure tokens |
| API keys | Stripe, Twilio, SendGrid |
| Database | Connection strings with passwords |
| Auth tokens | JWT secrets, OAuth secrets |
| SSH keys | Private key files |

### Pre-commit Hook Setup

Use git hooks to prevent secrets from being committed.

### Configuration Best Practices

- [ ] Enable pre-commit hooks
- [ ] Scan full git history periodically
- [ ] Rotate any detected secrets immediately
- [ ] Use environment variables for secrets
- [ ] Configure allowlist for false positives

---

## CI/CD Pipeline Integration

### Recommended Pipeline Order

1. **Pre-commit**: Secret scanning, linting
2. **Build**: SAST, SCA
3. **Test**: Unit tests, integration tests
4. **Deploy to staging**: DAST
5. **Production gate**: All checks green

### Severity Thresholds

| Stage | Block On |
|-------|----------|
| PR | Critical, High |
| Main branch | Critical |
| Production | Critical (with override) |

### Alert Routing

| Severity | Response Time | Notification |
|----------|---------------|--------------|
| Critical | Immediate | Page on-call |
| High | 24 hours | Slack channel |
| Medium | 1 week | Weekly report |
| Low | Backlog | Monthly review |

---

## Testing Frequency

| Test Type | Frequency | Trigger |
|-----------|-----------|---------|
| SAST | Every commit | Push, PR |
| SCA | Every build | Push, scheduled daily |
| Secret Scan | Every commit | Pre-commit, push |
| DAST | Weekly + releases | Scheduled, deploy |
| Pentest | Quarterly | Scheduled |

---

## References

- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [OWASP Top 10 2025](https://owasp.org/Top10/) - A03 Supply Chain
- [SLSA Framework](https://slsa.dev/) - Supply chain security levels
- [CycloneDX SBOM](https://cyclonedx.org/) - Bill of materials standard
- [Sigstore](https://www.sigstore.dev/) - Artifact signing and verification
- [NIST SP 800-53 Security Controls](https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final)
- [CIS Controls](https://www.cisecurity.org/controls)
