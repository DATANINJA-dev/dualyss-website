# Template Organization Patterns

Reference for structuring project templates, defining variables, and managing persistent configuration.

---

## Directory Structure Patterns

### Yeoman Generator Structure

**Standard Multi-Generator Layout**:
```
generator-claude-code/
├── package.json
│   └── keywords: ["yeoman-generator", "claude-code"]
├── generators/
│   ├── app/
│   │   ├── index.js                 # Main generator class
│   │   └── templates/
│   │       ├── _package.json        # EJS template
│   │       ├── .claude/
│   │       │   ├── commands/
│   │       │   ├── agents/
│   │       │   ├── skills/
│   │       │   └── hooks/
│   │       ├── CLAUDE.md
│   │       ├── .mcp.json
│   │       └── backlog/
│   │           ├── epics.json
│   │           └── tasks.json
│   ├── mcp/                         # Sub-generator for MCP setup
│   │   ├── index.js
│   │   └── templates/
│   │       └── .mcp.json
│   └── skill/                       # Sub-generator for new skill
│       ├── index.js
│       └── templates/
│           └── skills/{{name}}/SKILL.md
├── test/
│   └── app.test.js
└── README.md
```

**Benefits**:
- `app/` = default generator (yo claude-code)
- Sub-generators = `yo claude-code:mcp`, `yo claude-code:skill`
- Clear separation: metadata, sources, templates

### Copier Template Structure

**Layout with Metadata Separation**:
```
copier-claude-code/
├── copier.yml                       # Configuration & questions
├── .copier/
│   ├── tasks_before.py              # Pre-generation tasks
│   ├── tasks_after.py               # Post-generation tasks
│   ├── migrations.py                # Version migrations
│   └── templates/
│       └── hooks/
│           ├── pre_prompt.py
│           ├── pre_gen_project.py
│           └── post_gen_project.py
├── template/                        # Optional subdirectory
│   └── {% raw %}{{_copier_namespace}}{% endraw %}/
│       ├── .claude/
│       │   ├── plugin.json
│       │   ├── commands/
│       │   ├── agents/
│       │   ├── skills/
│       │   └── hooks/
│       ├── CLAUDE.md
│       ├── backlog/
│       ├── .mcp.json
│       └── tests/
└── README.md
```

**Key Features**:
- `_subdirectory: "template"` = metadata separate from source
- `copier.yml` defines all questions and configuration
- `.copier/` contains hooks and migrations
- Template directory uses Jinja2 variables

### Cookiecutter Structure

**Standard Layout**:
```
cookiecutter-claude-code/
├── cookiecutter.json                # Configuration & variables
├── hooks/
│   ├── pre_prompt.py
│   ├── pre_gen_project.py
│   └── post_gen_project.py
├── {% raw %}{{cookiecutter.project_slug}}{% endraw %}/    # Project directory template
│   ├── .claude/
│   ├── CLAUDE.md
│   ├── backlog/
│   ├── .mcp.json
│   ├── README.md
│   └── requirements.txt
├── tests/
└── README.md
```

**Characteristics**:
- `cookiecutter.json` = variable definitions
- `hooks/` = Python/shell scripts for automation
- `{{cookiecutter.var}}` = template variable syntax
- All files and directories can use template variables

### Claude Code Framework Structure (Proposed)

