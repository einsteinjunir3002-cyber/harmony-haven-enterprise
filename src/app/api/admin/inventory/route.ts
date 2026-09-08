import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    await requireAuth('STAFF');

    const products = await prisma.product.findMany({
      include: {
        brand: { select: { id: true, name: true, slug: true } },
        category: { select: { id: true, name: true, slug: true } },
        variants: true,
      },
      orderBy: [{ stockQuantity: 'asc' }, { name: 'asc' }],
    });

    const totalTracked = products.filter((p) => p.trackInventory).length;
    const outOfStock = products.filter((p) => p.trackInventory && p.stockQuantity <= 0).length;
    const lowStock = products.filter((p) => p.trackInventory && p.stockQuantity > 0 && p.stockQuantity <= 10).length;
    const inStock = products.filter((p) => p.trackInventory && p.stockQuantity > 10).length;

    return NextResponse.json({
      products,
      summary: {
        totalTracked,
        inStock,
        lowStock,
        outOfStock,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 403 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireAuth('ADMIN');
    const body = await request.json();
    const { productId, variantId, stockQuantity, trackInventory } = body;

    if (!productId && !variantId) {
      return NextResponse.json({ error: 'Product ID or Variant ID is required.' }, { status: 400 });
    }

    if (variantId) {
      const variant = await prisma.productVariant.update({
        where: { id: variantId },
        data: {
          stockQuantity: parseInt(stockQuantity, 10),
        },
      });

      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          actorName: user.name,
          action: 'UPDATE_VARIANT_STOCK',
          entity: 'ProductVariant',
          entityId: variant.id,
          newStateJson: JSON.stringify(variant),
        },
      });

      return NextResponse.json({ success: true, variant });
    }

    if (productId) {
      const dataToUpdate: any = {};
      if (stockQuantity !== undefined) {
        dataToUpdate.stockQuantity = parseInt(stockQuantity, 10);
      }
      if (trackInventory !== undefined) {
        dataToUpdate.trackInventory = Boolean(trackInventory);
      }

      const product = await prisma.product.update({
        where: { id: productId },
        data: dataToUpdate,
      });

      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          actorName: user.name,
          action: 'UPDATE_INVENTORY_STOCK',
          entity: 'Product',
          entityId: product.id,
          newStateJson: JSON.stringify(product),
        },
      });

      return NextResponse.json({ success: true, product });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error: any) {
    console.error('Update inventory error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update stock' }, { status: 500 });
  }
}
