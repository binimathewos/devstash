import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

// Prisma 7: seeding is explicit. Run with `npm run db:seed` (→ `prisma db seed`),
// which is wired to `tsx prisma/seed.ts` via prisma.config.ts.
// This seed is idempotent (upserts on stable ids) so it is safe to re-run.

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// The 7 built-in system item types. isSystem = true, no owner (userId null).
const SYSTEM_TYPES = [
  { id: "type_snippet", name: "Snippets", icon: "Code", color: "text-blue-500" },
  { id: "type_prompt", name: "Prompts", icon: "Sparkles", color: "text-purple-500" },
  { id: "type_command", name: "Commands", icon: "Terminal", color: "text-amber-500" },
  { id: "type_note", name: "Notes", icon: "FileText", color: "text-yellow-500" },
  { id: "type_file", name: "Files", icon: "File", color: "text-gray-400" },
  { id: "type_image", name: "Images", icon: "Image", color: "text-green-500" },
  { id: "type_url", name: "Links", icon: "Link", color: "text-cyan-500" },
];

const COLLECTIONS = [
  { id: "col_react", name: "React Patterns", description: "Common React patterns and hooks", isFavorite: true },
  { id: "col_python", name: "Python Snippets", description: "Useful Python code snippets", isFavorite: false },
  { id: "col_context", name: "Context Files", description: "AI context files for projects", isFavorite: true },
  { id: "col_interview", name: "Interview Prep", description: "Technical interview preparation", isFavorite: false },
  { id: "col_git", name: "Git Commands", description: "Frequently used git commands", isFavorite: true },
  { id: "col_ai", name: "AI Prompts", description: "Curated AI prompts for coding", isFavorite: false },
];

const ITEMS = [
  { id: "item_useauth", title: "useAuth Hook", description: "Custom authentication hook for React applications", typeId: "type_snippet", collectionId: "col_react", tags: ["react", "auth", "hooks"], isFavorite: true, isPinned: true, language: "typescript", createdAt: "2026-01-15" },
  { id: "item_api_error", title: "API Error Handling Pattern", description: "Fetch wrapper with exponential backoff retry logic", typeId: "type_snippet", collectionId: "col_react", tags: ["typescript", "api", "fetch"], isFavorite: false, isPinned: true, language: "typescript", createdAt: "2026-01-12" },
  { id: "item_debounce", title: "Debounce Utility", description: "Generic debounce function for input handlers", typeId: "type_snippet", collectionId: "col_python", tags: ["javascript", "utility"], isFavorite: false, isPinned: false, language: "javascript", createdAt: "2026-01-10" },
  { id: "item_git_undo", title: "Undo Last Commit", description: "Soft reset to keep changes staged after undoing a commit", typeId: "type_command", collectionId: "col_git", tags: ["git", "cli"], isFavorite: false, isPinned: false, language: "bash", createdAt: "2026-01-08" },
  { id: "item_review_prompt", title: "Code Review Prompt", description: "Prompt for thorough AI-assisted code reviews", typeId: "type_prompt", collectionId: "col_ai", tags: ["ai", "review"], isFavorite: true, isPinned: false, language: null, createdAt: "2026-01-05" },
  { id: "item_ctx_overview", title: "Project Overview Template", description: "Reusable context file describing a project for AI tools", typeId: "type_note", collectionId: "col_context", tags: ["context", "ai"], isFavorite: false, isPinned: false, language: "markdown", createdAt: "2026-01-03" },
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

  // Demo development user (password handled later by the auth feature).
  const user = await prisma.user.upsert({
    where: { email: "john@devstash.io" },
    update: {},
    create: { id: "user_demo", name: "John Doe", email: "john@devstash.io", isPro: true },
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

  // Items + their tags (text content type for these samples).
  for (const item of ITEMS) {
    const { tags, createdAt, ...rest } = item;
    await prisma.item.upsert({
      where: { id: item.id },
      update: { title: rest.title, description: rest.description },
      create: {
        ...rest,
        contentType: "text",
        createdAt: new Date(createdAt),
        userId: user.id,
      },
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
