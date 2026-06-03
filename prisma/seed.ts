import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

// Prisma 7: seeding is explicit. Run with `npm run db:seed` (→ `prisma db seed`),
// which is wired to `tsx prisma/seed.ts` via prisma.config.ts.
// This seed is idempotent (upserts on stable ids) so it is safe to re-run.

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEMO_USER = {
  id: "user_demo",
  name: "Demo User",
  email: "demo@devstash.io",
  password: "12345678",
  isPro: false,
};

// The 7 built-in system item types. isSystem = true, no owner (userId null).
// Icons are Lucide React component names; colors are hex values.
const SYSTEM_TYPES = [
  { id: "type_snippet", name: "snippet", icon: "Code", color: "#3b82f6" },
  { id: "type_prompt", name: "prompt", icon: "Sparkles", color: "#8b5cf6" },
  { id: "type_command", name: "command", icon: "Terminal", color: "#f97316" },
  { id: "type_note", name: "note", icon: "StickyNote", color: "#fde047" },
  { id: "type_file", name: "file", icon: "File", color: "#6b7280" },
  { id: "type_image", name: "image", icon: "Image", color: "#ec4899" },
  { id: "type_link", name: "link", icon: "Link", color: "#10b981" },
];

const COLLECTIONS = [
  { id: "col_react", name: "React Patterns", description: "Reusable React patterns and hooks", isFavorite: true },
  { id: "col_ai", name: "AI Workflows", description: "AI prompts and workflow automations", isFavorite: true },
  { id: "col_devops", name: "DevOps", description: "Infrastructure and deployment resources", isFavorite: false },
  { id: "col_terminal", name: "Terminal Commands", description: "Useful shell commands for everyday development", isFavorite: false },
  { id: "col_design", name: "Design Resources", description: "UI/UX resources and references", isFavorite: false },
];

interface SeedItem {
  id: string;
  title: string;
  description: string;
  typeId: string;
  collectionId: string;
  content?: string;
  url?: string;
  language?: string;
  tags: string[];
  isFavorite?: boolean;
  isPinned?: boolean;
  createdAt: string;
}

