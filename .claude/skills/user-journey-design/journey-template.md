# Journey Template

Use this template to document user journeys BEFORE implementation.

## Minimal Journey Template

```markdown
## User Journey: [Feature Name]

**Actor**: [Role - e.g., STUDENT, ADMIN, SUPERADMIN]
**Entry Point**: [Starting page/state]
**Goal**: [What user wants to achieve]

### Happy Path
1. User is on [page]
2. User clicks [element] (accessible name)
3. System shows [response]
4. User fills [form field by label]
5. User clicks [submit button]
6. System [validates/saves/redirects]
7. User sees [confirmation/result]

### Error States
- If [validation fails]: Show [error message]
- If [network error]: Show [retry option]
- If [unauthorized]: Redirect to [page]

### Exit Points
- **Success**: [Where user ends up] with [feedback]
- **Cancel**: [Where user returns to]
```

## Full Journey Template

For complex features, use this expanded template:

```markdown
## User Journey: [Feature Name]

### Overview
| Field | Value |
|-------|-------|
| Actor(s) | [Roles that can perform this journey] |
| Entry Point | [Starting page/state/trigger] |
| Goal | [What user wants to accomplish] |
| Success Metric | [How we know user succeeded] |
| Related Journeys | [Links to related flows] |

### Preconditions
- User is authenticated as [role]
- User has [required data/permissions]
- System is in [required state]

### Happy Path (Step-by-Step)

| Step | User Action | System Response | Accessibility |
|------|-------------|-----------------|---------------|
| 1 | User is on [page] | Page shows [content] | Focus on [element] |
| 2 | User clicks [element] | [Response] | Keyboard: Tab + Enter |
| 3 | User fills [field by label] | [Validation feedback] | Error announced |
| 4 | User clicks [button] | [Loading state] | aria-busy=true |
| 5 | System completes | [Success feedback] | role="alert" |

### Error States

| Error Condition | User Sees | Recovery Action |
|-----------------|-----------|-----------------|
| Invalid [field] | "[Error message]" | Fix and retry |
| [Resource] not found | 404 page | Link to [fallback] |
| Network error | Toast/Alert | Retry button |
| Permission denied | 403 or redirect | Login or contact admin |

### Edge Cases

| Scenario | Handling |
|----------|----------|
| Empty state (no data) | Show [empty message] with [CTA] |
| Loading state | Show [skeleton/spinner] |
| Partial data | Show [available data] |
| Very long [content] | Truncate with [expand option] |

### Exit Points

| Exit Type | Destination | Feedback |
|-----------|-------------|----------|
| Success | [page/state] | [Toast/message] |
| Cancel | [previous page] | No feedback needed |
| Error (unrecoverable) | [error page] | [Error message] |
| Timeout | [retry page] | [Timeout message] |

### Accessibility Requirements

- [ ] All interactive elements keyboard accessible
- [ ] Focus management on step transitions
- [ ] Error messages associated with fields (aria-describedby)
- [ ] Loading states announced (aria-live)
- [ ] Color not sole indicator of state

### Test Scenarios (for E2E)

```typescript
test('[Feature] happy path', async ({ page }) => {
  // Step 1: Entry point
  await page.goto('[entry-url]')

  // Step 2: First action
  await page.getByRole('[role]', { name: /[accessible name]/i }).click()

  // Step 3: Form interaction
  await page.getByLabel(/[field label]/i).fill('[value]')

  // Step 4: Submit
  await page.getByRole('button', { name: /[button text]/i }).click()

  // Step 5: Verify success
  await expect(page).toHaveURL(/[success-url]/)
  await expect(page.getByText(/[success message]/i)).toBeVisible()
})
```
```

## Journey Map Checklist

Before considering a journey complete, verify:

### Actor & Context
- [ ] Role specified (STUDENT, ADMIN, etc.)
- [ ] Entry point clear (not just URL, but how user gets there)
- [ ] Goal defined (what user accomplishes)

### Happy Path
- [ ] Each step uses accessible names (not CSS selectors)
- [ ] System responses described
- [ ] Feedback visible at each step

### Error Handling
- [ ] Validation errors identified
- [ ] Network errors considered
- [ ] Permission errors handled
- [ ] Empty/no-data states addressed

### Accessibility
- [ ] Keyboard navigation path documented
- [ ] Screen reader considerations noted
- [ ] Focus management specified

### Exit Points
- [ ] Success destination clear
- [ ] Cancel behavior defined
- [ ] Error recovery paths exist

## Language Notes (Spanish UI)

When documenting journeys for Jargon LMS, use Spanish UI labels:

| English | Spanish |
|---------|---------|
| Login | Iniciar sesión |
| Logout | Cerrar sesión / Salir |
| Submit | Enviar / Guardar |
| Cancel | Cancelar |
| Save | Guardar |
| Delete | Eliminar |
| Edit | Editar |
| Create | Crear / Nuevo |
| Search | Buscar |
| Settings | Configuración |
| Profile | Perfil |
| Dashboard | Panel de control |
| Admin Panel | Panel de Administración |
