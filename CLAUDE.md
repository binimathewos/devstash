# DevStash

A developer knowledge hub for snippets, commands, prompts, notes, files, images, links and custom types.

## Context Files

Read the following to get the full context of the project:

- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interaction.md
- @context/current-feature.md

## Commands

- `npm run dev` — start the dev server (http://localhost:3000)
- `npm run build` — production build
- `npm start` — serve the production build
- `npm run lint` — run ESLint
- `npm test` — run unit tests (Vitest)
- `npm run test:watch` — run unit tests in watch mode

## Neon MCP Usage

When using the Neon MCP for this project, always operate on:

- **Project:** `devstash` (id: `falling-recipe-06575620`)
- **Branch:** `development` (id: `br-tiny-dawn-a61d9cvi`) — pass this `branchId` on every Neon MCP call

**NEVER touch the `production` branch** (id: `br-red-meadow-a6h1p8qx`, the default/primary branch) unless I explicitly name it in the request. Because production is the default branch, omitting `branchId` would hit it — so always pass the `development` branch id explicitly.

Never run destructive SQL (`DROP`, `DELETE`, `TRUNCATE`, `UPDATE`/`INSERT` without my say-so) on any branch without asking me first.
