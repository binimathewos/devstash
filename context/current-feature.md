# Current Feature

<!-- Feature name and short description -->

## Status

<!-- Not Started | In Progress | Completed -->

## Goals

<!-- Goals and requirments -->

## Notes

<!-- Any extera notes -->

## History

<!-- Keep this updated. Earliest to latest -->

- 2026-06-01 — Initial Next.js 16 + React 19 + Tailwind CSS v4 project scaffold (Create Next App). Removed default starter SVGs, updated `globals.css`, `layout.tsx`, and `page.tsx`. Added project context docs (`CLAUDE.md`, `context/`). Committed as `chore: initial next.js and tailwind setup` and pushed to `origin/main` (github.com/binimathewos/devstash).
- 2026-06-03 — Dashboard UI Phase 1 (of 3) completed on branch `feature/dashboard-phase-1`. Initialized ShadCN (base-nova, neutral, lucide) — added `components.json`, `src/lib/utils.ts`, `button` + `input` UI components, and theme tokens in `globals.css`. Enabled dark mode by default and updated metadata in `layout.tsx`. Added `/dashboard` route with a top bar + placeholder sidebar/main layout (`src/app/dashboard/`). Built display-only `TopBar` (`src/components/dashboard/TopBar.tsx`) with centered search, DevStash logo/label on the left, and "New Collection" + "New Item" buttons on the right. `npm run build` passes.
- 2026-06-03 — Dashboard UI Phase 2 (of 3) completed on branch `feature/dashboard-phase-2`. Built the collapsible sidebar: `Sidebar` (`src/components/dashboard/Sidebar.tsx`) with collapsible Types and Collections sections, item types linking to `/items/[type]` with colored lucide icons + counts, Favorites and Recent collection subsections, and a user avatar/settings area at the bottom. Added `DashboardShell` (`src/components/dashboard/DashboardShell.tsx`) owning sidebar open state — inline collapse to an icon-only rail (item-type icons only) on desktop and an overlay drawer on mobile (breakpoint derived via `useSyncExternalStore`). Added a `PanelLeft` drawer toggle to `TopBar` and switched `dashboard/layout.tsx` to render `DashboardShell`. Added a `color` field to `ItemType` in `src/lib/mock-data.ts` (Tailwind text-color classes) to color the type icons. `npm run lint` and `npm run build` pass.
- 2026-06-03 — Dashboard UI Phase 3 (of 3) completed on branch `feature/dashboard-phase-3`. Built the SSR main content area in `src/app/dashboard/page.tsx` (server component, imports mock data directly): a Dashboard header, 4 stats cards (`StatsCards.tsx` — total items, collections, favorite items, favorite collections; not in screenshot), a Collections grid with "View all" (`CollectionCard.tsx`, showing favorite star, item count, description, and type-icon badges derived from the collection's items), a Pinned section, and a Recent Items list (sorted by `createdAt` desc, capped at 10) — both lists rendered via a shared `ItemRow.tsx`. Extracted the lucide icon-name map + `typeSlug` into `src/lib/type-icons.ts` and refactored `Sidebar.tsx` to use it (removed the duplicate). Added `formatShortDate` to `src/lib/utils.ts`. `npm run lint` and `npm run build` pass.
