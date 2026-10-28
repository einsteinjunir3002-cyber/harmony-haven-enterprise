const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const staticMediaList = [
  { title: 'Harmony Haven Enterprise Corporate Logo', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.14.23 PM.jpeg', category: 'BRANDING', mimeType: 'image/jpeg' },
  { title: "Kowah's Dishes Official Logo", url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.14.23 PM (1).jpeg', category: 'BRANDING', mimeType: 'image/jpeg' },
  { title: '4U HEARTLINES Official Logo', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.14.22 PM.jpeg', category: 'BRANDING', mimeType: 'image/jpeg' },
  { title: "Kowah's Dishes Official Menu Flyer", url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.31.46 PM.jpeg', category: 'KOWAHS_DISHES', mimeType: 'image/jpeg' },
  { title: 'Savory Bowl - Rich Beef Stew Pot', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.18.38 PM.jpeg', category: 'KOWAHS_DISHES', mimeType: 'image/jpeg' },
  { title: 'Savory Bowl - Ghanaian Spiced Light Soup', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.19.28 PM.jpeg', category: 'KOWAHS_DISHES', mimeType: 'image/jpeg' },
  { title: 'Savory Bowl - Beef & Fresh Vegetable Stew', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.20.31 PM.jpeg', category: 'KOWAHS_DISHES', mimeType: 'image/jpeg' },
  { title: 'Hot Box - Sizzling Peppered Beef Medley', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.21.06 PM.jpeg', category: 'KOWAHS_DISHES', mimeType: 'image/jpeg' },
  { title: 'Hot Box - Seasoned Grilled Meat Chunks Platter', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.22.02 PM.jpeg', category: 'KOWAHS_DISHES', mimeType: 'image/jpeg' },
  { title: 'Fruity Sorrel Juice (Sobolo) Poster', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.23.34 PM.jpeg', category: 'KOWAHS_DISHES', mimeType: 'image/jpeg' },
  { title: 'Homedine Shito - Black & Green Pepper Jars', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.24.22 PM.jpeg', category: 'KOWAHS_DISHES', mimeType: 'image/jpeg' },
  { title: '4U Heartlines Package Flyer', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.31.47 PM.jpeg', category: '4U_HEARTLINES', mimeType: 'image/jpeg' },
  { title: 'Verse & Velvet - Girl Care Luxury Gift Box', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.24.59 PM.jpeg', category: '4U_HEARTLINES', mimeType: 'image/jpeg' },
  { title: 'Executive Appreciation - Gold Embossed Journal Suite', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.25.52 PM (1).jpeg', category: '4U_HEARTLINES', mimeType: 'image/jpeg' },
  { title: 'Verse & Velvet - Guy Care Luxury Gift Box', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.25.52 PM.jpeg', category: '4U_HEARTLINES', mimeType: 'image/jpeg' },
  { title: 'Executive Cream Journal & Citation Scroll Set', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.29.27 PM.jpeg', category: '4U_HEARTLINES', mimeType: 'image/jpeg' },
  { title: 'Pictures & Poems - Tabletop Framed Poem & Photo', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.27.18 PM.jpeg', category: '4U_HEARTLINES', mimeType: 'image/jpeg' },
  { title: "Poetic Keepsake Tag - Winter's Embrace", url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.30.14 PM.jpeg', category: '4U_HEARTLINES', mimeType: 'image/jpeg' },
  { title: 'Poetic Candle Citation - Burning Soy Tumbler', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.30.55 PM.jpeg', category: '4U_HEARTLINES', mimeType: 'image/jpeg' },
  { title: 'Poetic Memos - Hardbound Gold-Foil Keepsake Booklet', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.45.38 PM.jpeg', category: '4U_HEARTLINES', mimeType: 'image/jpeg' },
  { title: "Wax-Sealed Love Letters - 'To that person I like' by Kowah", url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.57.01 PM.jpeg', category: '4U_HEARTLINES', mimeType: 'image/jpeg' },
  { title: "Pictures & Poems - 'Heart lines to my forever person'", url: '/images/gallery/WhatsApp Image 2026-09-03 at 11.00.28 PM.jpeg', category: '4U_HEARTLINES', mimeType: 'image/jpeg' },
  { title: "Celebration Keepsake - 'Best friends forever'", url: '/images/gallery/WhatsApp Image 2026-09-03 at 11.07.34 PM.jpeg', category: '4U_HEARTLINES', mimeType: 'image/jpeg' },
  { title: "Pictures & Poems - 'when you cloud my thoughts' Album", url: '/images/gallery/WhatsApp Image 2026-09-03 at 11.07.35 PM.jpeg', category: '4U_HEARTLINES', mimeType: 'image/jpeg' },
  { title: 'Founder Portrait - Alberta Glory', url: '/images/gallery/alberta-glory-founder.jpg', category: 'FOUNDER', mimeType: 'image/jpeg' },
];

async function run() {
  console.log('Seeding media items into Supabase...');
  for (const m of staticMediaList) {
    const existing = await prisma.media.findFirst({ where: { url: m.url } });
    if (!existing) {
      await prisma.media.create({
        data: {
          title: m.title,
          originalName: m.title,
          url: m.url,
          category: m.category,
          mimeType: m.mimeType,
          size: 102400,
        }
      });
      console.log('Created media item:', m.title);
    }
  }
  const count = await prisma.media.count();
  console.log('Total media records in Supabase now:', count);
  await prisma.$disconnect();
}

run().catch(console.error);
