# Example: Admin Portal User Journeys

This example documents the admin portal journeys for all roles. These journeys were designed BEFORE implementation and used to guide E2E test creation.

---

## User Journey: SUPERADMIN Admin Portal Access

### Overview
| Field | Value |
|-------|-------|
| Actor | SUPERADMIN |
| Entry Point | /dashboard |
| Goal | Access and manage all admin features |
| Success Metric | Can navigate all admin sections |

### Happy Path

| Step | User Action | System Response | Accessibility |
|------|-------------|-----------------|---------------|
| 1 | User logs in as SUPERADMIN | Redirects to /dashboard | Focus on main content |
| 2 | User clicks "Panel de Administración" | Shows /admin with sidebar | Focus on dashboard heading |
| 3 | User sees 6 stat cards | Displays: Usuarios, Estudiantes, Profesores, Empresas, Clientes, Cursos | Screen reader: "6 estadísticas" |
| 4 | User clicks "Usuarios" in sidebar | Shows /admin/users with table | Focus on table |
| 5 | User clicks "Nuevo" button | Opens create user dialog | Focus trapped in dialog |
| 6 | User presses Escape | Closes dialog | Focus returns to "Nuevo" |
| 7 | User clicks "Empresas" in sidebar | Shows /admin/companies | SUPERADMIN only sees this |
| 8 | User clicks "Salir" | Logs out, redirects to /login | Session cleared |

### Error States
- If session expires: Redirect to /login with "Sesión expirada" message
- If API fails: Show toast "Error al cargar datos"

### Exit Points
- **Logout**: /login
- **Stay in admin**: Navigate between sections

### E2E Test (Implemented)

```typescript
// tests/e2e/journeys/superadmin-journey.spec.ts
test('complete admin portal journey with real navigation', async ({ page }) => {
  // Step 1: Start at dashboard
  await page.goto('/dashboard')

  // Step 2: Click "Panel de Administración"
  await page.getByRole('link', { name: /panel de administraci[oó]n/i }).click()
  await expect(page).toHaveURL(/\/admin/)

  // Step 4: Navigate to Users
  await page.getByRole('link', { name: /usuarios/i }).click()
  await expect(page).toHaveURL(/\/admin\/users/)

  // Step 5-6: Open and close modal
  await page.getByRole('button', { name: /nuevo/i }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')

  // Step 7: Navigate to Companies (SUPERADMIN only)
  await page.getByRole('link', { name: /empresas/i }).click()
  await expect(page).toHaveURL(/\/admin\/companies/)
})
```

---

## User Journey: ADMIN Company-Scoped Portal Access

### Overview
| Field | Value |
|-------|-------|
| Actor | ADMIN |
| Entry Point | /dashboard |
| Goal | Manage company-specific data |
| Success Metric | Can only see company data, cannot see "Empresas" |

### Happy Path

| Step | User Action | System Response | Accessibility |
|------|-------------|-----------------|---------------|
| 1 | User logs in as ADMIN | Redirects to /dashboard | - |
| 2 | User clicks "Panel de Administración" | Shows /admin (no "Empresas" in sidebar) | Sidebar has 6 items, not 7 |
| 3 | User clicks "Usuarios" | Shows only company users | Table filtered by companyId |
| 4 | User sees NO "Nuevo" button | Cannot create users | Role-based UI |
| 5 | User clicks "Estudiantes" | Shows read-only student table | No edit/delete buttons |

### Error States (Access Control)
- If tries /admin/companies via URL: Redirects or shows empty
- If tries to delete ADMIN user: API returns 403

### Differences from SUPERADMIN
| Feature | SUPERADMIN | ADMIN |
|---------|------------|-------|
| Sidebar items | 7 | 6 (no Empresas) |
| Create users | Yes | No |
| See all companies | Yes | No |
| Delete admins | No (except self) | No |

### E2E Test (Implemented)

```typescript
// tests/e2e/journeys/admin-journey.spec.ts
test('should NOT see Companies menu item (only 6 items)', async ({ page }) => {
  await page.goto('/admin')
  await expect(page.getByRole('link', { name: /empresas/i })).not.toBeVisible()
})

test('should be blocked from accessing /admin/companies', async ({ page }) => {
  await page.goto('/admin/companies')
  // Either redirects or shows empty/error
  const url = page.url()
  // Verify they can't access company data
})
```

---

## User Journey: STUDENT Access Denied to Admin

### Overview
| Field | Value |
|-------|-------|
| Actor | STUDENT |
| Entry Point | /dashboard |
| Goal | Learn (NOT access admin) |
| Success Metric | Cannot access /admin |

### Happy Path (Non-Admin)

| Step | User Action | System Response | Accessibility |
|------|-------------|-----------------|---------------|
| 1 | User logs in as STUDENT | Redirects to /dashboard | - |
| 2 | Dashboard shows "Tu cuenta" with role "Estudiante" | Role displayed in card | - |
| 3 | NO "Panel de Administración" button visible | Button not rendered | - |

### Security Test: URL Tampering

| Step | User Action | System Response |
|------|-------------|-----------------|
| 1 | User types /admin in URL | Redirects to /dashboard |
| 2 | User types /admin/users | Redirects to /dashboard |

### E2E Test (Implemented)

```typescript
// tests/e2e/journeys/student-journey.spec.ts
test('should NOT see admin portal button', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(
    page.getByRole('link', { name: /panel de administraci[oó]n/i })
  ).not.toBeVisible()
})

test('should be blocked from accessing /admin', async ({ page }) => {
  await page.goto('/admin')
  await expect(page).not.toHaveURL(/\/admin/)
})
```

---

## User Journey: CUSTOMER Portal Access

### Overview
| Field | Value |
|-------|-------|
| Actor | CUSTOMER |
| Entry Point | /login |
| Goal | Access company management portal |
| Success Metric | Lands on /customer-portal, not /dashboard |

### Happy Path

| Step | User Action | System Response | Accessibility |
|------|-------------|-----------------|---------------|
| 1 | User logs in as CUSTOMER | Redirects to /customer-portal (not /dashboard) | - |
| 2 | User sees "Portal de Cliente" | Welcome page with company features | - |
| 3 | NO admin button visible | - | - |

### Security Test

| Step | User Action | System Response |
|------|-------------|-----------------|
| 1 | User types /admin | Redirects to /customer-portal |
| 2 | User types /dashboard | Stays on /customer-portal or redirects |

### E2E Test (Implemented)

```typescript
// tests/e2e/journeys/customer-journey.spec.ts
test('should be authenticated and on customer portal', async ({ page }) => {
  await page.goto('/customer-portal')
  await expect(page).toHaveURL(/\/customer-portal/)
  await expect(page.getByText(/portal de cliente/i)).toBeVisible()
})
```

---

## Journey Design Process Summary

### 1. Define Roles First
Before designing journeys, list all roles and their expected capabilities:
- SUPERADMIN: Global access
- ADMIN: Company-scoped
- STUDENT: Learning features only
- TEACHER: Teaching features only
- CUSTOMER: Company portal only

### 2. Design Happy Paths
For each role, document step-by-step navigation using clicks, not URLs.

### 3. Add Error/Security Tests
Document what happens when users try to access unauthorized content.

### 4. Write E2E Tests from Journeys
The journey documentation becomes the test specification.

### 5. Implement Based on Tests
Code is written to make the tests pass (TDD).
