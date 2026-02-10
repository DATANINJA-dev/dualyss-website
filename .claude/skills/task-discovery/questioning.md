# Question Frameworks by Task Type

## Feature Tasks

### Required Information
- Title: What is this feature called?
- Description: What does it do? Why is it needed?
- User Stories: Who uses it and what do they accomplish?
- Acceptance Criteria: How do we know it's done?

### Discovery Questions

**Scope Definition:**
1. "What problem does this feature solve?"
2. "Who is the primary user of this feature?"
3. "What is the expected workflow or user journey?"
4. "What should explicitly NOT be included in this feature?"

**User Stories:**
1. "As a [type of user], I want [goal] so that [benefit]. What users should we consider?"
2. "What are the primary actions users will take?"
3. "Are there any edge cases or alternative flows?"

**Acceptance Criteria:**
1. "How will we verify this feature works correctly?"
2. "What are the measurable outcomes?"
3. "Are there performance requirements?"
4. "What error states need to be handled?"

**Technical Context (from agents):**
- "The Code Impact agent found [N] files affected. Does this scope seem right?"
- "The Security agent flagged [concern]. Should we add security criteria?"
- "The UX agent noted [pattern]. Should we follow this pattern?"

---

## Bug Tasks

### Required Information
- Title: Brief description of the bug
- Description: What is happening vs what should happen
- Reproduction Steps: How to trigger the bug
- Expected vs Actual: Clear contrast

### Discovery Questions

**Problem Definition:**
1. "What is happening that shouldn't be?"
2. "What should happen instead?"
3. "How severe is this bug? (blocks work / major inconvenience / minor issue)"

**Reproduction:**
1. "What are the exact steps to reproduce this?"
2. "Does it happen every time or intermittently?"
3. "What environment/browser/OS does this occur in?"
4. "Are there any error messages or console output?"

**Context:**
1. "When did this start happening?"
2. "Was there a recent change that might have caused it?"
3. "Who is affected by this bug?"

**Technical Context (from agents):**
- "The Code Impact agent identified [files]. Does this look like the right area?"
- "The Test Planning agent found [coverage]. Any existing tests we should check?"

---

## Refactor Tasks

### Required Information
- Title: What is being refactored
- Description: Why the refactor is needed
- Current State: How it works now
- Desired State: How it should work after
- Scope: What's included/excluded

### Discovery Questions

**Motivation:**
1. "What problems does the current implementation have?"
2. "Why is now the right time to refactor this?"
3. "What benefits do we expect from this refactor?"

**Current State:**
1. "How does the current implementation work?"
2. "What are its main pain points?"
3. "Are there any existing tests?"

**Desired State:**
1. "What should the refactored code look like?"
2. "Are there specific patterns or architectures to follow?"
3. "What constraints must be maintained?"

**Scope:**
1. "What is explicitly included in this refactor?"
2. "What should NOT be changed?"
3. "Are there downstream dependencies to consider?"

**Technical Context (from agents):**
- "The Code Impact agent found [dependencies]. Should we include these?"
- "The Test Planning agent noted [coverage gaps]. Should we add tests first?"

---

## Research Tasks

### Required Information
- Title: Topic being researched
- Description: Context and motivation
- Questions: Specific questions to answer
- Success Criteria: How we know research is complete

### Discovery Questions

**Scope:**
1. "What specific questions need to be answered?"
2. "What decisions will this research inform?"
3. "What is the deadline or time constraint?"

**Context:**
1. "What do we already know about this topic?"
2. "Are there constraints that limit our options?"
3. "Who are the stakeholders for this research?"

**Deliverables:**
1. "What format should the research output take?"
2. "Who needs to review or approve the findings?"
3. "What happens after research is complete?"

---

## Infra Tasks

### Required Information
- Title: What infrastructure change
- Description: Why it's needed
- Current Setup: How it works now
- Proposed Changes: What will change
- Rollback Plan: How to undo if needed

### Discovery Questions

**Current State:**
1. "What is the current infrastructure setup?"
2. "What problems or limitations exist?"
3. "What is the impact if we don't make this change?"

**Proposed Changes:**
1. "What specific changes are proposed?"
2. "What tools or services are involved?"
3. "Are there cost implications?"

**Risk Assessment:**
1. "What could go wrong?"
2. "How do we roll back if needed?"
3. "What is the testing strategy?"
4. "Is there a maintenance window required?"

**Technical Context (from agents):**
- "The Security agent noted [concerns]. How should we address these?"
- "The Documentation agent flagged [docs needed]. Who will update them?"

---

## Docs Tasks

### Required Information
- Title: What documentation
- Description: Why it's needed
- Audience: Who will read it
- Outline: Structure of the document

### Discovery Questions

**Purpose:**
1. "What is this documentation for?"
2. "What problem does it solve for readers?"
3. "What should readers be able to do after reading?"

**Audience:**
1. "Who is the primary audience?"
2. "What do they already know?"
3. "What terminology or concepts need explanation?"

**Content:**
1. "What topics must be covered?"
2. "Are there existing docs to update vs. new docs to create?"
3. "What examples or code samples are needed?"

**Format:**
1. "What format should this take? (tutorial, reference, guide)"
2. "Where will this documentation live?"
3. "How will it be maintained?"

---

## Follow-Up Techniques

### When Answers Are Vague

Transform vague answers into specific questions:

| Vague Answer | Follow-Up Question |
|--------------|-------------------|
| "It should be fast" | "What response time is acceptable? Under 200ms?" |
| "Users should like it" | "What specific user feedback would indicate success?" |
| "It needs to work" | "What are the specific scenarios that must work?" |
| "Make it better" | "What specific aspects need improvement?" |

### When Scope Is Unclear

1. "Let me make sure I understand - does this include [X]?"
2. "Should this also handle [edge case]?"
3. "What is explicitly out of scope?"
4. "If we had to cut something, what would be lowest priority?"

### When Technical Details Are Needed

1. "What existing patterns should this follow?"
2. "Are there performance constraints?"
3. "What error handling is needed?"
4. "How should this interact with [existing system]?"
