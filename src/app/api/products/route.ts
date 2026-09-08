import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const brandSlug = searchParams.get('brand');
    const categorySlug = searchParams.get('category');
    const query = searchParams.get('q');
    const featured = searchParams.get('featured');

    const where: any = { active: true };

    if (brandSlug) {
      where.brand = { slug: brandSlug };
    }

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (featured === 'true') {
      where.featured = true;
    }

    if (query) {
      where.OR = [
        { name: { contains: query } },
        { description: { contains: query } },
        { shortDescription: { contains: query } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        brand: {
          select: { id: true, name: true, slug: true, primaryColor: true },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
        variants: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error('Products API error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
