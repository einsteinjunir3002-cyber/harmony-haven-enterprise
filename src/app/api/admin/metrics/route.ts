import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    await requireAuth('STAFF');

    const [
      totalOrders,
      paidOrders,
      pendingOrders,
      totalProducts,
      lowStockProducts,
      totalCustomers,
      recentOrders,
      customRequestsCount,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.findMany({
        where: { paymentStatus: 'PAID' },
        select: { total: true },
      }),
      prisma.order.count({
        where: { fulfillmentStatus: { in: ['NEW', 'CONFIRMED', 'PREPARING'] } },
      }),
      prisma.product.count({ where: { active: true } }),
      prisma.product.count({
        where: { trackInventory: true, stockQuantity: { lte: 10 } },
      }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
      prisma.customRequest.count({ where: { status: 'PENDING_REVIEW' } }),
    ]);

    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);

    return NextResponse.json({
      metrics: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        totalProducts,
        lowStockProducts,
        totalCustomers,
        customRequestsCount,
      },
      recentOrders,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }
    console.error('Admin metrics error:', error);
    return NextResponse.json({ error: 'Failed to calculate metrics' }, { status: 500 });
  }
}
