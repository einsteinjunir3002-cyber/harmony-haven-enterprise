import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPaystackTransaction } from '@/lib/payment';

export async function POST(request: Request) {
  try {
    const { reference, orderId } = await request.json();

    if (!reference || !orderId) {
      return NextResponse.json(
        { error: 'Transaction reference and order ID are required.' },
        { status: 400 }
      );
    }

    // 1. Verify transaction with gateway
    const verificationData = await verifyPaystackTransaction(reference);

    if (verificationData.status !== 'success') {
      return NextResponse.json(
        { error: 'Payment verification failed with provider.', details: verificationData },
        { status: 400 }
      );
    }

    // 2. Fetch order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    // 3. Atomically update payment and order records
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Upsert payment record
      await tx.payment.upsert({
        where: { transactionRef: reference },
        update: {
          status: 'PAID',
          providerReference: verificationData.id ? String(verificationData.id) : reference,
          rawResponseJson: JSON.stringify(verificationData),
        },
        create: {
          orderId: order.id,
          provider: 'PAYSTACK',
          transactionRef: reference,
          amount: order.total,
          currency: order.currency,
          status: 'PAID',
          providerReference: verificationData.id ? String(verificationData.id) : reference,
          rawResponseJson: JSON.stringify(verificationData),
        },
      });

      // Update Order payment status and advance fulfillment status to CONFIRMED
      const ord = await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'PAID',
          fulfillmentStatus: order.fulfillmentStatus === 'NEW' ? 'CONFIRMED' : order.fulfillmentStatus,
        },
      });

      // Record status transition
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.fulfillmentStatus,
          toStatus: 'CONFIRMED',
          note: `Payment verified via Ghana Mobile Money / Card (Ref: ${reference})`,
          actorName: 'Payment Gateway',
        },
      });

      return ord;
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: 'Payment verified and order confirmed successfully.',
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment verification failed.' },
      { status: 500 }
    );
  }
}
