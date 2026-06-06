import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

// Delete every user EXCEPT demo@devstash.io, along with all of their content.
//
// Run a preview (no deletes):   npm run db:purge-users
// Actually delete:              npm run db:purge-users -- --yes
//
// Safety:
//  • Dry-run by default — nothing is deleted unless you pass --yes.
//  • The demo user and their content are always preserved.
//  • System item types (userId = null) are never touched.
//  • A user's items/collections/tags/accounts/sessions cascade-delete with the
//    user (onDelete: Cascade in schema.prisma), so deleting the user is enough.
//  • Operates on whatever DATABASE_URL points at — keep this pointed at the
//    Neon `development` branch.

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const KEEP_EMAIL = "demo@devstash.io";
const CONFIRMED = process.argv.includes("--yes");

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set — add it to .env");
  }

  // Users that would be removed (everyone except the demo account).
  const victims = await prisma.user.findMany({
    where: { email: { not: KEEP_EMAIL } },
    select: {
      id: true,
      name: true,
      email: true,
      _count: {
        select: {
          items: true,
          collections: true,
          tags: true,
          itemTypes: true,
          accounts: true,
          sessions: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Orphaned verification tokens for any non-demo email (no FK to User).
  const staleTokens = await prisma.verificationToken.count({
    where: { identifier: { not: KEEP_EMAIL } },
  });

  if (victims.length === 0 && staleTokens === 0) {
    console.log(`Nothing to delete — only ${KEEP_EMAIL} exists. ✅`);
    return;
  }

  console.log(
    `${CONFIRMED ? "Deleting" : "Would delete"} ${victims.length} user(s) ` +
      `(keeping ${KEEP_EMAIL}):\n`,
  );
  for (const u of victims) {
    const c = u._count;
    console.log(
      `   • ${u.name ?? "(no name)"} <${u.email}> — ` +
        `${c.items} items, ${c.collections} collections, ${c.tags} tags, ` +
        `${c.itemTypes} custom types, ${c.accounts} accounts, ${c.sessions} sessions`,
    );
  }
  console.log(`\n   + ${staleTokens} stale verification token(s)`);

  if (!CONFIRMED) {
    console.log(
      "\nDry run — nothing was deleted. Re-run with `-- --yes` to execute.",
    );
    return;
  }

  // Cascades handle each user's content. Verification tokens have no FK, so
  // remove the non-demo ones explicitly.
  const [{ count: deletedUsers }, { count: deletedTokens }] = await Promise.all([
    prisma.user.deleteMany({ where: { email: { not: KEEP_EMAIL } } }),
    prisma.verificationToken.deleteMany({
      where: { identifier: { not: KEEP_EMAIL } },
    }),
  ]);

  console.log(
    `\n✓ Deleted ${deletedUsers} user(s) and ${deletedTokens} verification token(s). ✅`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("✗ Purge failed:\n", e);
    await prisma.$disconnect();
    process.exit(1);
  });
