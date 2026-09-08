import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    await requireAuth('STAFF');

    const users = await prisma.user.findMany({
      include: {
        orders: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            paymentStatus: true,
            fulfillmentStatus: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        addresses: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const customers = users.map((u) => {
      const paidOrders = u.orders.filter((o) => o.paymentStatus === 'PAID');
      const totalSpend = paidOrders.reduce((sum, o) => sum + o.total, 0);
      const lastOrder = u.orders[0] || null;

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt,
        totalOrders: u.orders.length,
        paidOrdersCount: paidOrders.length,
        totalSpend,
        lastOrderDate: lastOrder ? lastOrder.createdAt : null,
        recentOrders: u.orders.slice(0, 5),
        addresses: u.addresses,
      };
    });

    const totalCustomers = customers.filter((c) => c.role === 'CUSTOMER').length;
    const activeCustomers = customers.filter((c) => c.status === 'ACTIVE').length;
    const totalLifetimeSpend = customers.reduce((sum, c) => sum + c.totalSpend, 0);

    return NextResponse.json({
      customers,
      metrics: {
        totalCustomers,
        totalUsers: customers.length,
        activeCustomers,
        totalLifetimeSpend,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 403 });
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await requireAuth('ADMIN');
    const body = await request.json();
    const { userId, role, status } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    const previous = await prisma.user.findUnique({ where: { id: userId } });
    if (!previous) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Protect Super Admin from being demoted or suspended accidentally
    if (previous.email === 'albertaglory@harmonyhaven.com' && (role !== 'SUPER_ADMIN' || status !== 'ACTIVE')) {
      return NextResponse.json(
        { error: 'Primary Super Admin account role and status cannot be modified.' },
        { status: 400 }
      );
    }

    const dataToUpdate: any = {};
    if (role) dataToUpdate.role = role;
    if (status) dataToUpdate.status = status;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorName: admin.name,
        action: 'UPDATE_CUSTOMER_PRIVILEGES',
        entity: 'User',
        entityId: updated.id,
        previousStateJson: JSON.stringify({ role: previous.role, status: previous.status }),
        newStateJson: JSON.stringify({ role: updated.role, status: updated.status }),
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    console.error('Update user privileges error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update user' }, { status: 500 });
  }
}
