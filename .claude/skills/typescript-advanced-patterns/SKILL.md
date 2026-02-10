---
name: typescript-advanced-patterns
description: |
  Comprehensive TypeScript 5.x advanced patterns covering const type parameters, conditional
  types with infer, mapped types, template literal types, utility type creation, and type
  guards. Auto-activates for TypeScript projects when advanced type manipulation is needed.
---

# TypeScript Advanced Patterns Skill

This skill provides production-ready TypeScript advanced patterns for developers who know TypeScript basics but need patterns for real-world applications. Covers TypeScript 5.7/5.8 stable features with actionable, copy-pasteable examples.

## Type

passive

## Auto-Activation Triggers

### Keywords

- "const type parameters", "const T"
- "infer", "conditional types"
- "advanced generics", "generic constraints"
- "utility types", "custom utility"
- "mapped types", "keyof", "in keyof"
- "template literal types"
- "type guards", "is Type", "asserts"
- "type narrowing", "discriminated union"
- "DeepPartial", "DeepReadonly"

### File Patterns

- `**/*.ts`
- `**/*.tsx`
- `tsconfig.json`
- `**/*.d.ts`

### Task Contexts

- Implementing type-safe APIs
- Creating reusable type utilities
- Building type-safe configuration objects
- Fixing TypeScript type errors
- Improving type inference
- Working with complex generic patterns

## Description

Provides TypeScript-specific advanced type patterns from TypeScript 5.x. This skill complements existing skills (react-best-practices, security-patterns) with TypeScript type-level programming guidance.

Use when:
- Writing complex generic functions
- Creating custom utility types
- Implementing type-safe builders or factories
- Working with conditional type logic
- Needing runtime type guards
- Improving type inference in APIs

## Supporting Files

| File | Status | Description |
|------|--------|-------------|
| const-type-parameters.md | Active | TypeScript 5.0+ const generics for preserving literal types |
| conditional-types.md | Active | Conditional types with infer for type extraction |
| utility-types.md | Active | Custom utility type creation patterns |
| mapped-types.md | Active | Type transformations and key remapping |
| template-literal-types.md | Active | String manipulation at the type level |
| type-guards.md | Active | Runtime type narrowing and custom predicates |
| generics-advanced.md | Active | Constraints, defaults, variance annotations |

## Quick Reference

### Pattern Categories

| Category | Prefix | Focus | Complexity |
|----------|--------|-------|------------|
| Const Type Parameters | const- | Literal type preservation | LOW |
| Conditional Types | cond- | Type-level conditionals | MEDIUM |
| Utility Types | util- | Reusable type helpers | MEDIUM |
| Mapped Types | map- | Type transformations | MEDIUM |
| Template Literals | lit- | String type patterns | LOW-MEDIUM |
| Type Guards | guard- | Runtime narrowing | LOW |
| Advanced Generics | gen- | Constraints and variance | HIGH |

### TypeScript Version Compatibility

| Feature | Min Version | Notes |
|---------|-------------|-------|
| Const type parameters | 5.0 | `<const T>` syntax |
| satisfies operator | 4.9 | Type validation without widening |
| Variance annotations | 4.7 | `in`, `out`, `in out` |
| Template literal types | 4.1 | Full support |
| Conditional types | 2.8 | Foundation feature |

### Quick Checklist

**Before Writing Types**:
- [ ] Check if built-in utility type exists (Partial, Pick, Omit, etc.)
- [ ] Consider if const assertion is sufficient vs const type parameter
- [ ] Plan for type inference at call sites

**During Implementation**:
- [ ] Use `infer` for extracting types from structures
- [ ] Apply mapped types for systematic transformations
- [ ] Create type guards for runtime validation
- [ ] Test with edge cases (unions, never, unknown)

**Code Review**:
- [ ] Types are readable (consider type aliases for complex types)
- [ ] No unnecessary `any` or `as` casts
- [ ] Generics have appropriate constraints
- [ ] Error messages are helpful (use template literals in errors)

## Integration Points

This skill is consumed by:
- `task-code-impact.md` agent for TypeScript code analysis
- `stack-skill-recommender.md` for TypeScript project recommendations
- `/refine` command when analyzing TypeScript tasks
- `/develop-task` command during TypeScript implementation

## Usage with Commands

### During /refine

When refining a TypeScript-heavy task, this skill auto-activates and provides:
- Relevant type patterns for the specific task
- Type safety considerations
- Common TypeScript pitfalls to avoid

### During /develop-task

Reference specific pattern files during implementation:
- Check pattern files before implementing complex types
- Use code examples as starting templates
- Verify implementation against "Correct" examples and avoid "Anti-Pattern" examples

## Research Sources

- **TypeScript Official Docs**: [typescriptlang.org/docs](https://www.typescriptlang.org/docs/)
- **TypeScript 5.x Release Notes**: [devblogs.microsoft.com/typescript](https://devblogs.microsoft.com/typescript/)
- **Total TypeScript**: Professional training patterns
- **TypeScript Deep Dive**: Community patterns
- **EPIC-024 Market Research**: 80+ sources analyzed

**Last Updated**: 2026-01-22
**TypeScript Version**: 5.7/5.8 (stable features)

## Related Skills

| Skill | Relationship |
|-------|--------------|
| react-best-practices | Complements - TypeScript patterns for React |
| security-patterns | Complements - Type-safe security patterns |
| tdd-workflow | Complements - Testing TypeScript types |
| supabase-nextjs-integration | Complements - Type-safe Supabase client |
