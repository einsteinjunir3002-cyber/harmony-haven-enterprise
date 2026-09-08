import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await requireAuth('STAFF');

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const query = searchParams.get('q');

    const where: any = {};

    if (status) {
      where.fulfillmentStatus = status;
    }
    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }
    if (query) {
      where.OR = [
        { orderNumber: { contains: query } },
        { customerName: { contains: query } },
        { customerEmail: { contains: query } },
        { customerPhone: { contains: query } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
        payments: true,
        customRequest: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 403 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireAuth('STAFF');
    const body = await request.json();
    const { id, fulfillmentStatus, paymentStatus, internalNotes, statusNote } = body;

    if (!id) {
      return NextResponse.json({ error: 'Order ID is required.' }, { status: 400 });
    }

    const currentOrder = await prisma.order.findUnique({ where: { id } });
    if (!currentOrder) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const ord = await tx.order.update({
        where: { id },
        data: {
          fulfillmentStatus: fulfillmentStatus || currentOrder.fulfillmentStatus,
          paymentStatus: paymentStatus || currentOrder.paymentStatus,
          internalNotes: internalNotes !== undefined ? internalNotes : currentOrder.internalNotes,
        },
      });

      if (fulfillmentStatus && fulfillmentStatus !== currentOrder.fulfillmentStatus) {
        await tx.orderStatusHistory.create({
          data: {
            orderId: id,
            fromStatus: currentOrder.fulfillmentStatus,
            toStatus: fulfillmentStatus,
            note: statusNote || `Status updated to ${fulfillmentStatus} by staff`,
            actorId: user.id,
            actorName: user.name,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          actorId: user.id,
          actorName: user.name,
          action: 'UPDATE_ORDER_STATUS',
          entity: 'Order',
          entityId: id,
          previousStateJson: JSON.stringify(currentOrder),
          newStateJson: JSON.stringify(ord),
        },
      });

      return ord;
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    console.error('Order status update error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update order' }, { status: 500 });
  }
}
