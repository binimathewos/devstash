import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

// Quick database connectivity + data sanity check.
// Run with: npm run db:test  (→ tsx scripts/test-db.ts)
// Loads DATABASE_URL via dotenv (Prisma 7 does not auto-load env), connects
// through the node-postgres driver adapter, and prints the seeded demo data.

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEMO_EMAIL = "demo@devstash.io";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set — add it to .env");
  }

  // 1) Raw connectivity check.
  await prisma.$queryRaw`SELECT 1`;
  console.log("✓ Connected to the database\n");

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
    select: { name: true, icon: true, color: true },
    orderBy: { name: "asc" },
  });
  console.log(`\n✓ System item types (${systemTypes.length}):`);
  for (const t of systemTypes) {
    console.log(`   • ${t.name.padEnd(8)} ${t.icon?.padEnd(11) ?? ""} ${t.color ?? ""}`);
  }

  // 4) The seeded demo user.
  const user = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
    include: {
      _count: { select: { collections: true, items: true, tags: true } },
    },
  });
  if (!user) {
    throw new Error(`Demo user ${DEMO_EMAIL} not found — run \`npm run db:seed\` first`);
  }
  console.log(`\n✓ Demo user: ${user.name} <${user.email}>`);
  console.log(
    `   isPro: ${user.isPro} | password: ${user.password ? "hashed ✓" : "missing ✗"} | ` +
      `emailVerified: ${user.emailVerified ? "yes" : "no"}`,
  );
  console.log(
    `   owns ${user._count.collections} collections, ${user._count.items} items, ${user._count.tags} tags`,
  );

  // 5) Each collection with its items (type, language/url, tags).
  const userCollections = await prisma.collection.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    include: {
      items: {
        orderBy: { createdAt: "desc" },
        include: {
          type: { select: { name: true } },
          tags: { include: { tag: { select: { name: true } } } },
        },
      },
    },
  });

  console.log("\n✓ Demo data by collection:");
  for (const c of userCollections) {
    const fav = c.isFavorite ? " ★" : "";
    console.log(`\n   ▸ ${c.name}${fav} (${c.items.length}) — ${c.description ?? ""}`);
    for (const item of c.items) {
      const detail = item.url ?? item.language ?? "text";
      const tagNames = item.tags.map((t) => t.tag.name).join(", ");
      console.log(`      • ${item.title} [${item.type.name}/${detail}]${tagNames ? ` — ${tagNames}` : ""}`);
    }
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
