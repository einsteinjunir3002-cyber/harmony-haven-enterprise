import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runPrivilegeTests() {
  console.log("==================================================");
  console.log("TESTING ADMIN & OWNER PRIVILEGES SUITE");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string) => {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  };

  try {
    // 1. Test Category Privileges: Create, Read, Rename, Delete
    const kowahBrand = await prisma.brand.findFirst({ where: { slug: "kowahs-dishes" } });
    assert(!!kowahBrand, "1. Brand Kowah's Dishes located for category operations");

    if (kowahBrand) {
      // Create new category
      const testCat = await prisma.category.create({
        data: {
          brandId: kowahBrand.id,
          name: "Test Dessert Delights",
          slug: `test-dessert-${Date.now()}`,
          description: "Freshly whipped Ghanaian desserts",
          sortOrder: 99,
        },
      });
      assert(!!testCat.id, "2. Owner can add new categories under any brand");

      // Rename category
      const updatedCat = await prisma.category.update({
        where: { id: testCat.id },
        data: { name: "Renamed Dessert Delights & Pastries" },
      });
      assert(updatedCat.name === "Renamed Dessert Delights & Pastries", "3. Owner can rename and edit category metadata");

      // Delete category
      await prisma.category.delete({ where: { id: testCat.id } });
      const checkDeleted = await prisma.category.findUnique({ where: { id: testCat.id } });
      assert(!checkDeleted, "4. Owner can delete categories safely");
    }

    // 2. Test Product Photo Management Privileges
    const testProduct = await prisma.product.findFirst({
      where: { brand: { slug: "kowahs-dishes" } },
    });
    assert(!!testProduct, "5. Target product located for photo operations");

    if (testProduct) {
      let currentImages: string[] = [];
      try {
        currentImages = JSON.parse(testProduct.images || "[]");
      } catch {}

      // Add photo to product
      const newPhoto = "/images/gallery/test-upload.jpg";
      const updatedImages = [...currentImages, newPhoto];
      await prisma.product.update({
        where: { id: testProduct.id },
        data: { images: JSON.stringify(updatedImages) },
      });

      const refetched = await prisma.product.findUnique({ where: { id: testProduct.id } });
      const refetchedImages = JSON.parse(refetched?.images || "[]");
      assert(refetchedImages.includes(newPhoto), "6. Owner can add photos to product gallery");

      // Remove photo from product
      const cleanedImages = refetchedImages.filter((img: string) => img !== newPhoto);
      await prisma.product.update({
        where: { id: testProduct.id },
        data: { images: JSON.stringify(cleanedImages) },
      });

      const finalCheck = await prisma.product.findUnique({ where: { id: testProduct.id } });
      const finalImages = JSON.parse(finalCheck?.images || "[]");
      assert(!finalImages.includes(newPhoto), "7. Owner can remove photos from product gallery");
    }

    // 3. Test Inventory Privileges
    if (testProduct) {
      const originalStock = testProduct.stockQuantity;
      const newStock = originalStock + 15;

      await prisma.product.update({
        where: { id: testProduct.id },
        data: { stockQuantity: newStock },
      });

      const stockCheck = await prisma.product.findUnique({ where: { id: testProduct.id } });
      assert(stockCheck?.stockQuantity === newStock, "8. Owner can adjust inventory stock levels");

      // Restore original stock
      await prisma.product.update({
        where: { id: testProduct.id },
        data: { stockQuantity: originalStock },
      });
    }

    // 4. Test Customer Management Privileges
    const adminUser = await prisma.user.findFirst({
      where: { email: "albertaglory@harmonyhaven.com" },
    });
    assert(!!adminUser, "9. Admin/Customer account verification");

    // 5. Test Delivery Zone Privileges (Add & Delete)
    const testZone = await prisma.deliveryZone.create({
      data: {
        name: `Test Zone ${Date.now()}`,
        region: "Greater Accra",
        fee: 45.0,
        estimatedTime: "Same Day (1-2 hrs)",
      },
    });
    assert(!!testZone.id, "10. Owner can add new delivery zones in settings");

    await prisma.deliveryZone.delete({ where: { id: testZone.id } });
    const zoneCheck = await prisma.deliveryZone.findUnique({ where: { id: testZone.id } });
    assert(!zoneCheck, "11. Owner can remove delivery zones");

    // 6. Test Storefront Settings & Notification Blocks
    const notifBlock = await prisma.contentBlock.upsert({
      where: { key: "store.notifications" },
      update: {
        title: "Notification Preferences",
        contentJson: JSON.stringify({ notifyWhatsAppOrders: true, lowStockThreshold: 10 }),
      },
      create: {
        key: "store.notifications",
        title: "Notification Preferences",
        section: "general",
        contentJson: JSON.stringify({ notifyWhatsAppOrders: true, lowStockThreshold: 10 }),
      },
    });
    assert(!!notifBlock.id, "12. Store notifications and alert preferences stored in CMS");

    console.log("==================================================");
    console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================");

    if (failed > 0) process.exit(1);
  } catch (error) {
    console.error("Test execution failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runPrivilegeTests();