**Modular, Version-Safe Layout**:
```
.claude/
├── plugin.json                      # Plugin metadata
│   {
│     "name": "claude-code-framework",
│     "version": "0.31.0",
│     "min_version": "0.25.0",
│     "questions": [...],
│     "tasks": [...]
│   }
├── .local.md                        # Project-specific overrides (gitignored)
├── CLAUDE.md                        # Framework documentation
├── commands/
│   ├── help.md
│   ├── refine.md
│   ├── develop-task.md
│   ├── audit.md
│   └── sync-*.md
├── agents/
│   ├── epic-semantic-matcher.md
│   ├── project-market-research.md
│   └── [organized by type]/
├── skills/
│   ├── claude-code-audit/
│   │   ├── SKILL.md
│   │   ├── best-practices.md
│   │   └── scoring-rubric.md
│   ├── framework-scaffolding-patterns/
│   │   ├── SKILL.md
│   │   ├── context-detection-patterns.md
│   │   └── template-organization.md
│   └── [other skills]/
├── hooks/
│   ├── epic-pre-write.md
│   ├── claude-file-pre-write.md
│   └── commit-validator.md
└── templates/
    ├── epic.md
    └── task.md

backlog/
├── epics/
│   └── EPIC-XXX.md
├── tasks/
│   └── TASK-XXX.md
├── epics.json                       # Index with metadata
├── tasks.json                       # Index with epic links
├── working/                         # Temporary analysis docs
├── audit-outputs/                   # Audit artifacts
└── audit-history.json               # Historical audit scores
```

**Design Principles**:
- Separate metadata (plugin.json) from content (commands/agents/skills)
- Skills group related patterns together
- Working docs in dedicated directory
- Audit artifacts separate from source
- .local.md for project-specific overrides

---

## Template Variable System

### Variable Definition

**Yeoman Approach** (in index.js):
```javascript
class MyGenerator extends Generator {
  prompting() {
    return this.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name',
        default: this.appname
      },
      {
        type: 'confirm',
        name: 'useBabel',
        message: 'Use Babel?',
        default: true
      }
    ]).then((answers) => {
      this.projectName = answers.projectName;
      this.useBabel = answers.useBabel;
    });
  }
}
```

**Copier Approach** (in copier.yml):
```yaml
questions:
  - name: project_name
    type: str
    prompt: Project name
    default: "My Claude Code Project"
    validator: |
      {% if not project_name %}Invalid{% endif %}

  - name: use_babel
    type: bool
    prompt: Use Babel?
    default: true

  - name: mcp_servers
    type: json
    prompt: Select MCP servers
    default:
      - "serena"
      - "github"
    when: "{{ enable_advanced }}"
```

**Cookiecutter Approach** (in cookiecutter.json):
```json
{
  "project_name": "My Claude Code Project",
  "project_slug": "{{ cookiecutter.project_name.lower().replace(' ', '_') }}",
  "use_babel": "y",
  "mcp_servers": ["serena", "github"],
  "python_version": "3.9"
}
```

### Variable Scope and Lifecycle

**Rendering Stages**:
1. **Definition**: Variables defined in config file
2. **Prompting**: User answers collected (or defaults used)
3. **Validation**: Pre-generation hook validates answers
4. **Rendering**: Templates processed with variables
5. **Post-Processing**: Post-generation hooks run
6. **Persistence**: Answers saved for future updates

**Variable Scope**:
```python
# Available in templates:
- User-provided answers ({{ variable_name }})
- Special system variables (_copier_operation, _stage)
- Jinja2 filters (lower, upper, replace, etc.)
- Conditional expressions ({{ if ... else ... }})

# NOT available:
- External environment variables (security)
- System commands (security)
- File system operations (template-only)
```

### Type System for Variables

**Copier Type Support**:
```yaml
- str          # String, default type
- bool         # Boolean (true/false)
- int          # Integer
- float        # Float
- json         # JSON object/array
- yaml         # YAML value
- path         # File system path
```

**Type Example**:
```yaml
questions:
  - name: python_version
    type: str
    prompt: Python version
    default: "3.11"

  - name: include_tests
    type: bool
    prompt: Include test suite?
    default: true

  - name: dependencies
    type: json
    prompt: Additional dependencies
    default: ["requests", "pytest"]

  - name: config_path
    type: path
    prompt: Configuration file path
    default: "./config"
```

---

## Conditional Variables and Progressive Disclosure

### Conditional Rendering

