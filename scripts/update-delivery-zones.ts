import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.deliveryZone.updateMany({
    data: { estimatedTime: '24 - 48 hrs' },
  });
  console.log(`Updated ${result.count} delivery zones to '24 - 48 hrs'.`);

  const zones = await prisma.deliveryZone.findMany({
    select: { name: true, region: true, fee: true, estimatedTime: true },
  });
  console.log('Current zones:');
  console.table(zones);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
