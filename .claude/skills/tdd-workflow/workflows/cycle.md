---
name: tdd-cycle
description: |
  Execute one complete Red-Green-Refactor TDD cycle for a component.
  Invoked by /develop-task or independently via /tdd:cycle command.
  Orchestrates test-writer and test-runner agents, uses develop-test-verifier
  for final compliance verification.
allowed-tools: Read, Write, Edit, Task, AskUserQuestion
allowed-frameworks:
  - jest
  - pytest
  - vitest
  - mocha
  - go test
  - cargo test
input-parameters:
  - COMPONENT: string (required - component name/description)
  - TEST_FRAMEWORK: string (optional - auto-detected if not provided)
  - TEST_FILE_PATH: string (optional - default based on framework conventions)
  - RESUME_PHASE: red|green|refactor (optional - for interrupted cycles)
---

# TDD Cycle Workflow

Execute one complete Red-Green-Refactor TDD cycle for a component. This workflow enforces strict TDD discipline: tests are written first, must fail, then minimal implementation makes them pass, then code is cleaned up.

## Inputs

- **COMPONENT** - Component specification (what it should do)
- **TEST_FRAMEWORK** - Test framework to use (auto-detected if not provided)
- **TEST_FILE_PATH** (optional) - Where to create test file
- **RESUME_PHASE** (optional) - Resume interrupted cycle from specific phase

## Workflow Phases

### Phase 0: Framework Detection (if TEST_FRAMEWORK not provided)

[Extended thinking: Detect test framework from project configuration files. Check for jest in package.json, pytest.ini, go.mod, Cargo.toml, etc.]

1. **Detect test framework**:

   | Check | Framework | Test Command |
   |-------|-----------|--------------|
   | package.json → jest | Jest | `npm test` |
   | package.json → vitest | Vitest | `vitest run` |
   | package.json → mocha | Mocha | `npm test` |
   | pytest.ini, pyproject.toml | pytest | `pytest` |
   | *_test.go files | Go test | `go test ./...` |
   | Cargo.toml | Cargo | `cargo test` |

2. **If no framework detected**, ask user:
   ```
   Test framework not auto-detected.

   Options:
   [J]est - JavaScript/TypeScript (npm)
   [V]itest - JavaScript/TypeScript (vite)
   [P]ytest - Python
   [G]o test - Go
   [C]argo test - Rust
   [O]ther - Specify custom command
   ```

3. **Confirm framework**:
   ```
   Detected: [framework]
   Test command: [command]

   Use this framework? [Y/n/change]
   ```

### Phase 1: RED - Write Failing Tests