**In Templates**:
```jinja2
{% if use_docker %}
# Docker configuration
FROM python:3.11
COPY requirements.txt .
RUN pip install -r requirements.txt
{% endif %}

{% if mcp_enabled %}
# MCP server configuration
[tool.mcp]
servers = {{ mcp_servers|to_json }}
{% endif %}
```

**In Question Definitions**:
```yaml
questions:
  - name: use_docker
    type: bool
    prompt: Use Docker?
    default: false

  - name: docker_registry
    type: str
    prompt: Docker registry
    default: "docker.io"
    when: "{{ use_docker }}"  # Only shown if use_docker is true

  - name: dockerfile_path
    type: path
    prompt: Dockerfile location
    default: "Dockerfile"
    when: "{{ use_docker }}"

  - name: mcp_enabled
    type: bool
    prompt: Enable MCP integration?
    default: true
    when: "{{ audience in ['team', 'public'] }}"  # Scale-dependent
```

**Benefits**:
- Reduces cognitive load (fewer questions)
- Prevents invalid configurations
- Tailors to project context
- Progressive disclosure pattern

---

## Variable Persistence

### Answers File Format

**Standard Format** (.copier-answers.yml or .claude-answers.json):
```json
{
  "_copier_conf": {
    "src_path": "https://github.com/user/template.git",
    "dst_path": "/path/to/project",
    "answers_file": ".claude-answers.json",
    "version": "0.31.0"
  },
  "framework_version": "0.31.0",
  "project_name": "My Project",
  "use_docker": true,
  "docker_registry": "ghcr.io",
  "mcp_enabled": true,
  "mcp_servers": ["github", "serena"],
  "audience": "team",
  "created_at": "2026-01-04T00:00:00Z",
  "updated_at": "2026-01-10T12:00:00Z"
}
```

**Multi-Template Support**:
```
Project root/
├── .claude-answers.core.json        # Core framework settings
├── .claude-answers.mcp.json         # MCP configuration
├── .claude-answers.ci.json          # CI/CD pipeline
└── .claude-answers.skills.json      # Custom skills installed
```

Each answers file tracks independently:
- Template URL
- Template version
- User responses specific to that template

### Update Workflow

**Step 1: Load Previous Answers**
```python
with open('.claude-answers.json') as f:
    previous_answers = json.load(f)
```

**Step 2: Display Current Values**
```
? Project name: [My Project] 
? Use Docker? [y/N] 
? MCP servers (JSON): [["github", "serena"]]
```

**Step 3: Accept Changes**
- User confirms (Enter) → keep previous value
- User provides new value → update
- Skip with tab/escape → use default

**Step 4: Validate New Answers**
```python
# In pre_gen_project hook
new_answers = merge(previous_answers, user_input)
validate(new_answers)
```

**Step 5: Migrate if Needed**
```python
# In migrations.py
def migrate_v1_to_v2(answers):
    # Transform old format to new
    if 'legacy_field' in answers:
        answers['new_field'] = transform(answers.pop('legacy_field'))
    return answers
```

**Step 6: Save Updated Answers**
```python
with open('.claude-answers.json', 'w') as f:
    json.dump(final_answers, f, indent=2)
```

---

## Variable Filtering and Transformations

### Jinja2 Filters for Common Tasks

```jinja2
{# Strings #}
{{ project_name|lower }}                    # Lowercase
{{ project_name|upper }}                    # Uppercase
{{ project_name|title }}                    # Title case
{{ project_name|replace(' ', '_') }}        # Replace

{# Collections #}
{{ modules|join(', ') }}                    # Join array
{{ modules|first }}                         # First item
{{ modules|last }}                          # Last item
{{ modules|length }}                        # Count items

{# Conditions #}
{{ value if condition else default }}       # Ternary
{% if value %}...{% endif %}                # Conditional block

{# Formatting #}
{{ data|to_json }}                          # JSON format
{{ data|to_yaml }}                          # YAML format
{{ value|indent(4) }}                       # Add indentation
```

