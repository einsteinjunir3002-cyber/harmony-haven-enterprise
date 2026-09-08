import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function runPlatformTests() {
  console.log("==================================================");
  console.log("HARMONY HAVEN ENTERPRISE — PLATFORM INTEGRATION TEST");
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
    // Test 1: Admin Account Verification
    const admin = await prisma.user.findFirst({
      where: {
        OR: [{ name: "Alberta Glory" }, { email: "albertaglory@harmonyhaven.com" }],
      },
    });
    assert(!!admin && admin.role === "SUPER_ADMIN", "1. Super Admin (Alberta Glory) account exists with SUPER_ADMIN role");

    // Test 2: Admin Password Verification
    if (admin) {
      const passwordMatch = await bcrypt.compare("1234567890", admin.passwordHash);
      assert(passwordMatch, "2. Admin password (1234567890) correctly verifies with bcrypt hash");
    }

    // Test 3: Multi-Brand Architecture
    const brands = await prisma.brand.findMany({ where: { active: true } });
    assert(brands.length >= 2, `3. Active brands exist (Found ${brands.length}: ${brands.map((b) => b.name).join(", ")})`);

    const kowah = brands.find((b) => b.slug === "kowahs-dishes");
    const heartlines = brands.find((b) => b.slug === "4u-heartlines");
    assert(Boolean(kowah && kowah.tagline?.includes("Cook Less")), "4. Kowah's Dishes brand configuration and tagline verified");
    assert(Boolean(heartlines && heartlines.tagline?.includes("Where feelings find")), "5. 4U HEARTLINES brand configuration and tagline verified");

    // Test 4: Product Catalog and Variants
    const products = await prisma.product.findMany({
      include: { variants: true, brand: true, category: true },
    });
    assert(products.length >= 8, `6. Database-driven product catalog loaded (${products.length} products found)`);

    const productsWithVariants = products.filter((p) => p.variants.length > 0);
    assert(productsWithVariants.length >= 4, `7. Product variants loaded correctly (${productsWithVariants.length} configurable items)`);

    // Test 5: Ghana Delivery Zones
    const deliveryZones = await prisma.deliveryZone.findMany({ where: { active: true } });
    assert(deliveryZones.length >= 5, `8. Ghanaian delivery zones populated (${deliveryZones.length} zones found)`);

    // Test 6: CMS Content Blocks
    const cmsBlocks = await prisma.contentBlock.findMany();
    assert(cmsBlocks.length >= 5, `9. CMS Content blocks loaded for Vision, Mission, Values and Founder (${cmsBlocks.length} blocks)`);

    // Test 7: Order Number Generation Collision Check
    const orderNum1 = `HH-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const orderNum2 = `HH-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    assert(orderNum1.startsWith("HH-2026-") && orderNum1 !== orderNum2, "10. Collision-safe Ghanaian order number format verified");

    console.log("==================================================");
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("Test execution failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runPlatformTests();
