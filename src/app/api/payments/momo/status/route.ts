import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPaystackTransaction } from '@/lib/payment';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');
    const orderId = searchParams.get('orderId');

    if (!reference || !orderId) {
      return NextResponse.json(
        { error: 'Reference and orderId query parameters are required' },
        { status: 400 }
      );
    }

    // 1. Check if the order is already marked as paid
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.paymentStatus === 'PAID') {
      return NextResponse.json({
        paid: true,
        status: 'success',
        orderId: order.id,
        orderNumber: order.orderNumber,
      });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const isLiveConfigured = secretKey && !secretKey.includes('placeholder');

    if (isLiveConfigured) {
      const verification = await verifyPaystackTransaction(reference);

      if (verification && verification.status === 'success') {
        // Update database transactionally
        await prisma.$transaction(async (tx) => {
          await tx.payment.upsert({
            where: { transactionRef: reference },
            update: {
              status: 'PAID',
              providerReference: String(verification.id || reference),
              rawResponseJson: JSON.stringify(verification),
            },
            create: {
              orderId: order.id,
              provider: 'PAYSTACK',
              transactionRef: reference,
              amount: order.total,
              currency: order.currency,
              status: 'PAID',
              providerReference: String(verification.id || reference),
              rawResponseJson: JSON.stringify(verification),
            },
          });

          await tx.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'PAID',
              fulfillmentStatus: order.fulfillmentStatus === 'NEW' ? 'CONFIRMED' : order.fulfillmentStatus,
            },
          });

          await tx.orderStatusHistory.create({
            data: {
              orderId: order.id,
              fromStatus: order.fulfillmentStatus,
              toStatus: 'CONFIRMED',
              note: `Pay Before Delivery confirmed via MoMo prompt (Ref: ${reference})`,
              actorName: 'Paystack MoMo Gateway',
            },
          });
        });

        return NextResponse.json({
          paid: true,
          status: 'success',
          orderId: order.id,
          orderNumber: order.orderNumber,
        });
      }

      if (verification && verification.status === 'failed') {
        return NextResponse.json({
          paid: false,
          status: 'failed',
          message: verification.gateway_response || 'Payment was declined or cancelled on phone.',
        });
      }

      return NextResponse.json({
        paid: false,
        status: 'pending',
        message: 'Waiting for Mobile Money PIN input on phone...',
      });
    }

    // Simulated fallback response
    return NextResponse.json({
      paid: false,
      status: 'pending',
      simulated: true,
      message: 'Simulated prompt waiting for PIN...',
    });
  } catch (err: any) {
    console.error('MoMo status check error:', err);
    return NextResponse.json({ error: err.message || 'Status check failed' }, { status: 500 });
  }
}

// POST allows manual / simulated confirmation when in test mode or upon customer PIN entry
export async function POST(request: Request) {
  try {
    const { reference, orderId, simulateApproval } = await request.json();

    if (!reference || !orderId) {
      return NextResponse.json(
        { error: 'Reference and orderId are required' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Approve order in database
    await prisma.$transaction(async (tx) => {
      await tx.payment.upsert({
        where: { transactionRef: reference },
        update: {
          status: 'PAID',
          providerReference: reference,
        },
        create: {
          orderId: order.id,
          provider: 'PAYSTACK',
          transactionRef: reference,
          amount: order.total,
          currency: order.currency,
          status: 'PAID',
          providerReference: reference,
        },
      });

      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'PAID',
          fulfillmentStatus: order.fulfillmentStatus === 'NEW' ? 'CONFIRMED' : order.fulfillmentStatus,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.fulfillmentStatus,
          toStatus: 'CONFIRMED',
          note: simulateApproval
            ? `MoMo payment approved via automated prompt simulation (Ref: ${reference})`
            : `Payment approved via MoMo PIN prompt (Ref: ${reference})`,
          actorName: 'Mobile Money Gateway',
        },
      });
    });

    return NextResponse.json({
      success: true,
      paid: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
  } catch (err: any) {
    console.error('MoMo approve error:', err);
    return NextResponse.json({ error: err.message || 'Approval failed' }, { status: 500 });
  }
}