### Custom Filter Example

```python
# In Jinja2 environment setup
def slugify(value):
    """Convert to URL-safe slug"""
    import re
    value = value.lower()
    value = re.sub(r'[^\w\s-]', '', value)
    value = re.sub(r'[\s_]+', '-', value)
    return value

env.filters['slugify'] = slugify
```

**Usage in Template**:
```jinja2
{{ project_name|slugify }}  # My Project → my-project
```

---

## Examples: Complete Variable Systems

### Example 1: Node.js Project Template

**copier.yml**:
```yaml
_min_copier_version: ">=3.0.0"

questions:
  - name: project_name
    type: str
    prompt: Project name
    default: "my-project"

  - name: typescript
    type: bool
    prompt: Use TypeScript?
    default: true

  - name: framework
    type: str
    prompt: Framework
    choices:
      - "next"
      - "remix"
      - "vite"
    default: "next"
    when: "{{ framework_type == 'web' }}"

  - name: tailwind
    type: bool
    prompt: Include Tailwind CSS?
    default: true
    when: "{{ framework in ['next', 'remix'] }}"

  - name: testing_framework
    type: str
    prompt: Testing framework
    choices:
      - "vitest"
      - "jest"
      - "playwright"
    default: "vitest"

_tasks:
  - command: ["npm", "install"]
    when: "{{ task_stage == 'after' }}"
  - command: ["npm", "run", "build"]
    when: "{{ task_stage == 'after' }}"
```

### Example 2: Python Project Template

**copier.yml**:
```yaml
_min_copier_version: ">=3.0.0"

questions:
  - name: project_name
    type: str
    prompt: Project name

  - name: project_slug
    type: str
    default: "{{ project_name.lower().replace('-', '_') }}"

  - name: python_version
    type: str
    prompt: Python version
    choices: ["3.9", "3.10", "3.11", "3.12"]
    default: "3.11"

  - name: use_poetry
    type: bool
    prompt: Use Poetry for dependency management?
    default: true

  - name: use_pytest
    type: bool
    prompt: Include pytest?
    default: true

  - name: use_mypy
    type: bool
    prompt: Include type checking with mypy?
    default: true

_tasks:
  - python: "scripts/init_venv.py"
    when: "{{ task_stage == 'after' }}"
  - command: ["poetry", "install"]
    when: "{{ task_stage == 'after' and use_poetry }}"
```

### Example 3: Claude Code Framework Template

**plugin.json** (equivalent to copier.yml):
```json
{
  "name": "claude-code-framework",
  "version": "0.31.0",
  "min_version": "0.25.0",
  "questions": [
    {
      "name": "framework_version",
      "type": "str",
      "prompt": "Framework version",
      "default": "0.31.0"
    },
    {
      "name": "project_audience",
      "type": "str",
      "prompt": "Project audience",
      "choices": ["personal", "team", "public"],
      "default": "{{ detected_audience }}"
    },
    {
      "name": "enable_mcp",
      "type": "bool",
      "prompt": "Enable MCP integration?",
      "default": false,
      "when": "{{ project_audience in ['team', 'public'] }}"
    },
    {
      "name": "mcp_servers",
      "type": "json",
      "prompt": "Select MCP servers",
      "default": ["serena"],
      "when": "{{ enable_mcp }}"
    },
    {
      "name": "enable_sync",
      "type": "bool",
      "prompt": "Enable git sync with hub?",
      "default": false
    }
  ],
  "tasks": [
    {
      "command": ["python", "scripts/create_indices.py"],
      "when": "{{ task_stage == 'after' }}"
    }
  ]
}
```

---

## Next Steps

Use these patterns for:
1. Defining project template structure for `/sync-add`
2. Creating variable validation schemas
3. Implementing multi-template support
4. Building migration paths between versions
