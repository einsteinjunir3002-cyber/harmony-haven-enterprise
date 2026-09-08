import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET() {
  try {
    await requireAuth('STAFF');

    const products = await prisma.product.findMany({
      include: {
        brand: true,
        category: true,
        variants: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ products });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth('ADMIN');
    const body = await request.json();

    const {
      brandId,
      categoryId,
      name,
      description,
      shortDescription,
      price,
      compareAtPrice,
      sku,
      type,
      active,
      featured,
      trackInventory,
      stockQuantity,
      images,
      variants,
    } = body;

    if (!brandId || !name || price === undefined) {
      return NextResponse.json({ error: 'Brand, name, and price are required.' }, { status: 400 });
    }

    const baseSlug = slugify(name);
    let finalSlug = baseSlug;
    let count = 1;
    while (await prisma.product.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${count++}`;
    }

    const product = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.create({
        data: {
          brandId,
          categoryId: categoryId || null,
          name: name.trim(),
          slug: finalSlug,
          description: description || '',
          shortDescription: shortDescription || null,
          price: parseFloat(price),
          compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
          sku: sku || null,
          type: type || 'PHYSICAL_PRODUCT',
          active: active !== undefined ? Boolean(active) : true,
          featured: Boolean(featured),
          trackInventory: trackInventory !== undefined ? Boolean(trackInventory) : true,
          stockQuantity: stockQuantity ? parseInt(stockQuantity, 10) : 100,
          images: Array.isArray(images) ? JSON.stringify(images) : typeof images === 'string' ? images : '[]',
        },
      });

      if (variants && Array.isArray(variants) && variants.length > 0) {
        for (const v of variants) {
          if (v.name) {
            await tx.productVariant.create({
              data: {
                productId: prod.id,
                name: v.name,
                priceAdjustment: parseFloat(v.priceAdjustment || 0),
                stockQuantity: parseInt(v.stockQuantity || 50, 10),
                optionsJson: v.optionsJson ? JSON.stringify(v.optionsJson) : '{}',
              },
            });
          }
        }
      }

      await tx.auditLog.create({
        data: {
          actorId: user.id,
          actorName: user.name,
          action: 'CREATE_PRODUCT',
          entity: 'Product',
          entityId: prod.id,
          newStateJson: JSON.stringify(prod),
        },
      });

      return prod;
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error('Admin product create error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireAuth('ADMIN');
    const body = await request.json();
    const { id, variants, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required.' }, { status: 400 });
    }

    const previousProduct = await prisma.product.findUnique({ where: { id } });

    const updated = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.update({
        where: { id },
        data: {
          ...updateData,
          price: updateData.price !== undefined ? parseFloat(updateData.price) : undefined,
          compareAtPrice: updateData.compareAtPrice !== undefined ? (updateData.compareAtPrice ? parseFloat(updateData.compareAtPrice) : null) : undefined,
          stockQuantity: updateData.stockQuantity !== undefined ? parseInt(updateData.stockQuantity, 10) : undefined,
          images: Array.isArray(updateData.images) ? JSON.stringify(updateData.images) : updateData.images,
        },
      });

      // Update or create variants if provided
      if (variants && Array.isArray(variants)) {
        await tx.productVariant.deleteMany({ where: { productId: id } });
        for (const v of variants) {
          if (v.name) {
            await tx.productVariant.create({
              data: {
                productId: id,
                name: v.name,
                priceAdjustment: parseFloat(v.priceAdjustment || 0),
                stockQuantity: parseInt(v.stockQuantity || 50, 10),
                optionsJson: typeof v.optionsJson === 'object' ? JSON.stringify(v.optionsJson) : (v.optionsJson || '{}'),
              },
            });
          }
        }
      }

      await tx.auditLog.create({
        data: {
          actorId: user.id,
          actorName: user.name,
          action: 'UPDATE_PRODUCT',
          entity: 'Product',
          entityId: id,
          previousStateJson: JSON.stringify(previousProduct),
          newStateJson: JSON.stringify(prod),
        },
      });

      return prod;
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error('Admin product update error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireAuth('ADMIN');
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required.' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.productVariant.deleteMany({ where: { productId: id } });
      await tx.product.delete({ where: { id } });
      await tx.auditLog.create({
        data: {
          actorId: user.id,
          actorName: user.name,
          action: 'DELETE_PRODUCT',
          entity: 'Product',
          entityId: id,
        },
      });
    });

    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete product' }, { status: 500 });
  }
}
