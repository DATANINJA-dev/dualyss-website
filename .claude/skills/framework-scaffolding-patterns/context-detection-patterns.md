# Context Detection Patterns

Deep reference for detecting project context, stack, and configuration state.

---

## File-Based Detection Strategies

### Marker File Pattern

**Concept**: Search for standardized marker files that indicate project type and state.

**Examples**:
- `.yo-rc.json` - Yeoman project marker (Yeoman)
- `.copier-answers.yml` - Copier project with answers (Copier)
- `.cruft.json` - Template-managed project (Cruft)
- `CLAUDE.md` - Claude Code project marker (Claude Code)
- `.claude-answers.json` - Claude Code framework answers

**Search Strategy**:
1. Start in current directory
2. Walk up directory tree
3. Stop at first marker file found
4. Use marker location as project root

**Benefits**:
- Non-invasive (just file presence)
- Standard across tool ecosystem
- Supports nested projects
- Enables project-root detection

### Configuration File Analysis

**Multi-Stack Detection**:

```python
def detect_configuration_files():
    """Detect which configuration files exist"""
    
    files = {
        'javascript': [
            'package.json',
            'package-lock.json',
            'yarn.lock',
            'pnpm-lock.yaml'
        ],
        'python': [
            'pyproject.toml',
            'setup.py',
            'setup.cfg',
            'requirements.txt',
            'Pipfile'
        ],
        'go': [
            'go.mod',
            'go.sum'
        ],
        'rust': [
            'Cargo.toml',
            'Cargo.lock'
        ]
    }
    
    detected = {}
    for lang, config_files in files.items():
        for config in config_files:
            if os.path.exists(config):
                detected[lang] = config
                break
    
    return detected
```

**Result Interpretation**:
- Single detection = clear language choice
- Multiple detections = monorepo or mixed-stack project
- No detection = need user input or heuristic-based guessing

---

## Signal-Based Detection (Multi-Signal Fusion)

### Detection Signals for Audience/Scale

**Signal Categories**:

1. **Collaboration Signals**
   - Git history: Single commit author? Multi-author?
   - Contributors file presence
   - CONTRIBUTING.md existence
   - GitHub workflows (.github/)

2. **Community Signals**
   - README badges (coverage, build status, version)
   - LICENSE file (absent = personal, MIT/Apache = public)
   - CHANGELOG.md (maintained = public project)
   - Contributing guidelines

3. **Build/DevOps Signals**
   - CI/CD pipelines (.github/workflows, .gitlab-ci.yml, .circleci/)
   - Docker files (Dockerfile, docker-compose.yml)
   - Package publishing config (npm, PyPI)
   - Pre-commit hooks

4. **Code Quality Signals**
   - Linter config (.eslintrc, pyproject.toml [tool.black])
   - Type checking (tsconfig.json, mypy config)
   - Test coverage config (.coveragerc)

5. **Documentation Signals**
   - docs/ directory
   - mkdocs.yml, sphinx config
   - README language (personal vs. community-focused)

### Signal Weighting Algorithm

```python
def calculate_audience_confidence(signals):
    """
    Calculate audience confidence from signals.
    Returns: (audience, confidence_score)
    """
    
    weights = {
        'multi_author': 30,           # High weight
        'ci_pipelines': 25,
        'public_license': 20,
        'contributing_guide': 15,
        'docs_directory': 10,
        'single_author': -10,         # Negative weight (personal signal)
        'no_license': -10,
        'no_readme_badges': -5
    }
    
    signal_scores = {
        'personal': 0,
        'team': 0,
        'public': 0
    }
    
    # Multi-author → team/public
    if count_git_authors() > 1:
        signal_scores['team'] += weights['multi_author']
        signal_scores['public'] += weights['multi_author'] * 0.8
    else:
        signal_scores['personal'] += weights['single_author']
    
    # CI/CD → team/public
    if has_github_workflows() or has_ci_config():
        signal_scores['team'] += weights['ci_pipelines']
        signal_scores['public'] += weights['ci_pipelines']
    
    # Public license → public
    if has_public_license():
        signal_scores['public'] += weights['public_license']
    elif not has_license():
        signal_scores['personal'] += weights['no_license']
    
    # Contributing guide → public
    if has_contributing_guide():
        signal_scores['public'] += weights['contributing_guide']
    
    # Docs → team/public
    if has_docs_directory():
        signal_scores['team'] += weights['docs_directory'] * 0.5
        signal_scores['public'] += weights['docs_directory']
    
    # Determine winner
    max_audience = max(signal_scores, key=signal_scores.get)
    max_score = signal_scores[max_audience]
    total_weight = sum(weights.values())
    confidence = max_score / total_weight if total_weight > 0 else 0
    
    # Conservative: if confidence < 60%, default to personal
    if confidence < 0.6:
        return 'personal', confidence
    
    return max_audience, confidence
```

