# Item CRUD Architecture (Design)

**Status: not yet implemented.** No `src/actions/`, `/items/[type]` route, or item-detail page exists yet (`ItemRow` already links to `/items/detail/[id]`, which 404s today). This document proposes a unified architecture for create/read/update/delete across all 7 item types — Snippet, Prompt, Command, Note, File, Image, Link — built on the patterns already established by collections/profile/account (see `docs/item-types.md` for the full per-type field reference).

The core idea: **the `Item` model is one polymorphic table** (`contentType: "text" | "file"` + a handful of nullable columns — `content`, `url`, `fileUrl`/`fileName`/`fileSize`, `language`). CRUD operations don't need to branch on type — they operate on the same shared shape. Only **rendering and input collection** differ per type, so that's where the only type-specific branching should live.

## File structure

```
src/
  actions/
    items.ts                    # create, update, delete, + small toggles (favorite/pin)
  lib/
    db/
      items.ts                  # existing — extend with getItemsByType, getItemById
  app/
    items/
      [type]/
        page.tsx                # one dynamic route for all 7 (+ custom Pro) types
      detail/
        [id]/
          page.tsx              # view/edit a single item
  components/
    items/
      ItemGrid.tsx              # layout: list of ItemCard/ItemRow for /items/[type]
      ItemCard.tsx              # (or reuse/extend ItemRow) — type-aware summary
      ItemForm.tsx              # create/edit form shell — delegates fields by type
      ItemContentField.tsx      # the ONE type-branch: code/markdown/file/url input
      ItemContentView.tsx       # the other type-branch: read-only render by contentType
      DeleteItemDialog.tsx      # shared confirmation (mirrors DeleteAccount pattern)
```

This mirrors the existing split: **mutations live in one action file** (`src/actions/items.ts`, per `context/coding-standards.md` → `Server Actions: src/actions/[feature].ts`), **queries live in `lib/db`** and are called directly from server components (no action file in the read path — same as `getDashboardCollections`/`getRecentItems` today), and **type-specific behavior is pushed down into two small, focused components** rather than scattered across actions or routes.

## Mutations: `src/actions/items.ts` (one file, all types)

A single action file exporting generic, polymorphic Server Actions that don't know or care which of the 7 types they're touching:

- `createItem(input)` — validates + creates an `Item` row. Accepts the full union of optional fields (`content`, `url`, `fileUrl`/`fileName`/`fileSize`, `language`, `collectionId`, `tags`); whichever ones are relevant for the chosen `typeId` are populated, the rest stay `null`. `contentType` is derived server-side from the target `ItemType` (text vs. file vs. url — see the open question in `docs/item-types.md` about the Link/`contentType` mismatch, which this design should resolve by deriving it rather than hardcoding it in the seed).
- `updateItem(id, input)` — same shape, partial; re-derives `contentType` if `typeId` changes.
- `deleteItem(id)` — ownership-checked delete (matches `DELETE /api/account` pattern: `auth()` → check `userId` → `prisma.item.delete`).
- `toggleFavorite(id)` / `togglePinned(id)` — small one-field mutations for the star/pin affordances already rendered in `ItemRow`.

Every action:
- Re-checks the session (`auth()`) and ownership (`item.userId === session.user.id`) — never trusts a client-supplied `userId`.
- Validates input (per `coding-standards.md`, with Zod — note this would be the **first** Zod usage in the codebase; every prior feature used manual validation because Zod "is not yet a dependency." Introducing it here is reasonable given the larger, more varied input shape, but is a call worth flagging before adding the dependency).
- Returns the established `{ success, data?, error? }` shape and wraps logic in try/catch, exactly like `register`/`change-password`/`reset-password`.
- Calls `revalidatePath` for the affected `/items/[type]` and `/items/detail/[id]` routes (and `/dashboard` when favorite/pinned state changes, since it feeds the Pinned section).

Nothing in this file branches on `typeId` or `contentType` beyond the single "derive `contentType` from the target type" step — that keeps the mutation surface small and uniform.

## Queries: extend `src/lib/db/items.ts`

Following the existing `dashboardItemSelect` → `DashboardItem` → `toDashboardItem()` pattern (a shared Prisma `select`, a flattened DTO, a mapper), add:

- `getItemsByType(userId, typeId, { search?, sort? })` — items for the `/items/[type]` grid. Returns the full set of fields the card/list view needs (reuse or extend `dashboardItemSelect` — it already flattens `type.icon`/`type.color`/`tags`).
- `getItemById(userId, id)` — single item with **all** content fields (`content`, `url`, `fileUrl`, `fileName`, `fileSize`, `language`, `type`, `collection`, `tags`) for the detail/edit page. Returns `null` if not found or not owned, so the page can redirect/404 (mirrors `getProfileUser` returning `null` → redirect to `/sign-in`).
- `getItemTypeBySlug(name)` — resolves a route segment (`"snippet"`) to its `ItemType` row; needed by `/items/[type]/page.tsx` to look up `typeId`, label, icon, and color before querying items. Must consider **both system types and the current user's custom (Pro) types**, since `typeSlug()` is a generic lowercase-the-name transform that applies to either.

These stay plain async functions called directly from server components — no wrapper action, same as every other dashboard query today.

## How `/items/[type]` routing works

One dynamic segment route serves all 7 system types *and* any of a Pro user's custom types — there is no per-type page:

