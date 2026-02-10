# Migration Communication Plan

## Principles

1. **Early & Often**: Announce changes well in advance, repeat key messages
2. **Clear & Specific**: Avoid vague terms, provide concrete examples
3. **Actionable**: Tell users exactly what they need to do
4. **Supportive**: Offer help, acknowledge inconvenience

## Communication Timeline

### T-14 Days: Pre-Announcement

**Channel**: Changelog, GitHub Discussion, Email

**Message Template**:
```markdown
## Upcoming Change: Command Renaming (v1.0)

We're renaming `/set-up` to `/refine` to better align with agile terminology.

**Why?**
- "Refinement" is the official Scrum term for task preparation
- Clearer intent (not environment setup, but task planning)
- Aligns with industry conventions

**What's Changing?**
- `/set-up TASK-XXX` becomes `/refine TASK-XXX`
- All functionality remains the same
- Both commands will work during transition (6 weeks)

**Timeline**:
- Week 0: Announcement (today)
- Week 2: `/refine` available, `/set-up` shows deprecation warning
- Week 8: `/set-up` removed (if adoption > 90%)

**Action Required**:
- Read migration guide: [link]
- Test `/refine` in your workflows
- Report issues: [support channel]

**Questions?**
- FAQ: [link]
- Discussion: [GitHub Discussions]
```

### T-7 Days: Migration Guide Published

**Channel**: Documentation (MIGRATION.md)

**Content**:
```markdown
# Migration Guide: /set-up → /refine

## Overview
Version 1.0 renames `/set-up` to `/refine` for clarity.

## What You Need to Do

### Step 1: Update Command Invocations
Replace all uses of `/set-up` with `/refine`:

**Before**:
```bash
/set-up TASK-001
/set-up TASK-002 --quick
```

**After**:
```bash
/refine TASK-001
/refine TASK-002 --quick
```

### Step 2: Update Documentation (if applicable)
If you've documented internal workflows using `/set-up`, update them.

### Step 3: Test
Run `/refine` on a test task to verify it works as expected.

## Backward Compatibility
For 6 weeks, `/set-up` will continue to work but show a deprecation warning:
```
⚠ Warning: /set-up is deprecated. Use /refine instead.
```

## Breaking Changes
None - all flags and behavior remain identical.

## Rollback
If issues arise, use `/set-up` until resolved. Report problems: [link]

## Support
- FAQ: [link]
- Issues: [GitHub Issues]
- Discussion: [GitHub Discussions]
```

### T-1 Day: Final Reminder

**Channel**: Email, Slack/Discord

**Message**:
```
Reminder: /refine launches tomorrow!

Quick checklist:
☐ Read migration guide: [link]
☐ Update your workflows to use /refine
☐ Report issues: [link]

Thanks for your patience!
```

### T-0: Launch Day

**Channel**: Changelog, GitHub Release, Email

**Message**:
```markdown
## v1.0 Released: /refine Command Available

The `/refine` command is now live!

**What's New**:
- `/refine TASK-XXX` replaces `/set-up TASK-XXX`
- Same functionality, clearer naming
- `/set-up` still works (shows deprecation warning)

**Migration Guide**: [link]

**Report Issues**: [link]
```

### T+1 Day: Check-In

**Channel**: Email, Slack/Discord

**Message**:
```
How's the migration going?

If you're experiencing issues with /refine, please report them:
- [GitHub Issues]
- [Support channel]

We're monitoring adoption and will address problems quickly.
```

### T+7 Days: Adoption Review

**Internal**: Check metrics
- % of commands using `/refine` vs `/set-up`
- Error rates
- Support tickets
- User feedback

**Decision**:
- If adoption < 50%: Extend timeline, investigate issues
- If adoption 50-80%: Continue as planned
- If adoption > 80%: Accelerate deprecation

### T+30 Days: Post-Mortem

**Channel**: Blog post, GitHub Discussion

**Message**:
```markdown
## Migration Retrospective: /set-up → /refine

**Results**:
- Adoption rate: 85% after 4 weeks
- User satisfaction: +0.4 (8.2 → 8.6/10)
- Support tickets: -20% (clearer naming reduced confusion)

**Lessons Learned**:
- Early communication (2 weeks) gave users time to prepare
- Alias approach (both commands work) reduced friction
- Migration guide with examples was heavily used

**What's Next**:
- Week 8: Deprecate /set-up (if adoption > 90%)
- Version 2.0: [future plans]

**Feedback**:
- What went well? What could be better?
- Discussion: [link]
```

## Deprecation Warnings

### In-Command Warning

When user runs deprecated command:
```bash
$ /set-up TASK-001

⚠ Warning: /set-up is deprecated and will be removed in v1.1 (Week 8)
           Use /refine instead: /refine TASK-001

Continuing with /set-up for now...
```

### Documentation Warning

In CLAUDE.md:
```markdown
## Commands

### /refine TASK-XXX
Comprehensive implementation plan before coding.

**Formerly**: `/set-up` (deprecated in v1.0, removed in v1.1)
```

## FAQ Template

```markdown
## Migration FAQ

### Q: Why rename?
A: "Refinement" is the official Scrum term for task preparation. It's clearer and aligns with agile conventions.

### Q: Do I have to migrate immediately?
A: No. Both commands work for 6 weeks. Migrate when convenient.

### Q: What if I encounter issues?
A: Use /set-up temporarily and report the issue: [link]

### Q: Will my old task files break?
A: No. All existing data works with /refine.

### Q: Can I use both commands?
A: Yes, during the transition period (6 weeks). After that, only /refine.

### Q: What about scripts/automation?
A: Update them to use /refine. Test in dev environment first.
```

## Rollback Communication

If migration must be rolled back:

**Channel**: Email, GitHub, Slack (immediate)

**Message**:
```
⚠ ROLLBACK: /refine temporarily disabled

We've identified an issue with the /refine command and are rolling back to /set-up while we investigate.

**What to do**:
- Use /set-up for now
- If you encounter errors, report them: [link]

**Status updates**: [link to status page]

We apologize for the inconvenience and will update you within 24 hours.
```

## Sources

- [Migration Preparation Checklist (Microsoft)](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/migrate/prepare/)
- [API Deprecation Best Practices (Stripe)](https://stripe.com/blog/api-versioning)
- [Communicating Change (Atlassian)](https://www.atlassian.com/team-playbook/plays/change-communication)