**Confidence Thresholds**:
- High (≥80%): 4+ aligned signals
- Medium (60-79%): 2-3 aligned signals  
- Low (<60%): Contradictory or insufficient signals
- Default: Personal (conservative when uncertain)

### Example: Audience Detection for simon_tools

**Signals Present**:
1. Multi-author git history (Team/Public)
2. GitHub workflows (CI/CD) (Team/Public)
3. MIT License (Public)
4. docs/ directory (Team/Public)
5. Contribution standards (Public)
6. No CONTRIBUTING.md (slightly personal)

**Calculation**:
```
personal: -10 = -10
team: 30 + 25 + 10 = 65
public: 24 + 25 + 20 + 15 + 10 = 94

Winner: public
Confidence: 94/145 = 64.8% (Medium)

Result: public audience (team/public process recommended)
```

---

## Dynamic Context Variables

### Runtime Context Collection

**Variables Extracted During Detection**:

```json
{
  "project_root": "/path/to/project",
  "current_dir": "/path/to/project/subdir",
  "detected_language": "python",
  "detected_framework": "django",
  "detected_audience": "team",
  "audience_confidence": 0.78,
  "has_vcs": true,
  "vcs_type": "git",
  "author_count": 5,
  "has_ci": true,
  "ci_type": "github_actions",
  "has_tests": true,
  "test_framework": "pytest",
  "has_docs": true,
  "docs_type": "sphinx",
  "type_checking": "mypy",
  "code_quality": ["black", "pylint"],
  "git_commits": 245,
  "git_branches": 8,
  "file_count": 1847,
  "largest_file": "CLAUDE.md"
}
```

### Previous State Recovery

**Answers File Content**:
```json
{
  "_copier_conf": {
    "src_path": "https://github.com/user/template.git",
    "dst_path": ".",
    "version": "0.31.0"
  },
  "framework_version": "0.31.0",
  "enabled_features": ["mcp", "audit", "sync"],
  "mcp_servers": ["github", "serena"],
  "created_at": "2026-01-04T00:00:00Z",
  "updated_at": "2026-01-10T12:00:00Z"
}
```

**Recovery Logic**:
- If answers file exists → project was previously scaffolded
- Load answers as defaults for next scaffolding
- Show "Use previous settings? (Y/n)" prompt
- Track update history in answers file

---

## Project State Snapshots

### State Files for Tracking

**Minimal State** (needed for updates):
```json
{
  "version": "0.31.0",
  "template_url": "https://github.com/DATANINJA-dev/simon_tools.git",
  "answers": {
    // User responses from scaffolding
  }
}
```

**Full State** (for detailed sync tracking):
```json
{
  "version": "0.31.0",
  "template_url": "https://github.com/DATANINJA-dev/simon_tools.git",
  "created_at": "2026-01-04T00:00:00Z",
  "updated_at": "2026-01-10T12:00:00Z",
  "sync_watermark": {
    "hub_commit": "abc123def456",
    "local_commit": "def456ghi789",
    "last_sync": "2026-01-10T12:00:00Z"
  },
  "version_constraints": {
    "python": ">=3.9",
    "node": ">=16.0.0"
  },
  "conflicts": [],
  "answers": {
    // User responses
  }
}
```

