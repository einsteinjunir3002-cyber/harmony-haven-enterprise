import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET() {
  try {
    await requireAuth('STAFF');
    const brands = await prisma.brand.findMany({
      include: {
        categories: true,
        _count: { select: { products: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ brands });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth('ADMIN');
    const body = await request.json();
    const { name, tagline, description, logo, banner, primaryColor, secondaryColor, active, sortOrder } = body;

    if (!name) {
      return NextResponse.json({ error: 'Brand name is required.' }, { status: 400 });
    }

    const baseSlug = slugify(name);
    let finalSlug = baseSlug;
    let count = 1;
    while (await prisma.brand.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${count++}`;
    }

    const newBrand = await prisma.$transaction(async (tx) => {
      const brand = await tx.brand.create({
        data: {
          name: name.trim(),
          slug: finalSlug,
          tagline: tagline ? tagline.trim() : null,
          description: description ? description.trim() : null,
          logo: logo || null,
          banner: banner || null,
          primaryColor: primaryColor || '#0a4d52',
          secondaryColor: secondaryColor || '#d4af37',
          active: active !== undefined ? Boolean(active) : true,
          sortOrder: sortOrder ? parseInt(sortOrder, 10) : 0,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: user.id,
          actorName: user.name,
          action: 'CREATE_BRAND',
          entity: 'Brand',
          entityId: brand.id,
          newStateJson: JSON.stringify(brand),
        },
      });

      return brand;
    });

    return NextResponse.json({ success: true, brand: newBrand });
  } catch (error: any) {
    console.error('Create brand error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create brand' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireAuth('ADMIN');
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Brand ID is required.' }, { status: 400 });
    }

    const previous = await prisma.brand.findUnique({ where: { id } });

    const updated = await prisma.$transaction(async (tx) => {
      const brand = await tx.brand.update({
        where: { id },
        data: updateData,
      });

      await tx.auditLog.create({
        data: {
          actorId: user.id,
          actorName: user.name,
          action: 'UPDATE_BRAND',
          entity: 'Brand',
          entityId: id,
          previousStateJson: JSON.stringify(previous),
          newStateJson: JSON.stringify(brand),
        },
      });

      return brand;
    });

    return NextResponse.json({ success: true, brand: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update brand' }, { status: 500 });
  }
}
