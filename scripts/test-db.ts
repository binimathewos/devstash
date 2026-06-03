import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

// Quick database connectivity + data sanity check.
// Run with: npm run db:test  (→ tsx scripts/test-db.ts)
// Loads DATABASE_URL via dotenv (Prisma 7 does not auto-load env), connects
// through the node-postgres driver adapter, and runs a few read queries.

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set — add it to .env");
  }

  // 1) Raw connectivity check.
  await prisma.$queryRaw`SELECT 1`;
  console.log("✓ Connected to the database");

  // 2) Row counts per table.
  const [types, users, collections, items, tags, itemTags] = await Promise.all([
    prisma.itemType.count(),
    prisma.user.count(),
    prisma.collection.count(),
    prisma.item.count(),
    prisma.tag.count(),
    prisma.itemTag.count(),
  ]);
  console.log("✓ Row counts:", { types, users, collections, items, tags, itemTags });

  // 3) System item types.
  const systemTypes = await prisma.itemType.findMany({
    where: { isSystem: true },
    select: { name: true },
    orderBy: { name: "asc" },
  });
  console.log(
    `✓ System item types (${systemTypes.length}):`,
    systemTypes.map((t) => t.name).join(", "),
  );

  // 4) A relational read: items with their type, collection, and tags.
  const sampleItems = await prisma.item.findMany({
    take: 3,
    orderBy: { createdAt: "desc" },
    include: {
      type: { select: { name: true } },
      collection: { select: { name: true } },
      tags: { include: { tag: { select: { name: true } } } },
    },
  });
  console.log("✓ Sample items (relational read):");
  for (const item of sampleItems) {
    const tagNames = item.tags.map((t) => t.tag.name).join(", ");
    console.log(
      `   • ${item.title} [${item.type.name}] in ${item.collection?.name ?? "—"} — tags: ${tagNames}`,
    );
  }

  console.log("\nAll database checks passed ✅");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("✗ Database test failed:\n", e);
    await prisma.$disconnect();
    process.exit(1);
  });
