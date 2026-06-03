# Current Feature

Dashboard Collections — replace the dummy collection data in the dashboard main area with real data from the Neon database via Prisma.

## Status

In Progress

## Goals

- Create `src/lib/db/collections.ts` with data fetching functions
- Fetch collections directly in the server component (replace `src/lib/mock-data.ts` usage for collections)
- Keep the current design — 6 recent collection cards (reference `context/screenshots/dashboard-ui-main.png`)
- Collection card border color derived from the most-used content type in that collection
- Show small icons of all types present in that collection
- Update collection stats display
- Do NOT add the items underneath the cards yet (that comes later)

## Notes

- Spec: `context/features/dashboard-collections-spec.md`
- Scope is collections only — items list under collections is deferred.

## History

<!-- Keep this updated. Earliest to latest -->

- 2026-06-01 — Initial Next.js 16 + React 19 + Tailwind CSS v4 project scaffold (Create Next App). Removed default starter SVGs, updated `globals.css`, `layout.tsx`, and `page.tsx`. Added project context docs (`CLAUDE.md`, `context/`). Committed as `chore: initial next.js and tailwind setup` and pushed to `origin/main` (github.com/binimathewos/devstash).
- 2026-06-03 — Dashboard UI Phase 1 (of 3) completed on branch `feature/dashboard-phase-1`. Initialized ShadCN (base-nova, neutral, lucide) — added `components.json`, `src/lib/utils.ts`, `button` + `input` UI components, and theme tokens in `globals.css`. Enabled dark mode by default and updated metadata in `layout.tsx`. Added `/dashboard` route with a top bar + placeholder sidebar/main layout (`src/app/dashboard/`). Built display-only `TopBar` (`src/components/dashboard/TopBar.tsx`) with centered search, DevStash logo/label on the left, and "New Collection" + "New Item" buttons on the right. `npm run build` passes.
- 2026-06-03 — Dashboard UI Phase 2 (of 3) completed on branch `feature/dashboard-phase-2`. Built the collapsible sidebar: `Sidebar` (`src/components/dashboard/Sidebar.tsx`) with collapsible Types and Collections sections, item types linking to `/items/[type]` with colored lucide icons + counts, Favorites and Recent collection subsections, and a user avatar/settings area at the bottom. Added `DashboardShell` (`src/components/dashboard/DashboardShell.tsx`) owning sidebar open state — inline collapse to an icon-only rail (item-type icons only) on desktop and an overlay drawer on mobile (breakpoint derived via `useSyncExternalStore`). Added a `PanelLeft` drawer toggle to `TopBar` and switched `dashboard/layout.tsx` to render `DashboardShell`. Added a `color` field to `ItemType` in `src/lib/mock-data.ts` (Tailwind text-color classes) to color the type icons. `npm run lint` and `npm run build` pass.
- 2026-06-03 — Dashboard UI Phase 3 (of 3) completed on branch `feature/dashboard-phase-3`. Built the SSR main content area in `src/app/dashboard/page.tsx` (server component, imports mock data directly): a Dashboard header, 4 stats cards (`StatsCards.tsx` — total items, collections, favorite items, favorite collections; not in screenshot), a Collections grid with "View all" (`CollectionCard.tsx`, showing favorite star, item count, description, and type-icon badges derived from the collection's items), a Pinned section, and a Recent Items list (sorted by `createdAt` desc, capped at 10) — both lists rendered via a shared `ItemRow.tsx`. Extracted the lucide icon-name map + `typeSlug` into `src/lib/type-icons.ts` and refactored `Sidebar.tsx` to use it (removed the duplicate). Added `formatShortDate` to `src/lib/utils.ts`. `npm run lint` and `npm run build` pass.
- 2026-06-03 — Prisma + Neon PostgreSQL setup completed on branch `feature/prisma-neon-setup`. Installed Prisma 7.8.0 with the new `prisma-client` generator (mandatory `output` → `src/generated/prisma`, gitignored), root `prisma.config.ts` (loads `DATABASE_URL` via `dotenv`, configures `migrations.path` + `migrations.seed`), and the required `@prisma/adapter-pg` + `pg` driver adapter in `src/lib/prisma.ts` (Neon-compatible; `@prisma/adapter-neon` is the edge/serverless-driver alternative). Schema (`prisma/schema.prisma`) covers all domain models (User, Item, ItemType, Collection, Tag, ItemTag) + NextAuth (Account, Session, VerificationToken) with indexes and cascade/restrict/set-null referential actions. Created and applied the initial migration `20260603202929_init` against the Neon dev branch (migrations only — never `db push`). Added an idempotent seed (`prisma/seed.ts`, run via `prisma db seed`) for the 7 system item types + a demo user with sample collections/items/tags, and a DB connectivity test (`scripts/test-db.ts`). Added `db:migrate`, `db:deploy`, `db:status`, `db:seed`, `db:test`, `db:studio` scripts; `build` now runs `prisma generate` first. `npm run lint`, `npm run build`, `prisma validate`, seed (idempotent), and `db:test` all pass.
- 2026-06-03 — Seed Data completed on branch `feature/seed-data` (per `context/features/seed-spec.md`). Rewrote `prisma/seed.ts` to seed a demo user (`demo@devstash.io`, "Demo User", `isPro: false`, `emailVerified` set, password `12345678` hashed with `bcryptjs` @ 12 rounds — added `bcryptjs` + `@types/bcryptjs`), the 7 system item types with Lucide icon names + hex colors (`snippet/prompt/command/note/file/image/link`, ids `type_*`, `isSystem: true`), and 5 collections with 18 items: React Patterns (3 TS snippets), AI Workflows (3 prompts), DevOps (1 snippet + 1 command + 2 links), Terminal Commands (4 commands), Design Resources (4 links). Items carry `content` (text types) or `url` (links, with real URLs), `language`, and tags (26 total); seed stays idempotent via upserts on stable ids. Reset the Neon dev DB (`prisma migrate reset`, with explicit consent) to clear the prior demo seed before reseeding. `npm run lint`, `npm run build`, and a repeated `npm run db:seed` all pass; verified counts/relationships/password hash via an ad-hoc query.
