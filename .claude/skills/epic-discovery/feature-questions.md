# Feature-Scale Question Framework

Use these questions for feature-scale ideas (additions to existing products, single epics).

## Phase 1: Context & Need

### Current State

1. "What exists today that this relates to?"
2. "Is this extending something or creating something new?"
3. "What triggered this need? (User feedback, analytics, roadmap, etc.)"

### User Need

1. "Who specifically needs this feature?"
2. "What are they trying to accomplish?"
3. "How are they solving this today? (Workaround, competitor, manual process)"

## Phase 2: Scope Definition

### Feature Boundaries

1. "What's the core functionality this must provide?"
2. "What variations or edge cases should we handle?"
3. "What's explicitly NOT part of this feature?"

### Integration Points

1. "How does this connect to existing features?"
2. "Are there dependencies on other work?"
3. "Does this change existing user flows?"

## Phase 3: Success Criteria

### Definition of Done

1. "What must be true for this feature to be complete?"
2. "How will users discover/access this feature?"
3. "What's the expected outcome when users use this?"

### Measurement

1. "How will we know if this feature is successful?"
2. "What usage would indicate adoption?"
3. "Are there failure modes we need to monitor?"

## Phase 4: Constraints

### Technical

1. "Are there performance requirements?"
2. "Platform/browser requirements?"
3. "Data or privacy considerations?"

### Design

1. "Are there existing patterns we should follow?"
2. "Any accessibility requirements?"
3. "Mobile/responsive considerations?"

## Question Prioritization

For feature-scale discovery, prioritize:

1. **Must Ask** (block if unclear):
   - What this feature does
   - Who needs it and why
   - How it relates to existing functionality

2. **Should Ask** (warn if unclear):
   - Scope boundaries
   - Success criteria
   - Integration points

3. **Nice to Ask** (proceed if unclear):
   - Technical constraints
   - Design details
   - Analytics requirements

## Feature vs Epic Decision

If during questioning you discover:

| Signal | Decision |
|--------|----------|
| Multiple user types involved | Consider product-scale |
| Needs market research | Consider product-scale |
| Affects multiple existing features | Consider multiple epics |
| Has clear bounded scope | Keep as single epic |
| Extends existing epic | Consider EXTEND flow |

## Common Feature Categories

### API/Integration
- What systems need to connect?
- Data format and validation needs?
- Error handling expectations?

### UI/UX
- New screens or modifications?
- User flow changes?
- Form/input requirements?

### Performance/Scale
- Volume/load expectations?
- Response time requirements?
- Caching/optimization needs?

### Admin/Config
- Who configures this?
- What settings are needed?
- Default behaviors?

## Anti-Patterns to Avoid

- Don't inflate to product-scale if bounded
- Don't assume technical implementation
- Don't skip "why" questions for "obvious" features
- Don't scope creep during discovery
