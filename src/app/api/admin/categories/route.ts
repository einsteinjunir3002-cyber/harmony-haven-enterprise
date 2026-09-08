import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET() {
  try {
    await requireAuth('STAFF');

    const categories = await prisma.category.findMany({
      include: {
        brand: {
          select: { id: true, name: true, slug: true, primaryColor: true },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: [{ brandId: 'asc' }, { sortOrder: 'asc' }],
    });

    const brands = await prisma.brand.findMany({
      where: { active: true },
      select: { id: true, name: true, slug: true },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ categories, brands });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth('ADMIN');
    const body = await request.json();
    const { brandId, name, description, image, active, sortOrder } = body;

    if (!brandId || !name) {
      return NextResponse.json({ error: 'Brand and Category Name are required.' }, { status: 400 });
    }

    const baseSlug = slugify(name);
    let finalSlug = baseSlug;
    let count = 1;
    while (await prisma.category.findFirst({ where: { brandId, slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${count++}`;
    }

    const category = await prisma.$transaction(async (tx) => {
      const cat = await tx.category.create({
        data: {
          brandId,
          name: name.trim(),
          slug: finalSlug,
          description: description ? description.trim() : null,
          image: image || null,
          active: active !== undefined ? Boolean(active) : true,
          sortOrder: sortOrder ? parseInt(sortOrder, 10) : 0,
        },
        include: {
          brand: true,
          _count: { select: { products: true } },
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: user.id,
          actorName: user.name,
          action: 'CREATE_CATEGORY',
          entity: 'Category',
          entityId: cat.id,
          newStateJson: JSON.stringify(cat),
        },
      });

      return cat;
    });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    console.error('Create category error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create category' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireAuth('ADMIN');
    const body = await request.json();
    const { id, brandId, name, slug, description, image, active, sortOrder } = body;

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required.' }, { status: 400 });
    }

    const previous = await prisma.category.findUnique({ where: { id } });
    if (!previous) {
      return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
    }

    let finalSlug = slug ? slugify(slug) : previous.slug;
    if (name && !slug && name !== previous.name) {
      finalSlug = slugify(name);
    }

    // Check slug collision
    const existingSlug = await prisma.category.findFirst({
      where: {
        brandId: brandId || previous.brandId,
        slug: finalSlug,
        id: { not: id },
      },
    });

    if (existingSlug) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const cat = await tx.category.update({
        where: { id },
        data: {
          brandId: brandId || previous.brandId,
          name: name ? name.trim() : previous.name,
          slug: finalSlug,
          description: description !== undefined ? (description ? description.trim() : null) : previous.description,
          image: image !== undefined ? image : previous.image,
          active: active !== undefined ? Boolean(active) : previous.active,
          sortOrder: sortOrder !== undefined ? parseInt(sortOrder, 10) : previous.sortOrder,
        },
        include: {
          brand: true,
          _count: { select: { products: true } },
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: user.id,
          actorName: user.name,
          action: 'UPDATE_CATEGORY',
          entity: 'Category',
          entityId: cat.id,
          previousStateJson: JSON.stringify(previous),
          newStateJson: JSON.stringify(cat),
        },
      });

      return cat;
    });

    return NextResponse.json({ success: true, category: updated });
  } catch (error: any) {
    console.error('Update category error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireAuth('ADMIN');
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required.' }, { status: 400 });
    }

    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // Unlink any products from this category safely before deletion
      await tx.product.updateMany({
        where: { categoryId: id },
        data: { categoryId: null },
      });

      await tx.category.delete({ where: { id } });

      await tx.auditLog.create({
        data: {
          actorId: user.id,
          actorName: user.name,
          action: 'DELETE_CATEGORY',
          entity: 'Category',
          entityId: id,
          previousStateJson: JSON.stringify(category),
        },
      });
    });

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error: any) {
    console.error('Delete category error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete category' }, { status: 500 });
  }
}
