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
    { name: "Accra Central & Ring Road", region: "Greater Accra", fee: 25.0, estimatedTime: "Same Day (2-4 hrs)" },
    { name: "East Legon, Airport, Dzorwulu", region: "Greater Accra", fee: 30.0, estimatedTime: "Same Day (2-4 hrs)" },
    { name: "Tema, Spintex & Sakumono", region: "Greater Accra", fee: 35.0, estimatedTime: "Same Day (3-5 hrs)" },
    { name: "Madina, Adenta & Haatso", region: "Greater Accra", fee: 35.0, estimatedTime: "Same Day (3-5 hrs)" },
    { name: "Dansoman, Weija & Kasoa", region: "Greater Accra", fee: 40.0, estimatedTime: "Same Day (4-6 hrs)" },
    { name: "Kumasi Metropolis", region: "Ashanti", fee: 50.0, estimatedTime: "Next Day Dispatch" },
    { name: "Takoradi / Cape Coast", region: "Western / Central", fee: 55.0, estimatedTime: "Next Day Dispatch" },
    { name: "Nationwide Express Courier", region: "All Regions", fee: 65.0, estimatedTime: "24 - 48 hours" },
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
    update: {},
    create: {
      name: "Kowah's Dishes",
      slug: "kowahs-dishes",
      tagline: "Cook Less, Live More!",
      description: "Fresh from our pot to your fridge. Modern Ghanaian homemade culinary experience crafted with deep passion and authentic spices.",
      primaryColor: "#4a2818",
      secondaryColor: "#c59b27",
      active: true,
      sortOrder: 1,
    },
  });

  // Brand 2: 4U HEARTLINES
  const heartlinesBrand = await prisma.brand.upsert({
    where: { slug: "4u-heartlines" },
    update: {},
    create: {
      name: "4U HEARTLINES",
      slug: "4u-heartlines",
      tagline: "Where feelings find their words; from your heart through our pen.",
      description: "Thoughtful gifts. Personal words. Meaningful moments. A bespoke creative studio bringing emotions to life through curated gift experiences and poetry.",
      primaryColor: "#0a4d52",
      secondaryColor: "#c59b27",
      active: true,
      sortOrder: 2,
    },
  });

  // 4. Create Categories for Kowah's Dishes
  const kowahCatSavory = await prisma.category.upsert({
    where: { brandId_slug: { brandId: kowahBrand.id, slug: "savory-bowl" } },
    update: {},
    create: {
      brandId: kowahBrand.id,
      name: "Savory Bowl",
      slug: "savory-bowl",
      description: "Traditional and modern Ghanaian soups and stews simmered to perfection.",
      sortOrder: 1,
    },
  });

  const kowahCatHotBox = await prisma.category.upsert({
    where: { brandId_slug: { brandId: kowahBrand.id, slug: "hot-box" } },
    update: {},
    create: {
      brandId: kowahBrand.id,
      name: "Hot Box",
      slug: "hot-box",
      description: "Assorted seasoned grilled meats and savoury protein selections.",
      sortOrder: 2,
    },
  });

  const kowahCatSorrel = await prisma.category.upsert({
    where: { brandId_slug: { brandId: kowahBrand.id, slug: "fruity-sorrel-juice" } },
    update: {},
    create: {
      brandId: kowahBrand.id,
      name: "Fruity Sorrel Juice",
      slug: "fruity-sorrel-juice",
      description: "Refreshing fruity spiced sorrel brewed with natural herbs and tropical fruits.",
      sortOrder: 3,
    },
  });

  const kowahCatShito = await prisma.category.upsert({
    where: { brandId_slug: { brandId: kowahBrand.id, slug: "shito" } },
    update: {},
    create: {
      brandId: kowahBrand.id,
      name: "Shito",
      slug: "shito",
      description: "Rich, aromatic Ghanaian black pepper sauce with dried seafood and peppers.",
      sortOrder: 4,
    },
  });

  // 5. Create Categories for 4U HEARTLINES
  const heartCatVerseVelvet = await prisma.category.upsert({
    where: { brandId_slug: { brandId: heartlinesBrand.id, slug: "verse-and-velvet" } },
    update: {},
    create: {
      brandId: heartlinesBrand.id,
      name: "VERSE & VELVET",
      slug: "verse-and-velvet",
      description: "Curated gift experiences filled with luxury surprises, treats and emotion.",
      sortOrder: 1,
    },
  });

  const heartCatInkEmotion = await prisma.category.upsert({
    where: { brandId_slug: { brandId: heartlinesBrand.id, slug: "ink-and-emotion" } },
    update: {},
    create: {
      brandId: heartlinesBrand.id,
      name: "INK & EMOTION",
      slug: "ink-and-emotion",
      description: "Personalized writing, bespoke poetry, candle citations, and timeless keepsakes.",
      sortOrder: 2,
    },
  });

  // 6. Seed Products for Kowah's Dishes
  const kowahProducts = [
    {
      brandId: kowahBrand.id,
      categoryId: kowahCatSavory.id,
      name: "Savory Bowl - Signature Soup & Stew Pot",
      slug: "savory-bowl-signature-pot",
      description: "Richly spiced Ghanaian homemade soup or stew freshly simmered with authentic local herbs, cow foot, goat meat, or smoked fish. Stored fresh from our pot to your fridge so you can cook less and live more.",
      shortDescription: "Freshly simmered Ghanaian homemade soup or stew.",
      price: 120.0,
      compareAtPrice: 140.0,
      type: "MADE_TO_ORDER",
      featured: true,
      images: JSON.stringify(["/images/gallery/WhatsApp Image 2026-09-03 at 10.22.02 PM.jpeg", "/images/gallery/WhatsApp Image 2026-09-03 at 10.21.06 PM.jpeg"]),
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
      name: "Hot Box - Assorted Grilled Meats",
      slug: "hot-box-assorted-meats",
      description: "A sizzling assortment of succulent grilled meats, tender goat cubes, spicy chicken wings, and seasoned beef cuts marinated in Kowah's signature herb blend.",
      shortDescription: "Sizzling platter of seasoned and grilled assorted meats.",
      price: 145.0,
      compareAtPrice: 165.0,
      type: "MADE_TO_ORDER",
      featured: true,
      images: JSON.stringify(["/images/gallery/WhatsApp Image 2026-09-03 at 10.20.31 PM.jpeg", "/images/gallery/WhatsApp Image 2026-09-03 at 10.27.18 PM.jpeg"]),
      variants: [
        { name: "Classic Box (Beef, Gizzard & Spicy Wings)", priceAdjustment: 0, stockQuantity: 40 },
        { name: "Meat Lovers Deluxe (Goat, Beef, Pork & Sausage)", priceAdjustment: 45, stockQuantity: 30 },
        { name: "Party Mega Platter", priceAdjustment: 110, stockQuantity: 15 },
      ],
    },
    {
      brandId: kowahBrand.id,
      categoryId: kowahCatSorrel.id,
      name: "Fruity Sorrel Juice",
      slug: "fruity-sorrel-juice",
      description: "Naturally brewed spiced hibiscus (Sobolo) infused with fresh pineapple, ginger, cloves, and natural citrus. Completely refreshing and revitalizing.",
      shortDescription: "Spiced refreshing Ghanaian hibiscus & tropical fruit infusion.",
      price: 25.0,
      compareAtPrice: 30.0,
      type: "PHYSICAL_PRODUCT",
      featured: true,
      images: JSON.stringify(["/images/gallery/WhatsApp Image 2026-09-03 at 10.45.38 PM.jpeg", "/images/gallery/WhatsApp Image 2026-09-03 at 10.31.46 PM.jpeg"]),
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
      name: "Kowah's Rich Ghanaian Shito",
      slug: "kowahs-rich-ghanaian-shito",
      description: "Authentic dark Ghanaian pepper sauce slowly caramelised with dried shrimp, smoked fish, ginger, and scotch bonnet peppers. Delicious with rice, kenkey, yam, and snacks.",
      shortDescription: "Caramelised Ghanaian black pepper sauce packed with dried seafood.",
      price: 45.0,
      compareAtPrice: 50.0,
      type: "PHYSICAL_PRODUCT",
      featured: true,
      images: JSON.stringify(["/images/gallery/WhatsApp Image 2026-09-03 at 10.31.47 PM.jpeg", "/images/gallery/WhatsApp Image 2026-09-03 at 10.30.55 PM.jpeg"]),
      variants: [
        { name: "Regular Jar (350g)", priceAdjustment: 0, stockQuantity: 60 },
        { name: "Large Jar (500g)", priceAdjustment: 25, stockQuantity: 40 },
        { name: "Family Jumbo Jar (1kg)", priceAdjustment: 65, stockQuantity: 25 },
        { name: "Extra Spicy Blend (500g)", priceAdjustment: 30, stockQuantity: 30 },
      ],
    },
  ];

  for (const item of kowahProducts) {
    const { variants, ...prodData } = item;
    const product = await prisma.product.upsert({
      where: { slug: prodData.slug },
      update: prodData,
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
      name: "Glee Box",
      slug: "glee-box",
      description: "A joyful curation of luxury confectionery, keepsake scented items, personalized handwritten notes, and celebration delights designed to bring pure glee to someone special.",
      shortDescription: "A burst of joy, curated sweets, keepsakes, and personalized messages.",
      price: 250.0,
      compareAtPrice: 280.0,
      type: "CUSTOM_PRODUCT",
      featured: true,
      images: JSON.stringify(["/images/gallery/WhatsApp Image 2026-09-03 at 10.57.01 PM.jpeg", "/images/gallery/WhatsApp Image 2026-09-03 at 11.07.34 PM.jpeg"]),
      variants: [
        { name: "Standard Glee Box", priceAdjustment: 0, stockQuantity: 25 },
        { name: "Deluxe Glee Box (Includes Aromatic Candle & Wine)", priceAdjustment: 95, stockQuantity: 20 },
      ],
    },
    {
      brandId: heartlinesBrand.id,
      categoryId: heartCatVerseVelvet.id,
      name: "Snack Box",
      slug: "snack-box",
      description: "Artisanal assortment of premium treats, chocolates, savoury crisps, fresh juice, and thoughtful personalized tags.",
      shortDescription: "A delightful box of handpicked gourmet treats and personalized snacks.",
      price: 180.0,
      compareAtPrice: 200.0,
      type: "CUSTOM_PRODUCT",
      featured: false,
      images: JSON.stringify(["/images/gallery/WhatsApp Image 2026-09-03 at 10.30.14 PM.jpeg", "/images/gallery/WhatsApp Image 2026-09-03 at 10.29.27 PM.jpeg"]),
      variants: [
        { name: "Sweet & Savory Combo", priceAdjustment: 0, stockQuantity: 30 },
        { name: "Executive Gourmet Snack Box", priceAdjustment: 75, stockQuantity: 20 },
      ],
    },
    {
      brandId: heartlinesBrand.id,
      categoryId: heartCatVerseVelvet.id,
      name: "Girl Care Box",
      slug: "girl-care-box",
      description: "A pampering self-care sanctuary in a box. Includes organic skincare, silk accessories, scented diffuser, comforting chocolates, and an uplifting poem.",
      shortDescription: "Luxurious self-care, wellness, and beauty essentials paired with poetry.",
      price: 320.0,
      compareAtPrice: 360.0,
      type: "CUSTOM_PRODUCT",
      featured: true,
      images: JSON.stringify(["/images/gallery/WhatsApp Image 2026-09-03 at 11.00.28 PM.jpeg", "/images/gallery/WhatsApp Image 2026-09-03 at 10.57.01 PM.jpeg"]),
      variants: [
        { name: "Bliss Essentials Box", priceAdjustment: 0, stockQuantity: 20 },
        { name: "Royalty Pamper Suite", priceAdjustment: 110, stockQuantity: 15 },
      ],
    },
    {
      brandId: heartlinesBrand.id,
      categoryId: heartCatVerseVelvet.id,
      name: "Guy Care Box",
      slug: "guy-care-box",
      description: "Sophisticated gentleman's curation featuring luxury grooming items, premium cologne tester, leather keepsake, treats, and an empowering poetic citation.",
      shortDescription: "Premium grooming, lifestyle essentials, and a tailored citation for him.",
      price: 320.0,
      compareAtPrice: 360.0,
      type: "CUSTOM_PRODUCT",
      featured: false,
      images: JSON.stringify(["/images/gallery/WhatsApp Image 2026-09-03 at 10.25.52 PM (1).jpeg", "/images/gallery/WhatsApp Image 2026-09-03 at 10.25.52 PM.jpeg"]),
      variants: [
        { name: "Gentleman's Choice", priceAdjustment: 0, stockQuantity: 20 },
        { name: "Signature Prestige Box", priceAdjustment: 110, stockQuantity: 15 },
      ],
    },
    {
      brandId: heartlinesBrand.id,
      categoryId: heartCatVerseVelvet.id,
      name: "Special Day Box",
      slug: "special-day-box",
      description: "The ultimate milestone celebration gift. Tailored for birthdays, weddings, anniversaries, or achievements with custom thematic styling and heartfelt keepsakes.",
      shortDescription: "Grand milestone celebration gift box with customized memorabilia.",
      price: 450.0,
      compareAtPrice: 500.0,
      type: "CUSTOM_PRODUCT",
      featured: true,
      images: JSON.stringify(["/images/gallery/WhatsApp Image 2026-09-03 at 10.24.59 PM.jpeg", "/images/gallery/WhatsApp Image 2026-09-03 at 10.24.22 PM.jpeg"]),
      variants: [
        { name: "Anniversary Special", priceAdjustment: 0, stockQuantity: 15 },
        { name: "Birthday Deluxe Jubilee", priceAdjustment: 50, stockQuantity: 15 },
      ],
    },
    {
      brandId: heartlinesBrand.id,
      categoryId: heartCatInkEmotion.id,
      name: "Pictures & Poems",
      slug: "pictures-and-poems",
      description: "A bespoke artistic composition pairing your treasured photograph with an original, deeply emotional custom poem written exclusively for your recipient.",
      shortDescription: "Bespoke custom poem woven from your story, elegantly framed with your photo.",
      price: 160.0,
      compareAtPrice: 180.0,
      type: "SERVICE",
      featured: true,
      images: JSON.stringify(["/images/gallery/WhatsApp Image 2026-09-03 at 10.23.34 PM.jpeg", "/images/gallery/WhatsApp Image 2026-09-03 at 10.18.38 PM.jpeg"]),
      variants: [
        { name: "Standard A4 Luxury Framed Print", priceAdjustment: 0, stockQuantity: 50 },
        { name: "A3 Grand Statement Frame", priceAdjustment: 60, stockQuantity: 30 },
      ],
    },
    {
      brandId: heartlinesBrand.id,
      categoryId: heartCatInkEmotion.id,
      name: "Poetic Citations",
      slug: "poetic-citations",
      description: "Prestigious poetic citations honoring life milestones, career achievements, retirements, or eternal declarations of love, mounted on crystal-clear acrylic or mahogany plaque.",
      shortDescription: "Honour roll and milestone citation with eloquent custom phrasing.",
      price: 220.0,
      compareAtPrice: 250.0,
      type: "SERVICE",
      featured: true,
      images: JSON.stringify(["/images/gallery/WhatsApp Image 2026-09-03 at 10.19.28 PM.jpeg", "/images/gallery/WhatsApp Image 2026-09-03 at 10.14.23 PM (1).jpeg"]),
      variants: [
        { name: "Acrylic Desktop Plaque", priceAdjustment: 0, stockQuantity: 40 },
        { name: "Polished Wooden Crest Citation", priceAdjustment: 75, stockQuantity: 25 },
      ],
    },
    {
      brandId: heartlinesBrand.id,
      categoryId: heartCatInkEmotion.id,
      name: "Poetic Candle Citations",
      slug: "poetic-candle-citations",
      description: "Hand-poured aromatic soy candles wrapped with a custom metallic gold foil poem or citation that reveals heartwarming fragrance as it burns.",
      shortDescription: "Hand-poured aromatherapy candle featuring a personalized poetic label.",
      price: 140.0,
      compareAtPrice: 160.0,
      type: "CUSTOM_PRODUCT",
      featured: false,
      images: JSON.stringify(["/images/gallery/WhatsApp Image 2026-09-03 at 10.14.23 PM.jpeg", "/images/gallery/WhatsApp Image 2026-09-03 at 10.14.22 PM.jpeg"]),
      variants: [
        { name: "Vanilla & Amber Glow (250g)", priceAdjustment: 0, stockQuantity: 35 },
        { name: "Sandalwood & Jasmine Luxe (400g)", priceAdjustment: 40, stockQuantity: 25 },
      ],
    },
    {
      brandId: heartlinesBrand.id,
      categoryId: heartCatInkEmotion.id,
      name: "Poetic Memos",
      slug: "poetic-memos",
      description: "Vintage parchment scrolls with hand-poured botanical wax seals containing intimate personalized verses or secret messages for someone unforgettable.",
      shortDescription: "Wax-sealed vintage parchment scroll with custom handwritten poetry.",
      price: 95.0,
      compareAtPrice: 110.0,
      type: "SERVICE",
      featured: false,
      images: JSON.stringify(["/images/gallery/WhatsApp Image 2026-09-03 at 10.18.38 PM.jpeg", "/images/gallery/WhatsApp Image 2026-09-03 at 10.19.28 PM.jpeg"]),
      variants: [
        { name: "Single Wax-Sealed Scroll in Keepsake Tube", priceAdjustment: 0, stockQuantity: 60 },
        { name: "Locket-Ready Mini Memo & Velvet Pouch", priceAdjustment: 35, stockQuantity: 40 },
      ],
    },
  ];

  for (const item of heartlinesProducts) {
    const { variants, ...prodData } = item;
    const product = await prisma.product.upsert({
      where: { slug: prodData.slug },
      update: prodData,
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
      title: "Welcome Section",
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
        headline: "One Vision. Multiple Expressions.",
        story: "Founded in Ghana, Harmony Haven Enterprise emerged with a clear ambition: to build distinctive homegrown brands that touch everyday lives with excellence, authenticity, and heart. By merging culinary craftsmanship in Kowah's Dishes with emotive gifting in 4U HEARTLINES, we cultivate unique touchpoints of joy for our community.",
      }),
    },
    {
      key: "about.vision",
      title: "Vision",
      section: "about",
      contentJson: JSON.stringify({
        text: "To build a diverse, sustainable and impactful enterprise that creates meaningful experiences and opportunities through innovative brands.",
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
        photo: "/images/gallery/WhatsApp Image 2026-09-03 at 10.24.22 PM.jpeg",
      }),
    },
  ];

  for (const block of contentBlocks) {
    await prisma.contentBlock.upsert({
      where: { key: block.key },
      update: block,
      create: block,
    });
  }

  // 9. Seed Media Metadata from gallery
  const mediaItems = [
    { title: "Kowah Savory Soup Pot", originalName: "WhatsApp Image 2026-09-03 at 10.22.02 PM.jpeg", url: "/images/gallery/WhatsApp Image 2026-09-03 at 10.22.02 PM.jpeg", category: "PRODUCT", brandId: kowahBrand.id },
    { title: "Kowah Hot Box Platter", originalName: "WhatsApp Image 2026-09-03 at 10.20.31 PM.jpeg", url: "/images/gallery/WhatsApp Image 2026-09-03 at 10.20.31 PM.jpeg", category: "PRODUCT", brandId: kowahBrand.id },
    { title: "Fruity Sorrel Juice Bottle", originalName: "WhatsApp Image 2026-09-03 at 10.45.38 PM.jpeg", url: "/images/gallery/WhatsApp Image 2026-09-03 at 10.45.38 PM.jpeg", category: "PRODUCT", brandId: kowahBrand.id },
    { title: "Rich Ghanaian Shito Jar", originalName: "WhatsApp Image 2026-09-03 at 10.31.47 PM.jpeg", url: "/images/gallery/WhatsApp Image 2026-09-03 at 10.31.47 PM.jpeg", category: "PRODUCT", brandId: kowahBrand.id },
    { title: "4U Heartlines Luxury Glee Box", originalName: "WhatsApp Image 2026-09-03 at 10.57.01 PM.jpeg", url: "/images/gallery/WhatsApp Image 2026-09-03 at 10.57.01 PM.jpeg", category: "PRODUCT", brandId: heartlinesBrand.id },
    { title: "4U Heartlines Pamper Box", originalName: "WhatsApp Image 2026-09-03 at 11.00.28 PM.jpeg", url: "/images/gallery/WhatsApp Image 2026-09-03 at 11.00.28 PM.jpeg", category: "PRODUCT", brandId: heartlinesBrand.id },
    { title: "4U Heartlines Poetic Candle", originalName: "WhatsApp Image 2026-09-03 at 10.14.23 PM.jpeg", url: "/images/gallery/WhatsApp Image 2026-09-03 at 10.14.23 PM.jpeg", category: "PRODUCT", brandId: heartlinesBrand.id },
    { title: "4U Heartlines Framed Poem Citation", originalName: "WhatsApp Image 2026-09-03 at 10.19.28 PM.jpeg", url: "/images/gallery/WhatsApp Image 2026-09-03 at 10.19.28 PM.jpeg", category: "PRODUCT", brandId: heartlinesBrand.id },
    { title: "Founder Portrait", originalName: "WhatsApp Image 2026-09-03 at 10.24.22 PM.jpeg", url: "/images/gallery/WhatsApp Image 2026-09-03 at 10.24.22 PM.jpeg", category: "FOUNDER", isHero: true },
  ];

  for (const media of mediaItems) {
    const existing = await prisma.media.findFirst({ where: { url: media.url } });
    if (!existing) {
      await prisma.media.create({ data: media });
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