const ITEMS: SeedItem[] = [
  // ── React Patterns: 3 TypeScript snippets ──────────────────────
  {
    id: "item_use_debounce",
    title: "useDebounce Hook",
    description: "Debounce a rapidly changing value (e.g. a search input)",
    typeId: "type_snippet",
    collectionId: "col_react",
    language: "typescript",
    tags: ["react", "hooks", "typescript"],
    isFavorite: true,
    isPinned: true,
    createdAt: "2026-05-20",
    content: `import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}`,
  },
  {
    id: "item_theme_context",
    title: "Theme Context Provider",
    description: "Typed context provider with a colocated consumer hook",
    typeId: "type_snippet",
    collectionId: "col_react",
    language: "typescript",
    tags: ["react", "context", "typescript"],
    isPinned: true,
    createdAt: "2026-05-18",
    content: `import { createContext, useContext, useState, type ReactNode } from "react";

type Theme = "light" | "dark";
const ThemeContext = createContext<{ theme: Theme; toggle: () => void } | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}`,
  },
  {
    id: "item_format_bytes",
    title: "formatBytes Utility",
    description: "Human-readable file size formatting",
    typeId: "type_snippet",
    collectionId: "col_react",
    language: "typescript",
    tags: ["typescript", "utility"],
    createdAt: "2026-05-15",
    content: `export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return \`\${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} \${sizes[i]}\`;
}`,
  },

  // ── AI Workflows: 3 prompts ────────────────────────────────────
  {
    id: "item_prompt_review",
    title: "Code Review Prompt",
    description: "Thorough, structured AI code review",
    typeId: "type_prompt",
    collectionId: "col_ai",
    tags: ["ai", "review", "prompt"],
    isFavorite: true,
    createdAt: "2026-05-12",
    content: `You are a senior engineer reviewing a pull request. Review the diff below and report:

1. Correctness bugs and edge cases (highest priority)
2. Security issues (auth, input validation, injection)
3. Performance concerns (N+1 queries, unnecessary work)
4. Readability and naming

For each finding give: file:line, severity (high/med/low), and a concrete fix.
Skip nitpicks unless they affect correctness. If the code is solid, say so.`,
  },
  {
    id: "item_prompt_docs",
    title: "Documentation Generation Prompt",
    description: "Generate reference docs from a code module",
    typeId: "type_prompt",
    collectionId: "col_ai",
    tags: ["ai", "docs", "prompt"],
    createdAt: "2026-05-10",
    content: `Generate developer documentation for the module below. Include:

- A one-paragraph overview of what it does and when to use it
- Each exported function: signature, parameters, return value, and a usage example
- Any gotchas or side effects

Write in clear Markdown. Keep examples runnable and minimal.`,
  },
  {
    id: "item_prompt_refactor",
    title: "Refactoring Assistance Prompt",
    description: "Safe, incremental refactoring guidance",
    typeId: "type_prompt",
    collectionId: "col_ai",
    tags: ["ai", "refactor", "prompt"],
    createdAt: "2026-05-08",
    content: `Refactor the following code for clarity and maintainability without changing behavior.

Constraints:
- Preserve the public API and all existing behavior
- Make small, reviewable changes; explain each one briefly
- Prefer pure functions and early returns
- Do not introduce new dependencies

Return the refactored code followed by a short bullet list of what changed and why.`,
  },

  // ── DevOps: 1 snippet + 1 command + 2 links ────────────────────
  {
    id: "item_dockerfile",
    title: "Multi-stage Node Dockerfile",
    description: "Production Dockerfile for a Node app with a slim runtime stage",
    typeId: "type_snippet",
    collectionId: "col_devops",
    language: "dockerfile",
    tags: ["docker", "node", "ci"],
    createdAt: "2026-05-06",
    content: `# syntax=docker/dockerfile:1
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "start"]`,
  },
  {
    id: "item_deploy_script",
    title: "Vercel Production Deploy",
    description: "Build and deploy the current branch to production",
    typeId: "type_command",
    collectionId: "col_devops",
    language: "bash",
    tags: ["deploy", "vercel", "ci"],
    createdAt: "2026-05-05",
    content: `vercel pull --yes --environment=production \\
  && vercel build --prod \\
  && vercel deploy --prebuilt --prod`,
  },
  {
    id: "item_link_docker_docs",
    title: "Docker Documentation",
    description: "Official Docker reference and guides",
    typeId: "type_link",
    collectionId: "col_devops",
    url: "https://docs.docker.com/",
    tags: ["docker", "docs"],
    createdAt: "2026-05-04",
  },
  {
    id: "item_link_gh_actions",
    title: "GitHub Actions Documentation",
    description: "Workflow syntax and CI/CD reference",
    typeId: "type_link",
    collectionId: "col_devops",
    url: "https://docs.github.com/en/actions",
    tags: ["ci", "github", "docs"],
    createdAt: "2026-05-03",
  },

  // ── Terminal Commands: 4 commands ──────────────────────────────
  {
    id: "item_cmd_git",
    title: "Undo Last Commit (keep changes)",
    description: "Soft reset to undo the last commit but keep staged changes",
    typeId: "type_command",
    collectionId: "col_terminal",
    language: "bash",
    tags: ["git", "cli"],
    createdAt: "2026-05-02",
    content: `git reset --soft HEAD~1`,
  },
  {
    id: "item_cmd_docker",
    title: "Prune Unused Docker Resources",
    description: "Reclaim disk by removing stopped containers, networks and dangling images",
    typeId: "type_command",
    collectionId: "col_terminal",
    language: "bash",
    tags: ["docker", "cli"],
    createdAt: "2026-05-01",
    content: `docker system prune -a --volumes`,
  },
  {
    id: "item_cmd_process",
    title: "Kill Process on a Port",
    description: "Find and kill the process listening on a given port",
    typeId: "type_command",
    collectionId: "col_terminal",
    language: "bash",
    tags: ["process", "cli"],
    createdAt: "2026-04-29",
    content: `lsof -ti :3000 | xargs kill -9`,
  },
  {
    id: "item_cmd_npm",
    title: "List Outdated Packages",
    description: "Show dependencies with newer versions available",
    typeId: "type_command",
    collectionId: "col_terminal",
    language: "bash",
    tags: ["npm", "cli"],
    createdAt: "2026-04-28",
    content: `npm outdated`,
  },

  // ── Design Resources: 4 links ──────────────────────────────────
  {
    id: "item_link_tailwind",
    title: "Tailwind CSS Documentation",
    description: "Utility-first CSS framework reference",
    typeId: "type_link",
    collectionId: "col_design",
    url: "https://tailwindcss.com/docs",
    tags: ["css", "tailwind", "docs"],
    createdAt: "2026-04-27",
  },
  {
    id: "item_link_shadcn",
    title: "shadcn/ui",
    description: "Accessible component library built on Radix and Tailwind",
    typeId: "type_link",
    collectionId: "col_design",
    url: "https://ui.shadcn.com",
    tags: ["components", "ui"],
    createdAt: "2026-04-26",
  },
  {
    id: "item_link_material",
    title: "Material Design 3",
    description: "Google's open-source design system",
    typeId: "type_link",
    collectionId: "col_design",
    url: "https://m3.material.io",
    tags: ["design-system", "ui"],
    createdAt: "2026-04-25",
  },
  {
    id: "item_link_lucide",
    title: "Lucide Icons",
    description: "Open-source icon library used across DevStash",
    typeId: "type_link",
    collectionId: "col_design",
    url: "https://lucide.dev/icons",
    tags: ["icons", "ui"],
    createdAt: "2026-04-24",
  },
];

