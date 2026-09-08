import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
      include: {
        brand: true,
        category: true,
        variants: {
          orderBy: { priceAdjustment: 'asc' },
        },
      },
    });

    if (!product || !product.active) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Related products in the same category or brand
    const relatedProducts = await prisma.product.findMany({
      where: {
        brandId: product.brandId,
        id: { not: product.id },
        active: true,
      },
      take: 4,
      include: {
        brand: { select: { name: true, slug: true } },
        variants: true,
      },
    });

    return NextResponse.json({ product, relatedProducts });
  } catch (error) {
    console.error('Product details API error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
