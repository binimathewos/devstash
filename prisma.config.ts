import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma 7 no longer reads .env automatically and no longer takes the
// datasource URL from schema.prisma. We load .env via dotenv and pass the
// connection string here. This config is used by the Prisma CLI
// (migrate, generate, studio).
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
