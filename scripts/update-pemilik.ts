const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    // Update all records with pemilik = null or empty string
    const updated = await prisma.uMKM.updateMany({
      where: {
        OR: [{ pemilik: { equals: "" } }, { pemilik: { equals: null } }],
      },
      data: {
        pemilik: "Pemilik tidak diketahui",
      },
    });

    console.log(`Updated ${updated.count} records`);
  } catch (error) {
    console.error("Error updating records:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
