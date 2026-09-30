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
