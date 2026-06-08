# Item Types

DevStash ships with 7 built-in **system** item types (`ItemType.isSystem = true`, `userId = null`, owned by no one — Pro users can additionally define custom types). Each type is a row in the `ItemType` table with a stable id, a Lucide icon name, and a hex color used to tint that icon wherever it's displayed (sidebar, collection badges, item rows).

> Source of truth for the seeded values is `prisma/seed.ts` (`SYSTEM_TYPES`); `src/lib/mock-data.ts` still holds an older parallel list (plural display names + Tailwind color **classes** like `text-blue-500` instead of hex) that predates the DB-backed sidebar/dashboard work and is now unused by the live data path — only its `currentUser` mock remains in active use.

## The 7 types

| Type | DB id | DB `name` | Icon (Lucide) | Hex color | `contentType` | Purpose | Key fields used |
|---|---|---|---|---|---|---|---|
| **Snippet** | `type_snippet` | `snippet` | `Code` | `#3b82f6` (blue) | `text` | Reusable code snippets (functions, hooks, utilities, config files like Dockerfiles) | `content` (the code), `language` (syntax highlighting, e.g. `typescript`, `dockerfile`), `title`, `description`, `tags` |
| **Prompt** | `type_prompt` | `prompt` | `Sparkles` | `#8b5cf6` (purple) | `text` | AI prompts and reusable instruction templates (code review, docs generation, refactoring) | `content` (the prompt text), `title`, `description`, `tags` — no `language` |
| **Command** | `type_command` | `command` | `Terminal` | `#f97316` (orange) | `text` | Shell / CLI commands worth remembering (git, docker, deployment one-liners) | `content` (the command), `language` (almost always `bash`), `title`, `description`, `tags` |
| **Note** | `type_note` | `note` | `StickyNote` | `#fde047` (yellow) | `text` | Free-form text notes / markdown (e.g. project context files for AI tools) | `content` (markdown body), `title`, `description`, `tags` — no `language` |
| **File** | `type_file` | `file` | `File` | `#6b7280` (gray) | `file` | Uploaded documents/templates (Pro feature — file uploads); shows a "PRO" badge in the sidebar | `fileUrl`, `fileName`, `fileSize`, `title`, `description`, `tags` — `content`/`url` are null |
| **Image** | `type_image` | `image` | `Image` | `#ec4899` (pink) | `file` | Uploaded images (Pro feature — file uploads); shows a "PRO" badge in the sidebar | `fileUrl`, `fileName`, `fileSize`, `title`, `description`, `tags` — `content`/`url` are null |
| **Link / URL** | `type_link` | `link` | `Link` (aliased `LinkIcon`) | `#10b981` (green) | `file`* | Bookmarked URLs (docs, references, design resources) | `url`, `title`, `description`, `tags` — `content`/`fileUrl` are null |

\* **Note on Link's `contentType`:** the seed assigns `contentType: "file"` to links (`item.typeId === "type_link" || item.typeId === "type_link"` branch in `prisma/seed.ts:369`), even though links carry a `url` rather than a file. This was flagged as a discrepancy during the "Quick Wins — Code Scan Cleanup" pass and deliberately deferred — conceptually a link is its own classification (`text` / `file` / `url`), but the schema's `contentType` comment only documents `text | file`.

## Text vs. File vs. URL classification

The `Item` model (`prisma/schema.prisma:85-116`) is a single polymorphic table whose `contentType` field (`"text" | "file"`, per the inline schema comment) plus a set of nullable columns determine how an item is rendered and what it stores:

- **Text types** (`contentType: "text"`) — **Snippet, Prompt, Command, Note**
  Store their payload in `content` (a `String?`). Snippets and Commands additionally use `language` to drive syntax highlighting; Prompts and Notes leave it null. `fileUrl`/`fileName`/`fileSize`/`url` are all null.

- **File types** (`contentType: "file"`) — **File, Image**
  Store their payload via `fileUrl` + `fileName` + `fileSize` (Cloudflare R2-backed uploads, per the project's tech stack). `content`/`url`/`language` are null. Both are gated as **Pro** features — the sidebar renders a "PRO" badge next to these two type rows (`Sidebar.tsx`, `PRO_TYPES = new Set(["file", "image"])`).

- **URL type** — **Link**
  Stores its payload in `url` (a `String?`), distinct in spirit from both text and file items, but currently mis-tagged as `contentType: "file"` in the seed (see note above — likely should be its own `"url"` classification, or `url` should simply be checked independently of `contentType`).

## Shared properties

Every item — regardless of type — carries the same base fields from the `Item` model:

- `id`, `title`, `description` (optional), `isFavorite`, `isPinned`
- `userId` (owner) and `typeId` (which of the 7 system types, or a custom Pro type, it belongs to)
- an optional `collectionId` (items can exist outside any collection)
- `tags` (many-to-many via `ItemTag` → `Tag`)
- `createdAt` / `updatedAt`

The dashboard's shared `DashboardItem` shape (`src/lib/db/items.ts`) flattens this down to what the Pinned/Recent lists need: `id`, `title`, `description`, `tags`, `isFavorite`, `isPinned`, `createdAt`, plus the **type's** `icon` (Lucide name) and `color` (hex) — so every row can render its type badge without a second query.

## Display differences

- **Icon + color tinting**: every list/grid surface (sidebar type list, `CollectionCard` type badges, `ItemRow` type icon) resolves the type's Lucide icon name through `typeIcon()` in `src/lib/type-icons.ts` (falls back to the generic `File` icon for unknown names) and applies the type's hex color via inline `style={{ color }}` — DB-sourced hex values can't be expressed as static Tailwind classes, which is why inline styles are used instead of color utility classes.
- **Route slugs**: `typeSlug()` lowercases the DB `name` (already singular/lowercase, e.g. `snippet`) to build `/items/[type]` links from the sidebar.
- **Pro gating**: File and Image are the only two types visually marked as Pro-only (a small outlined "PRO" badge in the expanded sidebar), reflecting the monetization plan (free tier = no file uploads).
- **Content rendering** (planned, not yet built — no `/items/detail/[id]` page exists yet despite `ItemRow` linking there): text types would render `content` with syntax highlighting when `language` is set (Snippet, Command) or as plain/markdown text when it's not (Prompt, Note); file types would render a download/preview backed by `fileUrl`/`fileName`/`fileSize`; the Link type would render/open the `url`.
- **Seeded examples**: Snippets carry `language` values like `typescript`/`dockerfile`; Commands carry `bash`; Prompts and Notes carry none — this lines up with the "Key fields used" column above and confirms `language` is meaningful only for code-shaped content.
