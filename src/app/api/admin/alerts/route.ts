import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await requireAuth('STAFF');

    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    const recentOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: fifteenMinutesAgo,
        },
      },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        customerPhone: true,
        total: true,
        currency: true,
        paymentStatus: true,
        fulfillmentStatus: true,
        deliveryMethod: true,
        deliveryAddressJson: true,
        internalNotes: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      orders: recentOrders,
      serverTime: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Unauthorized or failed to retrieve alerts' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
