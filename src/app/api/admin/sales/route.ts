import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    await requireAuth('STAFF');

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'all';

    let dateFilter: any = undefined;
    const now = new Date();

    if (range === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateFilter = { gte: startOfDay };
    } else if (range === '7d') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { gte: sevenDaysAgo };
    } else if (range === '30d') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { gte: thirtyDaysAgo };
    }

    const whereClause: any = {};
    if (dateFilter) {
      whereClause.createdAt = dateFilter;
    }

    const [allOrders, paidOrders, brands] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        include: {
          payments: true,
          items: {
            include: {
              product: {
                select: { id: true, name: true, brandId: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.findMany({
        where: {
          ...whereClause,
          paymentStatus: 'PAID',
        },
        include: {
          payments: true,
          items: {
            include: {
              product: {
                select: { id: true, name: true, brandId: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.brand.findMany({
        select: { id: true, name: true, slug: true, primaryColor: true },
      }),
    ]);

    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrdersCount = allOrders.length;
    const paidOrdersCount = paidOrders.length;
    const pendingOrdersCount = allOrders.filter((o) => o.paymentStatus !== 'PAID').length;
    const pendingRevenue = allOrders
      .filter((o) => o.paymentStatus !== 'PAID')
      .reduce((sum, o) => sum + o.total, 0);
    const averageOrderValue = paidOrdersCount > 0 ? totalRevenue / paidOrdersCount : 0;

    // Brand sales breakdown
    const brandSales: { [brandId: string]: { name: string; revenue: number; ordersCount: number; color: string } } = {};
    for (const b of brands) {
      brandSales[b.id] = {
        name: b.name,
        revenue: 0,
        ordersCount: 0,
        color: b.primaryColor || '#0a4d52',
      };
    }

    // Payment methods breakdown
    const paymentMethods: { [method: string]: { count: number; revenue: number } } = {};

    for (const ord of paidOrders) {
      const method = ord.payments?.[0]?.provider || 'PAYSTACK_MOMO';
      if (!paymentMethods[method]) {
        paymentMethods[method] = { count: 0, revenue: 0 };
      }
      paymentMethods[method].count += 1;
      paymentMethods[method].revenue += ord.total;

      const orderBrandIds = new Set<string>();
      for (const item of ord.items) {
        if (item.product?.brandId && brandSales[item.product.brandId]) {
          brandSales[item.product.brandId].revenue += item.totalPrice;
          orderBrandIds.add(item.product.brandId);
        }
      }
      orderBrandIds.forEach((bId) => {
        if (brandSales[bId]) {
          brandSales[bId].ordersCount += 1;
        }
      });
    }

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalOrdersCount,
        paidOrdersCount,
        pendingOrdersCount,
        pendingRevenue,
        averageOrderValue,
      },
      brandSales: Object.values(brandSales),
      paymentMethods: Object.entries(paymentMethods).map(([method, data]) => ({
        method,
        ...data,
      })),
      transactions: allOrders.slice(0, 50),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 403 });
  }
}
