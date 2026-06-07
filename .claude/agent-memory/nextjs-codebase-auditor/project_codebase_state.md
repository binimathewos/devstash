---
name: project-codebase-state
description: Confirmed codebase conventions, patterns, and false-positive triggers for the DevStash project
metadata:
  type: project
---

Auth is intentionally NOT wired up yet. All DB queries are scoped to `demo@devstash.io` as a documented placeholder (in `src/lib/db/items.ts` and `src/lib/db/collections.ts`). Do NOT flag this as a security issue.

**Confirmed false positives:**
- `.env*` is gitignored (line 34 of `.gitignore`). Never flag `.env` as exposed.
- No `tailwind.config.*` is intentional — project uses Tailwind v4 CSS-based config via `@theme` in `src/app/globals.css`.
- `src/generated/prisma` is gitignored (line 38 of `.gitignore`).

**Established conventions:**
- Error handling: `{ success, data, error }` pattern from Server Actions (defined in coding-standards; no Server Actions exist yet)
- DB helpers: `src/lib/db/collections.ts` and `src/lib/db/items.ts`
- Types inline with their query files (e.g., `DashboardItem`, `SidebarItemType`)
- Inline `style` for dynamic hex colors from DB (correct pattern — can't use static Tailwind classes for DB-driven colors)
- `DashboardShell` is `'use client'` because it owns sidebar open state; `Sidebar` is `'use client'` for collapsible sections

**Real issues found (first full audit, 2026-06-04):**
- N+1 in `getSidebarCollections`: fetches all items for each collection to compute accent color, no `take` limit
- `getDashboardCollections` fetches ALL items per collection (no field limit on items side) — scales poorly
- `prisma.ts` does NOT check `connectionString` for undefined before passing to adapter
- Seed has plaintext password `"12345678"` in the `DEMO_USER` constant (dev-only file, not a prod secret)
- `CollectionCard.tsx` uses array index as React key for `typeBadges.map` (unstable key)
- `Sidebar.tsx` imports `currentUser` from mock-data — not a bug yet (auth not wired), but it's the last mock-data consumer
- `recentCollections` in Sidebar is actually all non-favorite collections, not "recently accessed" — potential UX confusion but not a code bug

**Features implemented:** Dashboard UI (phases 1-3), Prisma + Neon setup, seed data, live DB queries for dashboard collections/items/sidebar. No Server Actions, no CRUD, no auth yet.