1. `src/app/items/[type]/page.tsx` is an async server component. It calls `requireUserId()` (existing helper, redirects to `/sign-in` if absent — same guard as `/dashboard` and `/profile`).
2. It resolves `params.type` (e.g. `"snippet"`) to an `ItemType` via `getItemTypeBySlug`. The slug is just the DB `name` lowercased (`typeSlug()` in `src/lib/type-icons.ts` already does this for the *outgoing* sidebar links — the route does the *inverse* lookup). If no matching type exists for this user (wrong slug, or someone else's custom type), render `notFound()`.
3. It fetches items via `getItemsByType(userId, type.id)` and stats/labels (icon, color, count) needed for the page header.
4. It renders a header (type icon + label + count, mirroring the sidebar's `typeLabel()`/`typeIcon()`/hex-color treatment) and an `ItemGrid` of `ItemCard`/`ItemRow` components — the same row component already used on the dashboard, so Pinned/Recent/`/items/[type]` all look consistent.
5. "New Item" (already a `TopBar` button, currently inert) would open `ItemForm` pre-selecting this type.

No route exists per type name — `/items/snippet`, `/items/prompt`, `/items/my-custom-type` all hit the same `page.tsx`; the only per-type variance is *data* (which `ItemType` row resolves) and *rendering* (handled inside the shared components below), never routing logic.

## Where type-specific logic lives — in components, not actions

Type-specific behavior is deliberately concentrated into exactly **two** small components, so the "what does this type look like" question has one obvious answer and mutations stay generic:

### `ItemContentField` (write path — inside `ItemForm`)
Branches on the target `ItemType`'s `contentType` (and, within `"text"`, on whether `language` is meaningful) to render the right input:
- **Snippet / Command** → code editor / textarea + a `language` select (syntax highlighting on save/preview)
- **Prompt / Note** → plain textarea or markdown editor (per `coding-standards.md` → "Markdown editor for text items"), no `language`
- **File / Image** → file upload control (Cloudflare R2 — populates `fileUrl`/`fileName`/`fileSize`; gated to Pro users, mirroring the sidebar's `PRO_TYPES` check)
- **Link** → a single URL input (+ validation), populates `url`

`ItemForm` itself stays generic: title, description, type picker, collection picker, tags — all shared fields rendered the same way regardless of type. It delegates only the "main content" portion to `ItemContentField`.

### `ItemContentView` (read path — inside the detail page)
The mirror image: branches on `contentType`/`language` to render `content` with syntax highlighting, `content` as markdown/plain text, a file preview/download from `fileUrl`, or a clickable `url` card with link metadata.

### Everything else stays type-agnostic
- `ItemRow`/`ItemCard` already render any item generically via `typeIcon(item.typeIcon)` + inline `style={{ color: item.typeColor }}` (see `src/lib/type-icons.ts` and `ItemRow.tsx:22-27`) — no changes needed to support new types, including future custom Pro types, since the icon/color come from the DB row, not a hardcoded switch.
- `ItemForm`'s shared fields, `DeleteItemDialog`, `ItemGrid`, and all of `src/actions/items.ts` operate purely on the common `Item` shape.

## Component responsibilities (summary)

| Component | Responsibility | Type-aware? |
|---|---|---|
| `ItemGrid` | Lays out a list/grid of items for `/items/[type]` | No |
| `ItemRow` / `ItemCard` | Renders one item's icon, title, badges, tags, date | No — driven entirely by `typeIcon`/`typeColor` from the DB |
| `ItemForm` | Shared fields (title, description, type, collection, tags) + submit/validation wiring | No (delegates) |
| `ItemContentField` | Renders the correct input(s) for the selected type's `contentType`/`language` | **Yes — the one write-side branch** |
| `ItemContentView` | Renders the correct read-only view for an item's `contentType`/`language` | **Yes — the one read-side branch** |
| `DeleteItemDialog` | Confirmation + calls `deleteItem` (mirrors `DeleteAccount.tsx`) | No |
| `src/actions/items.ts` | create/update/delete/toggle — generic, ownership-checked, `{success,data,error}` | No (only derives `contentType` from the target type) |
| `src/lib/db/items.ts` queries | Fetch items/types scoped to the user, shaped for the components above | No |

## Notes / open questions for implementation time

- **Zod**: this feature has the most varied input shape of anything built so far (7 type-dependent field combinations). It's the natural place to finally add Zod per `coding-standards.md`, but every prior auth feature deliberately used manual validation because Zod wasn't a dependency — confirm before introducing it.
- **`contentType` derivation**: `prisma/seed.ts` currently hardcodes `contentType: "file"` for Links (a known mismatch — see `docs/item-types.md`). `createItem`/`updateItem` should derive `contentType` from the target `ItemType` rather than perpetuate that, which effectively means deciding whether Link gets its own `"url"` classification or is folded into an existing one.
- **File uploads**: File/Image require Cloudflare R2 wiring (not yet present anywhere in the codebase) — likely an API route per `coding-standards.md`'s guidance ("Use API routes when you need: File uploads with progress tracking"), not a Server Action, feeding `fileUrl`/`fileName`/`fileSize` back into `createItem`/`updateItem`.
- **Custom (Pro) types**: `getItemTypeBySlug` and `/items/[type]` must handle user-owned custom types (`ItemType.userId != null`) alongside the 7 system types — the routing and components above are designed to need no changes for this, but the query layer must include both in its lookup `where` clause.
