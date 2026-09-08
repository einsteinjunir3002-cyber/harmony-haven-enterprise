import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Harmony Haven Enterprise database...");

  // 1. Create Default Admin User (Alberta Glory)
  const adminPasswordHash = await bcrypt.hash("1234567890", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "albertaglory@harmonyhaven.com" },
    update: {
      passwordHash: adminPasswordHash,
      role: "SUPER_ADMIN",
    },
    create: {
      name: "Alberta Glory",
      email: "albertaglory@harmonyhaven.com",
      phone: "024 514 7912",
      passwordHash: adminPasswordHash,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
  });
  console.log(`Created Super Admin user: ${adminUser.name} (${adminUser.email})`);

  // 2. Create Delivery Zones across Ghana
  const deliveryZones = [
    { name: "Accra Central & Ring Road", region: "Greater Accra", fee: 25.0, estimatedTime: "24 - 48 hrs" },
    { name: "East Legon, Airport, Dzorwulu", region: "Greater Accra", fee: 30.0, estimatedTime: "24 - 48 hrs" },
    { name: "Tema, Spintex & Sakumono", region: "Greater Accra", fee: 35.0, estimatedTime: "24 - 48 hrs" },
    { name: "Madina, Adenta & Haatso", region: "Greater Accra", fee: 35.0, estimatedTime: "24 - 48 hrs" },
    { name: "Dansoman, Weija & Kasoa", region: "Greater Accra", fee: 40.0, estimatedTime: "24 - 48 hrs" },
    { name: "Kumasi Metropolis", region: "Ashanti", fee: 50.0, estimatedTime: "24 - 48 hrs" },
    { name: "Takoradi / Cape Coast", region: "Western / Central", fee: 55.0, estimatedTime: "24 - 48 hrs" },
    { name: "Nationwide Express Courier", region: "All Regions", fee: 65.0, estimatedTime: "24 - 48 hrs" },
  ];

  for (const zone of deliveryZones) {
    const existing = await prisma.deliveryZone.findFirst({ where: { name: zone.name } });
    if (!existing) {
      await prisma.deliveryZone.create({ data: zone });
    }
  }
  console.log("Created Ghanaian delivery zones.");

  // 3. Create Brands
  // Brand 1: Kowah's Dishes
  const kowahBrand = await prisma.brand.upsert({
    where: { slug: "kowahs-dishes" },
    update: {
      name: "Kowah's Dishes",
      tagline: "Cook Less, Live More!",
      description: "Fresh from our pot to your fridge. Modern Ghanaian homemade culinary experience crafted with deep passion and authentic spices.",
      logo: "/images/gallery/WhatsApp Image 2026-09-03 at 10.14.23 PM (1).jpeg",
      banner: "/images/gallery/WhatsApp Image 2026-09-03 at 10.31.46 PM.jpeg",
      primaryColor: "#4a2818",
      secondaryColor: "#c59b27",
      active: true,
      sortOrder: 1,
    },
    create: {
      name: "Kowah's Dishes",
      slug: "kowahs-dishes",
      tagline: "Cook Less, Live More!",
      description: "Fresh from our pot to your fridge. Modern Ghanaian homemade culinary experience crafted with deep passion and authentic spices.",
      logo: "/images/gallery/WhatsApp Image 2026-09-03 at 10.14.23 PM (1).jpeg",
      banner: "/images/gallery/WhatsApp Image 2026-09-03 at 10.31.46 PM.jpeg",
      primaryColor: "#4a2818",
      secondaryColor: "#c59b27",
      active: true,
      sortOrder: 1,
    },
  });

  // Brand 2: 4U HEARTLINES
  const heartlinesBrand = await prisma.brand.upsert({
    where: { slug: "4u-heartlines" },
    update: {
      name: "4U HEARTLINES",
      tagline: "Where feelings find their words; from your heart through our pen.",
      description: "Thoughtful gifts. Personal words. Meaningful moments. A bespoke creative studio bringing emotions to life through curated gift experiences and poetry.",
      logo: "/images/gallery/WhatsApp Image 2026-09-03 at 10.14.22 PM.jpeg",
      banner: "/images/gallery/WhatsApp Image 2026-09-03 at 10.31.47 PM.jpeg",
      primaryColor: "#0a4d52",
      secondaryColor: "#c59b27",
      active: true,
      sortOrder: 2,
    },
    create: {
      name: "4U HEARTLINES",
      slug: "4u-heartlines",
      tagline: "Where feelings find their words; from your heart through our pen.",
      description: "Thoughtful gifts. Personal words. Meaningful moments. A bespoke creative studio bringing emotions to life through curated gift experiences and poetry.",
      logo: "/images/gallery/WhatsApp Image 2026-09-03 at 10.14.22 PM.jpeg",
      banner: "/images/gallery/WhatsApp Image 2026-09-03 at 10.31.47 PM.jpeg",
      primaryColor: "#0a4d52",
      secondaryColor: "#c59b27",
      active: true,
      sortOrder: 2,
    },
  });

  // 4. Create Categories for Kowah's Dishes
  const kowahCatSavory = await prisma.category.upsert({
    where: { brandId_slug: { brandId: kowahBrand.id, slug: "savory-bowl" } },
    update: {
      name: "Savory Bowl",
      description: "Deliciously prepared soups and stews, conveniently packaged for your home.",
      sortOrder: 1,
    },
    create: {
      brandId: kowahBrand.id,
      name: "Savory Bowl",
      slug: "savory-bowl",
      description: "Deliciously prepared soups and stews, conveniently packaged for your home.",
      sortOrder: 1,
    },
  });

  const kowahCatHotBox = await prisma.category.upsert({
    where: { brandId_slug: { brandId: kowahBrand.id, slug: "hot-box" } },
    update: {
      name: "Hot Box",
      description: "A generously packed selection of deliciously prepared meats for the meat lover.",
      sortOrder: 2,
    },
    create: {
      brandId: kowahBrand.id,
      name: "Hot Box",
      slug: "hot-box",
      description: "A generously packed selection of deliciously prepared meats for the meat lover.",
      sortOrder: 2,
    },
  });

  const kowahCatSorrel = await prisma.category.upsert({
    where: { brandId_slug: { brandId: kowahBrand.id, slug: "fruity-sorrel-juice" } },
    update: {
      name: "Fruity Sorrel Juice",
      description: "A refreshing and aromatic hibiscus-based beverage. Perfect for a cooling treat.",
      sortOrder: 3,
    },
    create: {
      brandId: kowahBrand.id,
      name: "Fruity Sorrel Juice",
      slug: "fruity-sorrel-juice",
      description: "A refreshing and aromatic hibiscus-based beverage. Perfect for a cooling treat.",
      sortOrder: 3,
    },
  });

  const kowahCatShito = await prisma.category.upsert({
    where: { brandId_slug: { brandId: kowahBrand.id, slug: "shito" } },
    update: {
      name: "Shito",
      description: "Experience the bold, authentic heat of Ghana. Perfect for dipping, spreading, and elevating any meal.",
      sortOrder: 4,
    },
    create: {
      brandId: kowahBrand.id,
      name: "Shito",
      slug: "shito",
      description: "Experience the bold, authentic heat of Ghana. Perfect for dipping, spreading, and elevating any meal.",
      sortOrder: 4,
    },
  });

  // 5. Create Categories for 4U HEARTLINES
  const heartCatVerseVelvet = await prisma.category.upsert({
    where: { brandId_slug: { brandId: heartlinesBrand.id, slug: "verse-and-velvet" } },
    update: {
      name: "VERSE & VELVET",
      description: "Thoughtful gifts, wrapped in feeling. Curated gift boxes for life's unforgettable moments.",
      sortOrder: 1,
    },
    create: {
      brandId: heartlinesBrand.id,
      name: "VERSE & VELVET",
      slug: "verse-and-velvet",
      description: "Thoughtful gifts, wrapped in feeling. Curated gift boxes for life's unforgettable moments.",
      sortOrder: 1,
    },
  });

  const heartCatInkEmotion = await prisma.category.upsert({
    where: { brandId_slug: { brandId: heartlinesBrand.id, slug: "ink-and-emotion" } },
    update: {
      name: "INK & EMOTION",
      description: "You bring the feeling. We find the words. Bespoke poetry, framed pictures & poems, and candle citations.",
      sortOrder: 2,
    },
    create: {
      brandId: heartlinesBrand.id,
      name: "INK & EMOTION",
      slug: "ink-and-emotion",
      description: "You bring the feeling. We find the words. Bespoke poetry, framed pictures & poems, and candle citations.",
      sortOrder: 2,
    },
  });

  // 6. Seed Products for Kowah's Dishes
  const kowahProducts = [
    {
      brandId: kowahBrand.id,
      categoryId: kowahCatSavory.id,
      name: "Savory Bowl - Signature Soups & Stews",
      slug: "savory-bowl-signature-pot",
      description: "Richly spiced homemade Ghanaian soups and stews freshly simmered with authentic local herbs, cow foot, goat meat, or smoked fish. Conveniently packaged from our pot to your fridge so you can cook less and live more.",
      shortDescription: "Deliciously prepared soups and stews, conveniently packaged for your home.",
      price: 120.0,
      compareAtPrice: 140.0,
      type: "MADE_TO_ORDER",
      featured: true,
      images: JSON.stringify([
        "/images/gallery/WhatsApp Image 2026-09-03 at 10.18.38 PM.jpeg",
        "/images/gallery/WhatsApp Image 2026-09-03 at 10.19.28 PM.jpeg",
        "/images/gallery/WhatsApp Image 2026-09-03 at 10.20.31 PM.jpeg"
      ]),
      variants: [
        { name: "Light Soup with Goat Meat (2 Litres)", priceAdjustment: 0, stockQuantity: 30 },
        { name: "Groundnut Soup with Assorted Beef (2 Litres)", priceAdjustment: 10, stockQuantity: 30 },
        { name: "Palm Nut Soup with Smoked Fish & Crab (2 Litres)", priceAdjustment: 25, stockQuantity: 20 },
        { name: "Jumbo Family Pot (3.5 Litres)", priceAdjustment: 85, stockQuantity: 15 },
      ],
    },
    {
      brandId: kowahBrand.id,
      categoryId: kowahCatHotBox.id,
      name: "Hot Box - Generously Packed Seasoned Meats",
      slug: "hot-box-assorted-meats",
      description: "A sizzling assortment of succulent grilled meats, tender goat cubes, and seasoned beef cuts marinated in Kowah's signature herb blend. A generously packed selection for the true meat lover.",
      shortDescription: "A generously packed selection of deliciously prepared meats for the meat lover.",
      price: 145.0,
      compareAtPrice: 165.0,
      type: "MADE_TO_ORDER",
      featured: true,
      images: JSON.stringify([
        "/images/gallery/WhatsApp Image 2026-09-03 at 10.22.02 PM.jpeg",
        "/images/gallery/WhatsApp Image 2026-09-03 at 10.21.06 PM.jpeg"
      ]),
      variants: [
        { name: "Classic Box (Beef, Gizzard & Spicy Wings)", priceAdjustment: 0, stockQuantity: 40 },
        { name: "Meat Lovers Deluxe (Goat, Beef, Pork & Sausage)", priceAdjustment: 45, stockQuantity: 30 },
        { name: "Party Mega Platter", priceAdjustment: 110, stockQuantity: 15 },
      ],
    },
    {
      brandId: kowahBrand.id,
      categoryId: kowahCatSorrel.id,
      name: "Fruity Sorrel Juice (Sobolo)",
      slug: "fruity-sorrel-juice",
      description: "A refreshing and aromatic hibiscus-based beverage brewed with natural pineapple, ginger, cloves, and citrus. A cooling burst of natural flavor perfect for any occasion.",
      shortDescription: "A refreshing and aromatic hibiscus-based beverage. Perfect for a cooling treat.",
      price: 25.0,
      compareAtPrice: 30.0,
      type: "PHYSICAL_PRODUCT",
      featured: true,
      images: JSON.stringify([
        "/images/gallery/WhatsApp Image 2026-09-03 at 10.23.34 PM.jpeg"
      ]),
      variants: [
        { name: "Single Bottle (500ml)", priceAdjustment: 0, stockQuantity: 100 },
        { name: "Family Pack (Pack of 4 x 500ml)", priceAdjustment: 70, stockQuantity: 50 },
        { name: "Large Bottle (1.5 Litres)", priceAdjustment: 35, stockQuantity: 40 },
        { name: "Party Dispenser Jug (5 Litres)", priceAdjustment: 130, stockQuantity: 15 },
      ],
    },
    {
      brandId: kowahBrand.id,
      categoryId: kowahCatShito.id,
      name: "Homedine Shito - Black & Green Pepper Sauce",
      slug: "kowahs-rich-ghanaian-shito",
      description: "Experience the bold, authentic heat of Ghana. Caramelised pepper sauce slowly cooked with dried shrimp, smoked fish, ginger, and scotch bonnet peppers. Available in classic Black and aromatic Green blends. Perfect for dipping, spreading, and elevating any meal.",
      shortDescription: "Experience the bold, authentic heat of Ghana. Perfect for dipping and spreading.",
      price: 45.0,
      compareAtPrice: 50.0,
      type: "PHYSICAL_PRODUCT",
      featured: true,
      images: JSON.stringify([
        "/images/gallery/WhatsApp Image 2026-09-03 at 10.24.22 PM.jpeg"
      ]),
      variants: [
        { name: "Homedine Black Shito Jar (350g)", priceAdjustment: 0, stockQuantity: 60 },
        { name: "Homedine Green Shito Jar (350g)", priceAdjustment: 0, stockQuantity: 40 },
        { name: "Duo Pack (1 Black + 1 Green Shito)", priceAdjustment: 40, stockQuantity: 30 },
        { name: "Large Family Jar (500g)", priceAdjustment: 25, stockQuantity: 25 },
      ],
    },
    {
      brandId: kowahBrand.id,
      categoryId: kowahCatHotBox.id,
      name: "Peppered Beef & Vegetable Medley",
      slug: "peppered-gizzard-kelewele-platter",
      description: "Tender seasoned beef bites pan-seared with sweet bell peppers, sliced carrots, and caramelised onions in a savory aromatic glaze.",
      shortDescription: "Pan-seared tender seasoned beef bites tossed with fresh peppers and onions.",
      price: 65.0,
      compareAtPrice: 75.0,
      type: "MADE_TO_ORDER",
      featured: false,
      images: JSON.stringify([
        "/images/gallery/WhatsApp Image 2026-09-03 at 10.21.06 PM.jpeg",
        "/images/gallery/WhatsApp Image 2026-09-03 at 10.20.31 PM.jpeg"
      ]),
      variants: [
        { name: "Regular Box", priceAdjustment: 0, stockQuantity: 40 },
        { name: "Large Combo with Extra Shito", priceAdjustment: 30, stockQuantity: 25 },
      ],
    },
    {
      brandId: kowahBrand.id,
      categoryId: kowahCatSavory.id,
      name: "Kowah's Catering & Family Feast",
      slug: "party-jollof-grilled-chicken-box",
      description: "Complete Ghanaian catering packages and custom family feast orders featuring our Savory Bowls, Hot Boxes, Shito jars, and Sorrel drinks simmered to order for gatherings, office functions, and celebrations.",
      shortDescription: "Complete Ghanaian catering packages and custom family feast orders.",
      price: 180.0,
      compareAtPrice: 200.0,
      type: "MADE_TO_ORDER",
      featured: true,
      images: JSON.stringify([
        "/images/gallery/WhatsApp Image 2026-09-03 at 10.31.46 PM.jpeg",
        "/images/gallery/WhatsApp Image 2026-09-03 at 10.22.02 PM.jpeg"
      ]),
      variants: [
        { name: "Small Gathering (Serves 4 - 6)", priceAdjustment: 0, stockQuantity: 20 },
        { name: "Family Celebration Feast (Serves 8 - 12)", priceAdjustment: 150, stockQuantity: 15 },
        { name: "Corporate Lunch Platter Package", priceAdjustment: 280, stockQuantity: 10 },
      ],
    },
  ];

  for (const item of kowahProducts) {
    const { variants, ...prodData } = item;
    const product = await prisma.product.upsert({
      where: { slug: prodData.slug },
      update: {
        name: prodData.name,
        description: prodData.description,
        shortDescription: prodData.shortDescription,
        price: prodData.price,
        compareAtPrice: prodData.compareAtPrice,
        type: prodData.type,
        featured: prodData.featured,
        images: prodData.images,
        categoryId: prodData.categoryId,
        brandId: prodData.brandId,
      },
      create: prodData,
    });

    for (const v of variants) {
      const existingVar = await prisma.productVariant.findFirst({
        where: { productId: product.id, name: v.name },
      });
      if (!existingVar) {
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            name: v.name,
            priceAdjustment: v.priceAdjustment,
            stockQuantity: v.stockQuantity,
          },
        });
      }
    }
  }

  // 7. Seed Products for 4U HEARTLINES
  const heartlinesProducts = [
    {
      brandId: heartlinesBrand.id,
      categoryId: heartCatVerseVelvet.id,
      name: "Girl Care Box",
      slug: "girl-care-box",
      description: "A luxury pampering gift hamper in a signature black box with teal ribbon, featuring an elegant leather purse, delicate gold necklace, and a bespoke handwritten 4U Heartlines poetic scroll.",
      shortDescription: "Curated luxury gift box with leather purse, gold necklace, and personalized poem scroll.",
      price: 320.0,
      compareAtPrice: 360.0,
      type: "CUSTOM_PRODUCT",
      featured: true,
      images: JSON.stringify([
        "/images/gallery/WhatsApp Image 2026-09-03 at 10.24.59 PM.jpeg"
      ]),
      variants: [
        { name: "Bliss Essentials Box", priceAdjustment: 0, stockQuantity: 20 },
        { name: "Royalty Pamper Suite with Extra Keepsakes", priceAdjustment: 110, stockQuantity: 15 },
      ],
    },
    {
      brandId: heartlinesBrand.id,
      categoryId: heartCatVerseVelvet.id,
      name: "Guy Care Box",
      slug: "guy-care-box",
      description: "A gentleman's luxury gift box featuring a classic leather bifold wallet, designer wristwatch, and a heartfelt tailored poetic scroll from 4U Heartlines in a signature black and teal presentation box.",
      shortDescription: "Premium gentleman's box with leather wallet, wristwatch, and tailored poetic scroll.",
      price: 320.0,
      compareAtPrice: 360.0,
      type: "CUSTOM_PRODUCT",
      featured: true,
      images: JSON.stringify([
        "/images/gallery/WhatsApp Image 2026-09-03 at 10.25.52 PM.jpeg"
      ]),
      variants: [
        { name: "Gentleman's Choice", priceAdjustment: 0, stockQuantity: 20 },
        { name: "Signature Prestige Edition", priceAdjustment: 110, stockQuantity: 15 },
      ],
    },
    {
      brandId: heartlinesBrand.id,
      categoryId: heartCatVerseVelvet.id,
      name: "Executive Appreciation Suite",
      slug: "executive-corporate-appreciation-suite",
      description: "Sophisticated executive gift hamper with gold-embossed 4U Heartlines leather notebook, luxury executive pen, and wax-sealed poetic citation scroll. Perfect for corporate gratitude, leadership recognition, and milestones.",
      shortDescription: "Gold-embossed leather journal, executive pen, and wax-sealed citation scroll.",
      price: 480.0,
      compareAtPrice: 550.0,
      type: "CUSTOM_PRODUCT",
      featured: true,
      images: JSON.stringify([
        "/images/gallery/WhatsApp Image 2026-09-03 at 10.25.52 PM (1).jpeg",
        "/images/gallery/WhatsApp Image 2026-09-03 at 10.29.27 PM.jpeg"
      ]),
      variants: [
        { name: "Single Executive Hamper (Black Edition)", priceAdjustment: 0, stockQuantity: 20 },
        { name: "Executive Hamper (Cream Leather Edition)", priceAdjustment: 20, stockQuantity: 15 },
        { name: "Gold Tier Plaque Edition", priceAdjustment: 120, stockQuantity: 10 },
      ],
    },
    {
      brandId: heartlinesBrand.id,
      categoryId: heartCatVerseVelvet.id,
      name: "Special Day Celebration Keepsake",
      slug: "special-day-box",
      description: "A heartwarming milestone gift collection celebrating anniversaries, birthdays, weddings, or lifelong friendships, customized with personal photographs, floral keepsake bindings, and heartfelt poetry.",
      shortDescription: "Milestone celebration gift collection with personalized photo books and verses.",
      price: 450.0,
      compareAtPrice: 500.0,
      type: "CUSTOM_PRODUCT",
      featured: true,
      images: JSON.stringify([
        "/images/gallery/WhatsApp Image 2026-09-03 at 11.07.34 PM.jpeg",
        "/images/gallery/WhatsApp Image 2026-09-03 at 11.00.28 PM.jpeg"
      ]),
      variants: [
        { name: "Friendship / Birthday Keepsake Edition", priceAdjustment: 0, stockQuantity: 15 },
        { name: "Anniversary & Wedding Keepsake Edition", priceAdjustment: 50, stockQuantity: 15 },
      ],
    },
    {
      brandId: heartlinesBrand.id,
      categoryId: heartCatVerseVelvet.id,
      name: "Glee Box & Celebratory Treats",
      slug: "glee-box",
      description: "A joyful curation of luxury celebration confectionery, compact keepsake mirror, scented treats, and personalized inspirational notes designed to bring pure glee to someone special.",
      shortDescription: "Curated celebration treats, keepsakes, and personalized messages.",
      price: 250.0,
      compareAtPrice: 280.0,
      type: "CUSTOM_PRODUCT",
      featured: true,
      images: JSON.stringify([
        "/images/gallery/WhatsApp Image 2026-09-03 at 10.31.47 PM.jpeg",
        "/images/gallery/WhatsApp Image 2026-09-03 at 10.30.14 PM.jpeg"
      ]),
      variants: [
        { name: "Standard Glee Box", priceAdjustment: 0, stockQuantity: 25 },
        { name: "Deluxe Glee Box (Includes Aromatic Candle)", priceAdjustment: 95, stockQuantity: 20 },
      ],
    },
    {
      brandId: heartlinesBrand.id,
      categoryId: heartCatVerseVelvet.id,
      name: "Snack Box Treats",
      slug: "snack-box",
      description: "Artisanal assortment of premium snacks, confectionery treats, savory crisps, and thoughtful personalized 4U Heartlines keepsake tags.",
      shortDescription: "A delightful box of handpicked gourmet treats and personalized snacks.",
      price: 180.0,
      compareAtPrice: 200.0,
      type: "CUSTOM_PRODUCT",
      featured: false,
      images: JSON.stringify([
        "/images/gallery/WhatsApp Image 2026-09-03 at 10.31.47 PM.jpeg"
      ]),
      variants: [
        { name: "Sweet & Savory Combo", priceAdjustment: 0, stockQuantity: 30 },
        { name: "Executive Gourmet Snack Box", priceAdjustment: 75, stockQuantity: 20 },
      ],
    },
    {
      brandId: heartlinesBrand.id,
      categoryId: heartCatInkEmotion.id,
      name: "Pictures & Poems - Custom Framed Verse",
      slug: "pictures-and-poems",
      description: "A bespoke framed keepsake combining your treasured photograph with an original, deeply emotional custom poem written exclusively for your recipient, finished with elegant ribbons, archival backing, and tabletop display stand.",
      shortDescription: "Bespoke custom poem woven from your story, framed with your photograph.",
      price: 160.0,
      compareAtPrice: 180.0,
      type: "SERVICE",
      featured: true,
      images: JSON.stringify([
        "/images/gallery/WhatsApp Image 2026-09-03 at 10.27.18 PM.jpeg",
        "/images/gallery/WhatsApp Image 2026-09-03 at 11.07.35 PM.jpeg",
        "/images/gallery/WhatsApp Image 2026-09-03 at 11.00.28 PM.jpeg"
      ]),
      variants: [
        { name: "Standard Luxury Framed Print (A4)", priceAdjustment: 0, stockQuantity: 50 },
        { name: "Grand Statement Keepsake Frame (A3)", priceAdjustment: 60, stockQuantity: 30 },
      ],
    },
    {
      brandId: heartlinesBrand.id,
      categoryId: heartCatInkEmotion.id,
      name: "Poetic Candle Citations",
      slug: "poetic-candle-citations",
      description: "Hand-poured aromatic soy candles wrapped with a custom metallic citation label that reveals heartwarming fragrance and comforting poetry as it burns softly.",
      shortDescription: "Hand-poured aromatherapy candle featuring a personalized poetic citation label.",
      price: 140.0,
      compareAtPrice: 160.0,
      type: "CUSTOM_PRODUCT",
      featured: true,
      images: JSON.stringify([
        "/images/gallery/WhatsApp Image 2026-09-03 at 10.30.55 PM.jpeg"
      ]),
      variants: [
        { name: "Vanilla & Amber Glow (250g)", priceAdjustment: 0, stockQuantity: 35 },
        { name: "Sandalwood & Jasmine Luxe (400g)", priceAdjustment: 40, stockQuantity: 25 },
      ],
    },
    {
      brandId: heartlinesBrand.id,
      categoryId: heartCatInkEmotion.id,
      name: "Poetic Memos - Hardbound Keepsake Booklet",
      slug: "poetic-memos",
      description: "Gold-foiled hardbound poetry booklet and parchment verse memos featuring original verses, couple silhouettes, and romantic words commemorating your journey together.",
      shortDescription: "Gold-foiled keepsake poetry booklet and customized verse scrolls.",
      price: 95.0,
      compareAtPrice: 110.0,
      type: "SERVICE",
      featured: true,
      images: JSON.stringify([
        "/images/gallery/WhatsApp Image 2026-09-03 at 10.45.38 PM.jpeg",
        "/images/gallery/WhatsApp Image 2026-09-03 at 10.30.14 PM.jpeg"
      ]),
      variants: [
        { name: "Hardbound Gold-Foil Poetry Booklet", priceAdjustment: 0, stockQuantity: 40 },
        { name: "Single Wax-Sealed Scroll in Keepsake Tube", priceAdjustment: 20, stockQuantity: 50 },
      ],
    },
    {
      brandId: heartlinesBrand.id,
      categoryId: heartCatInkEmotion.id,
      name: "Wax-Sealed Love Letters & Vows",
      slug: "wax-sealed-love-letters-and-vows",
      description: "Timeless poetic love letters, anniversary declarations, and wedding vows scribed on fine deckle-edge paper with gold floral flourishes and sealed with customized wax monograms.",
      shortDescription: "Handwritten manuscript vow letter and love poetry sealed with luxury wax.",
      price: 130.0,
      compareAtPrice: 150.0,
      type: "SERVICE",
      featured: true,
      images: JSON.stringify([
        "/images/gallery/WhatsApp Image 2026-09-03 at 10.57.01 PM.jpeg",
        "/images/gallery/WhatsApp Image 2026-09-03 at 10.29.27 PM.jpeg"
      ]),
      variants: [
        { name: "Vintage Handwritten Manuscript with Floral Borders", priceAdjustment: 0, stockQuantity: 30 },
        { name: "Framed Heirloom Vow Folio", priceAdjustment: 55, stockQuantity: 20 },
      ],
    },
    {
      brandId: heartlinesBrand.id,
      categoryId: heartCatInkEmotion.id,
      name: "Poetic Citations & Milestone Plaques",
      slug: "poetic-citations",
      description: "Prestigious poetic citations honoring life milestones, career achievements, retirements, or eternal declarations of gratitude and love, mounted with archival elegance.",
      shortDescription: "Milestone honour citation and tribute plaque with eloquent custom phrasing.",
      price: 220.0,
      compareAtPrice: 250.0,
      type: "SERVICE",
      featured: false,
      images: JSON.stringify([
        "/images/gallery/WhatsApp Image 2026-09-03 at 10.31.47 PM.jpeg",
        "/images/gallery/WhatsApp Image 2026-09-03 at 10.27.18 PM.jpeg"
      ]),
      variants: [
        { name: "Acrylic Desktop Plaque Citation", priceAdjustment: 0, stockQuantity: 40 },
        { name: "Polished Wooden Crest Citation", priceAdjustment: 75, stockQuantity: 25 },
      ],
    },
  ];

  for (const item of heartlinesProducts) {
    const { variants, ...prodData } = item;
    const product = await prisma.product.upsert({
      where: { slug: prodData.slug },
      update: {
        name: prodData.name,
        description: prodData.description,
        shortDescription: prodData.shortDescription,
        price: prodData.price,
        compareAtPrice: prodData.compareAtPrice,
        type: prodData.type,
        featured: prodData.featured,
        images: prodData.images,
        categoryId: prodData.categoryId,
        brandId: prodData.brandId,
      },
      create: prodData,
    });

    for (const v of variants) {
      const existingVar = await prisma.productVariant.findFirst({
        where: { productId: product.id, name: v.name },
      });
      if (!existingVar) {
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            name: v.name,
            priceAdjustment: v.priceAdjustment,
            stockQuantity: v.stockQuantity,
          },
        });
      }
    }
  }

  // 8. Seed CMS Content Blocks
  const contentBlocks = [
    {
      key: "home.hero",
      title: "Hero Banner",
      section: "home",
      contentJson: JSON.stringify({
        headline: "Harmony Haven Enterprise",
        tagline: "Small Hands, Wide Reach",
        subheadline: "Harmony Haven Enterprise is a growing Ghanaian enterprise building meaningful brands across food, gifting, creativity and lifestyle.",
        ctaExplore: "Explore Our Brands",
        ctaOrder: "Place an Order",
      }),
    },
    {
      key: "home.welcome",
      title: "Welcome Statement",
      section: "home",
      contentJson: JSON.stringify({
        heading: "MORE THAN A BUSINESS. A HOME FOR IDEAS.",
        body: "Harmony Haven Enterprise was created to bring different ideas and experiences together under one vision. From nourishing people through food to helping them express what words sometimes cannot say, our brands are built around one simple belief: What we create should add value to people's lives.",
      }),
    },
    {
      key: "about.story",
      title: "Our Story",
      section: "about",
      contentJson: JSON.stringify({
        story: "Harmony Haven Enterprise started from a very simple thought: that everyday experiences—what we eat, how we express love, the moments we celebrate—can be elevated with intention, warmth, and excellence. We started with two distinct passions: crafting homemade food that brings families together, and writing bespoke words that make people feel seen, cherished, and celebrated. Today, we are nurturing Kowah's Dishes and 4U HEARTLINES into household names across Ghana, guided by faith, family values, and a relentless pursuit of quality.",
      }),
    },
    {
      key: "about.vision",
      title: "Vision",
      section: "about",
      contentJson: JSON.stringify({
        text: "To build a diversified, trusted enterprise that touches daily lives with excellence, warmth, and creativity, growing from small hands to wide reach across Ghana and beyond.",
      }),
    },
    {
      key: "about.mission",
      title: "Mission",
      section: "about",
      contentJson: JSON.stringify({
        text: "To develop quality products and services that meet people's needs, inspire connection and create value while building brands that can grow, evolve and stand the test of time.",
      }),
    },
    {
      key: "about.values",
      title: "Core Values",
      section: "about",
      contentJson: JSON.stringify([
        { title: "Integrity", description: "Uncompromising honesty and transparency in every meal we serve, gift we wrap, and promise we make." },
        { title: "Excellence", description: "Meticulous attention to detail and unwavering quality standards across all our brands." },
        { title: "Creativity", description: "Inventive thinking and emotional resonance that breathes original life into every offering." },
        { title: "Care", description: "A genuine heart for our customers, staff, partners, and community." },
        { title: "Growth", description: "Continuous learning and relentless pursuit of scalable impact with wide reach." },
      ]),
    },
    {
      key: "about.founder",
      title: "Founder & CEO",
      section: "about",
      contentJson: JSON.stringify({
        role: "Founder & CEO",
        name: "Alberta Glory",
        titleDesc: "Visionary Leader & Creative Director",
        biography: "Passionate entrepreneur and creative director leading Harmony Haven Enterprise with a vision to build homegrown Ghanaian brands that resonate globally through culinary delight and expressive gifting.",
        photo: "/images/gallery/alberta-glory-founder.jpg",
      }),
    },
  ];

  for (const block of contentBlocks) {
    await prisma.contentBlock.upsert({
      where: { key: block.key },
      update: {
        title: block.title,
        section: block.section,
        contentJson: block.contentJson,
      },
      create: block,
    });
  }

  // 9. Seed Media Metadata from gallery (All 25 client assets correctly labeled)
  const mediaItems = [
    // Logos & Branding
    { title: "Harmony Haven Enterprise Corporate Logo", originalName: "WhatsApp Image 2026-09-03 at 10.14.23 PM.jpeg", url: "/images/gallery/WhatsApp Image 2026-09-03 at 10.14.23 PM.jpeg", category: "BRANDING" },
    { title: "Kowah's Dishes Official Logo", originalName: "WhatsApp Image 2026-09-03 at 10.14.23 PM (1).jpeg", url: "/images/gallery/WhatsApp Image 2026-09-03 at 10.14.23 PM (1).jpeg", category: "BRANDING", brandId: kowahBrand.id },
    { title: "4U HEARTLINES Official Logo", originalName: "WhatsApp Image 2026-09-03 at 10.14.22 PM.jpeg", url: "/images/gallery/WhatsApp Image 2026-09-03 at 10.14.22 PM.jpeg", category: "BRANDING", brandId: heartlinesBrand.id },
    { title: "Kowah's Dishes Official Menu Flyer", originalName: "WhatsApp Image 2026-09-03 at 10.31.46 PM.jpeg", url: "/images/gallery/WhatsApp Image 2026-09-03 at 10.31.46 PM.jpeg", category: "KOWAHS_DISHES", brandId: kowahBrand.id },
    { title: "4U Heartlines Package Flyer", originalName: "WhatsApp Image 2026-09-03 at 10.31.47 PM.jpeg", url: "/images/gallery/WhatsApp Image 2026-09-03 at 10.31.47 PM.jpeg", category: "4U_HEARTLINES", brandId: heartlinesBrand.id },
    // Kowah's Dishes Food & Beverage
    { title: "Savory Bowl - Rich Beef Stew Pot", originalName: "WhatsApp Image 2026-09-03 at 10.18.38 PM.jpeg", url: "/images/gallery/WhatsApp Image 2026-09-03 at 10.18.38 PM.jpeg", category: "KOWAHS_DISHES", brandId: kowahBrand.id },
    { title: "Savory Bowl - Ghanaian Spiced Light Soup", originalName: "WhatsApp Image 2026-09-03 at 10.19.28 PM.jpeg", url: "/images/gallery/WhatsApp Image 2026-09-03 at 10.19.28 PM.jpeg", category: "KOWAHS_DISHES", brandId: kowahBrand.id },
    { title: "Savory Bowl - Beef & Fresh Vegetable Stew", originalName: "WhatsApp Image 2026-09-03 at 10.20.31 PM.jpeg", url: "/images/gallery/WhatsApp Image 2026-09-03 at 10.20.31 PM.jpeg", category: "KOWAHS_DISHES", brandId: kowahBrand.id },
    { title: "Hot Box - Sizzling Peppered Beef Medley", originalName: "WhatsApp Image 2026-09-03 at 10.21.06 PM.jpeg", url: "/images/gallery/WhatsApp Image 2026-09-03 at 10.21.06 PM.jpeg", category: "KOWAHS_DISHES", brandId: kowahBrand.id },
    { title: "Hot Box - Seasoned Grilled Meat Chunks Platter", originalName: "WhatsApp Image 2026-09-03 at 10.22.02 PM.jpeg", url: "/images/gallery/WhatsApp Image 2026-09-03 at 10.22.02 PM.jpeg", category: "KOWAHS_DISHES", brandId: kowahBrand.id },
    { title: "Fruity Sorrel Juice (Sobolo) Poster", originalName: "WhatsApp Image 2026-09-03 at 10.23.34 PM.jpeg", url: "/images/gallery/WhatsApp Image 2026-09-03 at 10.23.34 PM.jpeg", category: "KOWAHS_DISHES", brandId: kowahBrand.id },
    { title: "Homedine Shito - Black & Green Pepper Jars", originalName: "WhatsApp Image 2026-09-03 at 10.24.22 PM.jpeg", url: "/images/gallery/WhatsApp Image 2026-09-03 at 10.24.22 PM.jpeg", category: "KOWAHS_DISHES", brandId: kowahBrand.id },
    // 4U Heartlines - Verse & Velvet Gift Boxes
    { title: "Verse & Velvet - Girl Care Luxury Gift Box", originalName: "WhatsApp Image 2026-09-03 at 10.24.59 PM.jpeg", url: "/images/gallery/WhatsApp Image 2026-09-03 at 10.24.59 PM.jpeg", category: "4U_HEARTLINES", brandId: heartlinesBrand.id },
    { title: "Executive Appreciation - Gold Embossed Journal Suite", originalName: "WhatsApp Image 2026-09-03 at 10.25.52 PM (1).jpeg", url: "/images/gallery/WhatsApp Image 2026-09-03 at 10.25.52 PM (1).jpeg", category: "4U_HEARTLINES", brandId: heartlinesBrand.id },
    { title: "Verse & Velvet - Guy Care Luxury Gift Box", originalName: "WhatsApp Image 2026-09-03 at 10.25.52 PM.jpeg", url: "/images/gallery/WhatsApp Image 2026-09-03 at 10.25.52 PM.jpeg", category: "4U_HEARTLINES", brandId: heartlinesBrand.id },
    { title: "Executive Cream Journal & Citation Scroll Set", originalName: "WhatsApp Image 2026-09-03 at 10.29.27 PM.jpeg", url: "/images/gallery/WhatsApp Image 2026-09-03 at 10.29.27 PM.jpeg", category: "4U_HEARTLINES", brandId: heartlinesBrand.id },
    // 4U Heartlines - Ink & Emotion Poems & Citations
    { title: "Pictures & Poems - Tabletop Framed Poem & Photo", originalName: "WhatsApp Image 2026-09-03 at 10.27.18 PM.jpeg", url: "/images/gallery/WhatsApp Image 2026-09-03 at 10.27.18 PM.jpeg", category: "4U_HEARTLINES", brandId: heartlinesBrand.id },
    { title: "Poetic Keepsake Tag - Winter's Embrace", originalName: "WhatsApp Image 2026-09-03 at 10.30.14 PM.jpeg", url: "/images/gallery/WhatsApp Image 2026-09-03 at 10.30.14 PM.jpeg", category: "4U_HEARTLINES", brandId: heartlinesBrand.id },
    { title: "Poetic Candle Citation - Burning Soy Tumbler", originalName: "WhatsApp Image 2026-09-03 at 10.30.55 PM.jpeg", url: "/images/gallery/WhatsApp Image 2026-09-03 at 10.30.55 PM.jpeg", category: "4U_HEARTLINES", brandId: heartlinesBrand.id },
    { title: "Poetic Memos - Hardbound Gold-Foil Keepsake Booklet", originalName: "WhatsApp Image 2026-09-03 at 10.45.38 PM.jpeg", url: "/images/gallery/WhatsApp Image 2026-09-03 at 10.45.38 PM.jpeg", category: "4U_HEARTLINES", brandId: heartlinesBrand.id },
    { title: "Wax-Sealed Love Letters - 'To that person I like' by Kowah", originalName: "WhatsApp Image 2026-09-03 at 10.57.01 PM.jpeg", url: "/images/gallery/WhatsApp Image 2026-09-03 at 10.57.01 PM.jpeg", category: "4U_HEARTLINES", brandId: heartlinesBrand.id },
    { title: "Pictures & Poems - 'Heart lines to my forever person'", originalName: "WhatsApp Image 2026-09-03 at 11.00.28 PM.jpeg", url: "/images/gallery/WhatsApp Image 2026-09-03 at 11.00.28 PM.jpeg", category: "4U_HEARTLINES", brandId: heartlinesBrand.id },
    { title: "Celebration Keepsake - 'Best friends forever'", originalName: "WhatsApp Image 2026-09-03 at 11.07.34 PM.jpeg", url: "/images/gallery/WhatsApp Image 2026-09-03 at 11.07.34 PM.jpeg", category: "4U_HEARTLINES", brandId: heartlinesBrand.id },
    { title: "Pictures & Poems - 'when you cloud my thoughts' Album", originalName: "WhatsApp Image 2026-09-03 at 11.07.35 PM.jpeg", url: "/images/gallery/WhatsApp Image 2026-09-03 at 11.07.35 PM.jpeg", category: "4U_HEARTLINES", brandId: heartlinesBrand.id },
    // Founder Portrait
    { title: "Founder Portrait - Alberta Glory", originalName: "alberta-glory-founder.jpg", url: "/images/gallery/alberta-glory-founder.jpg", category: "FOUNDER", isHero: true },
  ];

  for (const media of mediaItems) {
    const existing = await prisma.media.findFirst({ where: { url: media.url } });
    if (!existing) {
      await prisma.media.create({ data: media });
    } else {
      await prisma.media.update({
        where: { id: existing.id },
        data: {
          title: media.title,
          category: media.category,
          brandId: media.brandId || null,
        },
      });
    }
  }

  console.log("Seeded CMS content blocks & media.");
  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