async function main() {
  // System item types — available to every user, no owner.
  for (const t of SYSTEM_TYPES) {
    await prisma.itemType.upsert({
      where: { id: t.id },
      update: { name: t.name, icon: t.icon, color: t.color, isSystem: true },
      create: { ...t, isSystem: true },
    });
  }
  console.log(`Seeded ${SYSTEM_TYPES.length} system item types`);

  // Demo development user with a hashed password (bcryptjs, 12 rounds).
  const passwordHash = await bcrypt.hash(DEMO_USER.password, 12);
  const user = await prisma.user.upsert({
    where: { email: DEMO_USER.email },
    update: { name: DEMO_USER.name, password: passwordHash, isPro: DEMO_USER.isPro, emailVerified: new Date() },
    create: {
      id: DEMO_USER.id,
      name: DEMO_USER.name,
      email: DEMO_USER.email,
      password: passwordHash,
      isPro: DEMO_USER.isPro,
      emailVerified: new Date(),
    },
  });
  console.log(`Seeded demo user ${user.email}`);

  // Collections owned by the demo user.
  for (const c of COLLECTIONS) {
    await prisma.collection.upsert({
      where: { id: c.id },
      update: { name: c.name, description: c.description, isFavorite: c.isFavorite },
      create: { ...c, userId: user.id },
    });
  }
  console.log(`Seeded ${COLLECTIONS.length} collections`);

  // Items + their tags. Links carry a `url`; everything else carries `content`.
  for (const item of ITEMS) {
    const { tags, createdAt, content, url, ...rest } = item;
    const contentType = item.typeId === "type_link" || item.typeId === "type_file" ? "file" : "text";
    const data = {
      ...rest,
      content: content ?? null,
      url: url ?? null,
      contentType,
      isFavorite: item.isFavorite ?? false,
      isPinned: item.isPinned ?? false,
      language: item.language ?? null,
    };

    await prisma.item.upsert({
      where: { id: item.id },
      update: data,
      create: { ...data, createdAt: new Date(createdAt), userId: user.id },
    });

    for (const name of tags) {
      const tag = await prisma.tag.upsert({
        where: { userId_name: { userId: user.id, name } },
        update: {},
        create: { name, userId: user.id },
      });
      await prisma.itemTag.upsert({
        where: { itemId_tagId: { itemId: item.id, tagId: tag.id } },
        update: {},
        create: { itemId: item.id, tagId: tag.id },
      });
    }
  }
  console.log(`Seeded ${ITEMS.length} items with tags`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