---

## Implementation Example: Claude Code Detection

```python
import json
import os
import re
from pathlib import Path
from datetime import datetime

class ClaudeCodeDetector:
    """Detect Claude Code framework installation and state"""
    
    def __init__(self, search_path=None):
        self.search_path = search_path or Path.cwd()
        self.project_root = None
        self.state = {}
    
    def find_project_root(self):
        """Find Claude Code project root by searching for markers"""
        
        current = Path(self.search_path).resolve()
        
        while current != current.parent:
            # Check for marker files
            if (current / 'CLAUDE.md').exists():
                self.project_root = current
                return current
            
            if (current / '.claude' / 'plugin.json').exists():
                self.project_root = current
                return current
            
            if (current / '.claude-answers.json').exists():
                self.project_root = current
                return current
            
            current = current.parent
        
        return None
    
    def detect_framework_version(self):
        """Extract framework version from CLAUDE.md meta"""
        
        claude_md = self.project_root / 'CLAUDE.md'
        
        with open(claude_md) as f:
            for line in f:
                if 'version:' in line:
                    # Parse: version: 0.31.0
                    match = re.search(r'version:\s*([\d.]+)', line)
                    if match:
                        return match.group(1)
        
        return None
    
    def detect_git_state(self):
        """Detect git configuration and history"""
        
        git_dir = self.project_root / '.git'
        
        if not git_dir.exists():
            return {'has_git': False}
        
        state = {'has_git': True}
        
        # Get author count
        try:
            result = subprocess.run(
                ['git', 'shortlog', '-sn', '--all'],
                capture_output=True,
                text=True,
                cwd=self.project_root
            )
            state['author_count'] = len(result.stdout.strip().split('\n'))
        except:
            state['author_count'] = 0
        
        return state
    
    def detect_installed_mcp_servers(self):
        """Read MCP configuration from .mcp.json"""
        
        mcp_config = self.project_root / '.mcp.json'
        
        if not mcp_config.exists():
            return []
        
        with open(mcp_config) as f:
            config = json.load(f)
            servers = config.get('mcpServers', {})
            return list(servers.keys())
    
    def load_previous_answers(self):
        """Load previous scaffolding answers if available"""
        
        answers_file = self.project_root / '.claude-answers.json'
        
        if answers_file.exists():
            with open(answers_file) as f:
                return json.load(f)
        
        return None
    
    def detect_all(self):
        """Run complete detection"""
        
        self.find_project_root()
        
        if not self.project_root:
            return {
                'is_claude_code_project': False,
                'error': 'No Claude Code project found'
            }
        
        return {
            'is_claude_code_project': True,
            'project_root': str(self.project_root),
            'framework_version': self.detect_framework_version(),
            'git': self.detect_git_state(),
            'mcp_servers': self.detect_installed_mcp_servers(),
            'previous_answers': self.load_previous_answers(),
            'detected_at': datetime.now().isoformat()
        }

# Usage
detector = ClaudeCodeDetector()
state = detector.detect_all()
print(json.dumps(state, indent=2))
```

---

## Detection Failure Modes

### Missing Project Root
**Signal**: No marker files found
**Recovery**: 
- Prompt user for project root path
- Offer to initialize new project
- Fallback to current directory

### Corrupted State Files
**Signal**: Invalid JSON/YAML in answers file
**Recovery**:
- Backup corrupted file
- Re-prompt all questions
- Log corruption event for debugging

### Version Mismatch
**Signal**: Detected version incompatible with required constraints
**Recovery**:
- Block scaffolding operation
- Show version compatibility error
- Offer upgrade path

### Ambiguous Stack Detection
**Signal**: Multiple frameworks detected (monorepo scenario)
**Recovery**:
- Ask user which framework is primary
- Support multi-framework templates
- Document assumptions in state file

---

## Next Steps

Use these patterns when implementing:
1. Context detection for `/sync-add` (initial installation)
2. State analysis for `/sync-pull` (update detection)
3. Conflict detection before sync operations
4. Version compatibility validation
