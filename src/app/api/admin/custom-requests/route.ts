import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    await requireAuth('STAFF');
    const requests = await prisma.customRequest.findMany({
      include: {
        order: {
          select: {
            orderNumber: true,
            total: true,
            paymentStatus: true,
            fulfillmentStatus: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ requests });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 403 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireAuth('STAFF');
    const body = await request.json();
    const { id, status, additionalInstructions } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Request ID and status are required.' }, { status: 400 });
    }

    const updated = await prisma.customRequest.update({
      where: { id },
      data: {
        status,
        additionalInstructions: additionalInstructions !== undefined ? additionalInstructions : undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        actorName: user.name,
        action: 'UPDATE_CUSTOM_REQUEST_STATUS',
        entity: 'CustomRequest',
        entityId: id,
        newStateJson: JSON.stringify(updated),
      },
    });

    return NextResponse.json({ success: true, customRequest: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update custom request' }, { status: 500 });
  }
}
