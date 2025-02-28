const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Function to clean up the database
async function cleanDatabase() {
  const tablenames = await prisma.$queryRaw`
    SELECT tablename FROM pg_tables 
    WHERE schemaname='public' AND tablename != '_prisma_migrations';
  `;

  const tables = tablenames.map(({ tablename }) => tablename);

  try {
    for (const table of tables) {
      await prisma.$executeRawUnsafe(
        `TRUNCATE TABLE "public"."${table}" CASCADE;`
      );
    }
  } catch (error) {
    console.log({ error });
  }
}

// beforeAll - runs once before all tests
beforeAll(async () => {
  await cleanDatabase();
});

// afterAll - cleanup and disconnect
afterAll(async () => {
  await cleanDatabase();
  await prisma.$disconnect();
});

module.exports = {
  prisma,
  cleanDatabase,
};
