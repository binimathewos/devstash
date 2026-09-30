/speckit.specify Create a focused Authentication & Authorization feature for the new React + Vite + TypeScript application by studying and preserving the existing flow from the legacy ASP.NET application.

Requirements:
- Treat the legacy ASP.NET application as read-only and the source of truth for authentication/authorization behavior.
- Analyze how the legacy app:
  - Authenticates users
  - Obtains and stores access/bearer tokens
  - Handles token expiration/refresh
  - Sends Bearer tokens to the existing REST APIs
  - Determines user identity, roles, and permissions
  - Protects routes/pages
  - Handles unauthorized/forbidden responses
  - Logs users out
- Implement the equivalent flow in React using the existing backend APIs; do NOT create or modify backend endpoints.
- Create a reusable authentication/session layer and centralized authenticated API client.
- Automatically attach `Authorization: Bearer <token>` to protected API requests.
- Implement protected routes and role/permission-based access.
- Handle 401/403, expired sessions, logout, loading, and authentication errors consistently.
- Do not copy legacy UI or ASP.NET-specific architecture; preserve behavior/contracts while using appropriate React patterns.
- Do not invent authentication behavior that cannot be verified from the legacy code. Document any gaps or ambiguities for clarification.
- Keep this spec limited to the authentication/authorization foundation; business feature screens will consume this foundation later.


```text
/speckit.specify Implement [FEATURE/PAGE NAME] in the new React + Vite + TypeScript application as a complete vertical slice.

CONTEXT
- The legacy ASP.NET application is available in this VS Code workspace and is READ-ONLY.
- The legacy application is the source of truth for existing behavior, business rules, API usage, validation, permissions, and data contracts.
- The new application is frontend-only and must reuse the SAME existing backend REST APIs/services.
- Do NOT create, modify, or assume new backend APIs or server behavior.
- A screenshot of the legacy page will be provided as the primary UI reference.

LEGACY DISCOVERY
Before defining the feature, inspect the relevant legacy implementation end-to-end, including:
- Page/View and UI behavior
- Controllers/actions
- Services
- API/HTTP calls
- Request/response models and DTOs
- Query parameters and filters
- Validation and business rules
- Authentication/authorization requirements
- Roles/permissions
- Error handling
- Loading/empty states
- Navigation and redirects
- Any server-side behavior required by the page

Trace each user operation through:

Legacy UI → Controller/Service → API → Request/Response → UI behavior

Do not infer behavior when it can be verified from the legacy code.

VERTICAL SLICE
Define this feature as a complete working vertical slice:

Route/Page
→ UI
→ User interactions
→ Existing authenticated API client
→ Existing REST API
→ Response handling
→ Loading/Error/Empty states
→ Validation
→ Authorization
→ Tests

Do not create a UI-only feature that depends permanently on mock data.

UI
- Use the provided legacy screenshot as the primary reference.
- Keep the new React page visually and functionally close to the legacy screen.
- Preserve familiar layout, fields, labels, actions, filters, tables, dialogs, and workflows where appropriate.
- Minor improvements are allowed for spacing, responsiveness, accessibility, consistency, and usability.
- Use existing React application shell, design system, components, patterns, and styling.
- Do not copy obsolete ASP.NET-specific UI implementation.
- Make the page responsive and mobile-friendly where appropriate.

API & DATA
- Reuse the exact existing backend APIs discovered from the legacy implementation.
- Use the application's shared authenticated API client.
- Preserve existing request/response contracts.
- Preserve Bearer-token authentication and authorization behavior.
- Do not duplicate API/authentication infrastructure inside the feature.
- Do not add backend logic to compensate for frontend implementation choices.

BEHAVIOR
Preserve verified legacy:
- Business rules
- Validation
- Permissions
- Calculations
- Status transitions
- CRUD behavior
- Filtering/sorting
- Error behavior
- Role-based restrictions

SECURITY
- Respect existing authentication and authorization.
- Do not rely only on hiding UI controls for authorization.
- Do not expose functionality the current user is not authorized to use.

IMPLEMENTATION BOUNDARY
Only implement what is necessary for this feature's vertical slice.
Reuse existing shared components/services where practical.
Do not refactor unrelated features.
Do not modify the legacy ASP.NET project.

If the screenshot, legacy UI, and legacy code appear inconsistent, treat verified backend behavior/business rules as authoritative and clearly document the discrepancy rather than inventing behavior.

SPEC OUTPUT
The resulting specification should clearly document:
1. User scenarios and acceptance criteria
2. Legacy behavior that must be preserved
3. Existing APIs used by the feature
4. Data/validation/business rules
5. Authentication/authorization requirements
6. UI behavior based on the screenshot
7. Loading, empty, success, and error states
8. Responsive behavior
9. Vertical-slice boundaries
10. Any legacy behavior that could not be verified

Do NOT implement code during /specify.
Do NOT modify the legacy application.
Do NOT invent missing API contracts or business rules.
Flag unresolved questions explicitly.

*************

Fix the User Directory grid UI and data binding:

- Replace the current Actions dropdown with a compact three-dot (⋯) menu in each row.
- Add appropriate icons to each action:
  - Activate
  - Deactivate
  - Reset Password
- Preserve the existing rules for which actions are available based on user status.
- Verify every grid column is correctly mapped to the actual API response.
- Fix any incorrect/missing bindings for First Name, Last Name, Username, Email, Phone, User Type, Status, and other displayed fields.
- Specifically investigate why Status currently shows "Deactivated" for all users; use the actual API value and legacy mapping/logic rather than a frontend default.
- Do not hardcode, infer, or provide fallback values that hide missing API data.
- Compare field mappings with the legacy implementation where necessary.
- Preserve existing grid styling, filtering, pagination, and API behavior.