[Extended thinking: In TDD, the RED phase establishes what we want to build by writing tests that describe the expected behavior. These tests MUST fail because the implementation doesn't exist yet.]

4. **Present RED phase scope**:
   ```
   ## RED Phase: Write Failing Tests

   **Component**: [COMPONENT]
   **Framework**: [TEST_FRAMEWORK]

   Goal: Write tests that describe expected behavior.
   Tests MUST fail (implementation doesn't exist yet).

   Proceeding to write tests...
   ```

5. **Invoke test-writer agent**:
   - Use Task tool to launch `agents/test-writer.md` (sonnet)
   - Pass: COMPONENT, TEST_FRAMEWORK, TEST_FILE_PATH
   - Wait for completion

6. **Capture test-writer output**:
   - Test file path created
   - Test cases written
   - Expected failures

7. **Verify tests fail** (CRITICAL):
   - Use Task tool to launch `agents/test-runner.md` (haiku)
   - Pass: test command, `expected_outcome: should_fail`, phase: RED
   - Wait for completion

8. **Handle RED verification result**:

   **If tests FAIL (expected)**:
   ```
   ## RED Phase Complete

   Tests written and verified failing:

   | Test | Failure Reason |
   |------|----------------|
   | [test] | [why it fails] |

   Ready to proceed to GREEN phase.
   Continue? [Y/n]
   ```

   **If tests PASS (unexpected - ABORT)**:
   ```
   ## RED Phase ABORT

   Tests passed without implementation!

   This means tests don't verify new behavior - they test
   something that already exists or are trivially satisfied.

   Options:
   [R]eview test file - Check test logic
   [D]elete and retry - Start RED phase again
   [A]sk for guidance - Get help
   ```
   Do NOT proceed to GREEN if tests pass in RED phase.

### Phase 2: GREEN - Minimal Implementation

[Extended thinking: In the GREEN phase, we write the simplest possible code to make the tests pass. No extra features, no optimization, just make the tests green.]

9. **Present GREEN phase scope**:
   ```
   ## GREEN Phase: Minimal Implementation

   **Objective**: Write the simplest code that makes tests pass.

   Rules:
   - Only write code that makes tests pass
   - No extra features
   - No premature optimization
   - "Make it work" before "make it right"

   Ready to implement? [Y/n]
   ```

10. **Write implementation**:
    - Analyze test cases to understand required behavior
    - Write minimal implementation in target file
    - Use existing code patterns from codebase

11. **Verify tests pass**:
    - Use Task tool to launch `agents/test-runner.md` (haiku)
    - Pass: test command, `expected_outcome: should_pass`, phase: GREEN
    - Wait for completion

12. **Handle GREEN verification result**:

    **If tests PASS (expected)**:
    ```
    ## GREEN Phase Complete

    All tests passing:

    | Test | Status |
    |------|--------|
    | [test] | PASS |

    Implementation complete. Review before REFACTOR? [Y/n/skip refactor]
    ```

    **If tests FAIL (unexpected - recovery)**:
    ```
    ## GREEN Phase: Tests Still Failing

    Implementation did not make all tests pass:

    **Failures**:
    - [test]: [error message]

    Recovery options:
    [F]ix - Attempt to fix implementation
    [D]ebug - Show full test output
    [R]evert - Undo changes and restart
    [A]sk - Get user guidance
    ```
    Loop on [F]ix until tests pass or user chooses other option.

### Phase 3: REFACTOR - Clean Up

[Extended thinking: In the REFACTOR phase, we improve code quality while keeping tests green. Each small change is verified by running tests.]

13. **Present REFACTOR phase scope**:
    ```
    ## REFACTOR Phase: Clean Up

    **Objective**: Improve code quality while keeping tests green.

    Potential improvements:
    - Extract duplicated code
    - Improve naming clarity
    - Simplify complex logic
    - Follow project patterns

    Analyze for refactoring opportunities? [Y/n/skip]
    ```

14. **Identify refactoring opportunities**:
    - Review implementation for code smells
    - Check for naming clarity
    - Look for duplication
    - Verify consistency with codebase patterns

15. **For each refactoring**:
    - Apply ONE small change
    - Run tests immediately
    - If tests fail: REVERT immediately
    - If tests pass: Continue to next refactoring

16. **Verify tests still pass**:
    - Use Task tool to launch `agents/test-runner.md` (haiku)
    - Pass: test command, `expected_outcome: should_pass`, phase: REFACTOR
    - Wait for completion

17. **Handle REFACTOR verification result**:

    **If tests PASS**:
    ```
    ## REFACTOR Phase Complete

    All tests still passing after refactoring.

    Changes applied:
    - [refactoring 1]
    - [refactoring 2]

    Ready for verification? [Y/n]
    ```

    **If tests FAIL after refactoring**:
    ```
    ## REFACTOR Phase: Tests Broke

    Refactoring broke tests - reverting last change.

    Reverted: [change that broke tests]

    Continue with other refactorings? [Y/n]
    ```
    Automatically revert and continue or finish.

### Phase 4: VERIFY - TDD Compliance

18. **Run TDD compliance verification**:
    - Use Task tool to launch `develop-test-verifier.md` (haiku)
    - Pass: test files, implementation files, test output history
    - This is the EXISTING agent from `.claude/agents/`

19. **Present verification results**:
    ```
    ## TDD Cycle Verification

    **TDD Compliance Score**: [X]/10 - [COMPLIANT/PARTIAL/NON_COMPLIANT]

    | Phase | Score | Notes |
    |-------|-------|-------|
    | RED | X/3 | Tests written first, failed |
    | GREEN | X/4 | Minimal impl, tests pass |
    | REFACTOR | X/3 | Improvements made, tests green |

    [If COMPLIANT]
    TDD cycle complete and compliant.

    [If PARTIAL or NON_COMPLIANT]
    Issues detected:
    - [issue 1]
    - [issue 2]
    ```

## Cycle Output

```markdown
## TDD Cycle Complete

### Component: [COMPONENT]
### Framework: [TEST_FRAMEWORK]

| Phase | Status | Result |
|-------|--------|--------|
| RED | COMPLETE | Tests written, failed as expected |
| GREEN | COMPLETE | Implementation passed tests |
| REFACTOR | COMPLETE | Code improved, tests still green |
| VERIFY | [COMPLIANT/PARTIAL] | Score: X/10 |

### Files Changed

| File | Action | Lines |
|------|--------|-------|
| [test-file] | created | +N |
| [impl-file] | created/modified | +N/-N |

### Tests Added

| Test | Description |
|------|-------------|
| [test_name] | [what it verifies] |

### Next Steps

- Commit these changes
- Continue to next implementation step
- Or run `/develop-task` to continue workflow
```

## Error Handling

| Situation | Action |
|-----------|--------|
| Tests pass in RED phase | ABORT - tests don't verify new behavior |
| Tests fail in GREEN phase | Offer Fix/Debug/Revert/Ask options |
| Tests fail in REFACTOR phase | Auto-revert, continue or finish |
| Framework not detected | Ask user to specify |
| Test-writer fails | Show error, ask to retry or skip |
| Test-runner times out | Report timeout, suggest scope reduction |
| User cancels mid-cycle | Save progress for resume |

## Critical Rules

- **NEVER skip RED phase** - Tests must be written first
- **Tests MUST fail in RED** - Abort if they pass
- **Tests MUST pass in GREEN** - Loop or recover until they do
- **Tests MUST stay green in REFACTOR** - Revert any breaking changes
- **Use existing develop-test-verifier** - Don't duplicate verification logic
- **One refactoring at a time** - Verify after each change
- **Save progress for resume** - Support interrupted cycles
- **Restricted Bash in test-runner** - Security constraint

## Resume Support

If RESUME_PHASE provided, skip to that phase:

| RESUME_PHASE | Start From |
|--------------|------------|
| red | Phase 1 (after framework detection) |
| green | Phase 2 (skip test writing) |
| refactor | Phase 3 (skip implementation) |
