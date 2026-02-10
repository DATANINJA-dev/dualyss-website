---
name: tdd-workflow
description: |
  Guides test-driven development patterns for agentic coding. Auto-activates when
  writing tests, implementing features, or when user mentions TDD, testing, or
  "test first". Follows Anthropic's recommended TDD approach for Claude Code.

  Active Skill: Includes workflows/cycle.md for executable TDD cycles and
  agents for test writing, execution, and verification.
---

# TDD Workflow Skill

## When This Skill Activates

- Writing new tests or test files
- Implementing features that need test coverage
- User mentions "TDD", "test first", "red-green-refactor"
- User asks to "add tests" or "write tests"
- Debugging test failures
- Building SEO validation tools (see seo-patterns.md)

## Core Principles

Based on [Anthropic's Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices):

### 1. Write Tests BEFORE Implementation

```
User: "Add a function to validate email addresses"

WRONG approach:
1. Write validateEmail() function
2. Write tests for it

RIGHT approach:
1. Write tests for validateEmail()
2. Confirm tests FAIL
3. Implement validateEmail()
4. Confirm tests PASS
```

### 2. Confirm Failure First

Always verify tests fail before implementing:

```bash
# Run tests - should see failures
npm test  # or pytest, etc.

# Only then implement the feature
# Run tests again - should pass
```

### 3. Avoid Mocks - Use Real Implementations

```
WRONG: Mock the database, mock the API, mock everything
RIGHT: Use real test databases, real (sandboxed) APIs

Why: Mocks can pass while real code fails. Real tests catch real bugs.
```

### 4. Commit Tests Separately

```bash
# First commit: tests only (they fail)
git commit -m "Add tests for email validation"

# Second commit: implementation (tests pass)
git commit -m "Implement email validation"
```

## TDD Cycle

```
┌─────────────────────────────────────────┐
│                                         │
│   1. RED: Write failing test            │
│      ↓                                  │
│   2. GREEN: Write minimal code to pass  │
│      ↓                                  │
│   3. REFACTOR: Clean up, keep tests     │
│      ↓                                  │
│   (repeat)                              │
│                                         │
└─────────────────────────────────────────┘
```

## Quick Reference

| Situation | Action |
|-----------|--------|
| New feature | Write test first, confirm failure |
| Bug fix | Write test that reproduces bug first |
| Refactoring | Ensure tests pass before AND after |
| API change | Update tests first, then implementation |
| SEO validation | Use fixtures for external APIs, real for local parsing |

## Supporting Files

- **seo-patterns.md** - SEO test patterns (mocking, snapshots, fixtures, CI/CD)

## Anti-Patterns to Avoid

1. **Writing tests after implementation** - Defeats TDD purpose
2. **Excessive mocking** - Tests pass but code fails in production
3. **Testing implementation details** - Tests break on refactor
4. **Skipping the "red" phase** - Miss the confidence that tests actually test something

## Integration with Workflow

When implementing features:

1. Ask user for expected input/output pairs
2. Write tests based on those pairs
3. Run tests to confirm they fail
4. Implement feature
5. Run tests to confirm they pass
6. Commit tests and implementation (separately if preferred)

## Constraints

- Never skip the "confirm failure" step
- Prefer real implementations over mocks
- Keep tests focused on behavior, not implementation
- Run tests frequently during development

---

## Workflows

This skill includes an executable workflow for complete TDD cycles:

### `workflows/cycle.md` - TDD Cycle Workflow

Execute one complete Red-Green-Refactor TDD cycle for a component.

**Invocation**:
- Via Task tool: Reference `.claude/skills/tdd-workflow/workflows/cycle.md`
- Via command: `/tdd:cycle [component] [framework]`

**Parameters**:
| Parameter | Required | Description |
|-----------|----------|-------------|
| COMPONENT | Yes | Component specification (what to build) |
| TEST_FRAMEWORK | No | Auto-detected from project (jest, pytest, vitest, go test, cargo test) |
| TEST_FILE_PATH | No | Where to create test file (uses conventions if not specified) |
| RESUME_PHASE | No | Resume interrupted cycle (red, green, refactor) |

**Phases**:
1. **RED** - Write failing tests (test-writer agent)
2. **GREEN** - Minimal implementation (tests must pass)
3. **REFACTOR** - Clean up (tests must stay green)
4. **VERIFY** - TDD compliance check (develop-test-verifier)

---

## Agents

This skill includes specialized agents for TDD execution:

### `agents/test-writer.md` (sonnet)

Write meaningful failing tests for a component specification.

- **Purpose**: RED phase test creation
- **Tools**: Read, Write
- **Output**: Test file with cases covering happy path, edge cases, error cases
- **Critical**: Tests MUST fail without implementation

### `agents/test-runner.md` (haiku)

Execute tests and report pass/fail status.

- **Purpose**: Test verification in all phases
- **Tools**: Read, Bash (RESTRICTED to test commands only)
- **Supports**: jest, pytest, vitest, mocha, go test, cargo test
- **Output**: JSON with test counts, status, and whether expectation was met
- **Security**: Bash restricted to allowed test command patterns only

---

## External References

This skill uses shared agents from the main agents directory:

### `.claude/agents/develop-test-verifier.md` (haiku)

Verifies TDD compliance after cycle completion.

- **Shared with**: develop-task command
- **Purpose**: VERIFY phase compliance scoring
- **Scores**: RED (3pts), GREEN (4pts), REFACTOR (3pts)
- **Verdicts**: COMPLIANT (≥8), PARTIAL (5-7), NON_COMPLIANT (<5)

Using the shared agent avoids duplication and ensures consistent TDD verification
across both standalone `/tdd:cycle` and integrated `/develop-task` usage.

---

## Usage Examples

### Standalone TDD Cycle

```
/tdd:cycle "email validator function" jest
```

1. Detects jest framework
2. Writes test_email_validator.test.ts with failing tests
3. Guides minimal implementation
4. Refactors for clarity
5. Verifies TDD compliance

### Within /develop-task

The `/develop-task` command automatically invokes this workflow for each
implementation step, ensuring TDD discipline throughout development.

### Manual Workflow Invocation

```markdown
Use Task tool to invoke:
- Path: .claude/skills/tdd-workflow/workflows/cycle.md
- Parameters:
  - COMPONENT: "calculateTax function"
  - TEST_FRAMEWORK: "vitest"
```
