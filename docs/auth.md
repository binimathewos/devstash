```text
/speckit.specify Implement [FEATURE/PAGE NAME] in the new React + Vite + TypeScript application as a focused vertical slice.

CONTEXT
- The legacy ASP.NET application is available in this VS Code workspace and is READ-ONLY.
- The legacy [LEGACY PAGE NAME] page is the FUNCTIONAL SOURCE OF TRUTH.
- The existing React [REFERENCE PAGE NAME] page is the DESIGN & STYLING GUIDE.
- The new application is frontend-only and must reuse the SAME existing backend REST APIs/services.
- Do NOT create, modify, or assume new backend APIs or server behavior.
- A screenshot of the legacy page may also be provided as a functional/layout reference.

SOURCE OF TRUTH

1. FUNCTIONAL SOURCE OF TRUTH — Legacy ASP.NET
Use the legacy implementation to determine:
- Page behavior and workflows
- Business rules
- API calls
- Request/response contracts
- Validation
- Filters/search behavior
- Authentication/authorization
- Roles and permissions
- Server-side behavior
- Error handling
- Data transformations
- Navigation/redirect behavior

2. DESIGN & STYLING SOURCE — Existing React Reference Page
Use [REFERENCE PAGE NAME / ROUTE / COMPONENT] as the visual and UX design guide.

Match its existing:
- Page structure
- Header/title/subtitle treatment
- Content width and alignment
- Cards/stat cards
- Filters
- Data grid/table styling
- Buttons and controls
- Dropdown/action menus
- Dialogs
- Typography
- Spacing
- Borders/radius/shadows
- Loading indicators
- Empty/error states
- Responsive behavior
- Mobile patterns

Do NOT copy business logic, data fields, APIs, or feature behavior from the reference page unless they are also applicable to this feature.

The goal is:
Legacy behavior + existing backend APIs + new React design language.

LEGACY DISCOVERY
Before defining the feature, inspect the relevant legacy implementation end-to-end, including:
- View/Page
- Controllers/actions
- Services
- API/HTTP calls
- Models/DTOs
- Query parameters
- Filters/search
- Validation
- Business rules
- Authentication/authorization
- Roles/permissions
- Server-side processing
- Error handling
- Loading/empty behavior
- Navigation/redirects

Trace each IN-SCOPE operation through:

Legacy UI
→ Controller/Service
→ Existing API
→ Request/Response
→ Legacy UI behavior

Do not infer behavior when it can be verified from the legacy code.

VERTICAL SLICE
Implement only the requested feature as a complete working vertical slice:

Route/Page
→ UI
→ User interaction
→ Existing authenticated API client
→ Existing REST API
→ Response handling
→ Loading/Error/Empty states
→ Validation
→ Authorization
→ Tests

The completed slice must work against the real existing backend.

Do not leave permanent mock data when an existing API is available.

UI IMPLEMENTATION
- Use the React reference page as the primary styling/design guide.
- Use the legacy page/screenshot to understand what information and functionality must be represented.
- Preserve familiar labels, fields, filters, tables, and workflows where appropriate.
- Apply the newer React application's established design language.
- Minor UX improvements are allowed for spacing, readability, responsiveness, accessibility, and consistency.
- Reuse existing shared React components whenever practical.
- Do not reproduce obsolete ASP.NET-specific UI patterns.
- Keep the page responsive and consistent with the rest of the React application.

API & DATA
- Discover API usage from the legacy implementation before defining integration requirements.
- Reuse the exact existing backend APIs.
- Use the application's shared authenticated API client.
- Preserve existing request/response contracts.
- Preserve Bearer-token authentication and authorization behavior.
- Do not create feature-specific authentication/token handling.
- Do not create or modify backend endpoints.
- Do not invent API fields or server capabilities.

BEHAVIOR
Preserve verified legacy behavior for the functionality that is IN SCOPE, including:
- Business rules
- Validation
- Permissions
- Calculations
- Filtering/searching
- Sorting
- Data formatting
- Status behavior
- Role-based restrictions
- Error behavior

AUTHORIZATION
Respect the existing authentication and authorization model.

Do not treat hiding a button or menu item as authorization.

Use the existing application's authenticated API infrastructure and preserve backend-enforced permissions.

OUT OF SCOPE
The following functionality must NOT be implemented as part of this feature:

- Edit functionality
- Export functionality
- [ADD OTHER EXCLUSIONS HERE]

If Edit, Export, or another excluded feature exists in the legacy page:
- It may be examined only to understand surrounding behavior.
- Do NOT implement it.
- Do NOT create placeholder buttons/actions for it unless explicitly requested.
- Do NOT create API integration for it.
- Do NOT expand the specification to include it.
- Do NOT implement it merely because it appears in the legacy screenshot.

Keep the specification strictly focused on the requested vertical slice.

IMPLEMENTATION BOUNDARY
Only specify functionality required for this feature.

Reuse existing:
- App shell
- Authentication
- API client
- Shared UI components
- Design system
- Loading/error components
- Routing patterns

Do not:
- Refactor unrelated features.
- Modify the legacy ASP.NET application.
- Modify backend services.
- Add speculative functionality.
- Expand scope based solely on functionality visible in the legacy page.

CONFLICT RESOLUTION
If references conflict, use this priority:

1. Existing backend/API contracts — technical source of truth
2. Verified legacy business behavior — functional source of truth
3. Explicit requirements in this prompt — scope source of truth
4. Existing React reference page — design/styling source of truth
5. Legacy screenshot — visual/behavior reference

If a conflict cannot be resolved, document it as an open question instead of inventing behavior.

SPEC OUTPUT
The resulting specification must clearly document:

1. Feature scope
2. User scenarios
3. Acceptance criteria
4. Legacy behavior being preserved
5. Existing APIs used
6. Request/response/data requirements
7. Business and validation rules
8. Authentication/authorization requirements
9. UI requirements derived from the React reference page
10. Loading, empty, success, and error states
11. Responsive/mobile behavior
12. Vertical-slice boundaries
13. Explicit Out of Scope functionality
14. Unverified behavior/open questions

IMPORTANT
- Do NOT implement code during /speckit.specify.
- Do NOT modify the legacy application.
- Do NOT modify backend services.
- Do NOT invent APIs or business rules.
- Do NOT implement Edit.
- Do NOT implement Export.
- Do NOT implement functionality merely because it exists on the legacy page.
- Flag anything that cannot be verified.
```
