import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPaystackSignature } from '@/lib/payment';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-paystack-signature') || '';

    // Verify webhook authenticity
    if (process.env.NODE_ENV === 'production' && !verifyPaystackSignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === 'charge.success') {
      const data = event.data;
      const reference = data.reference;

      // Idempotency check: Check if this transaction has already been processed
      const existingPayment = await prisma.payment.findUnique({
        where: { transactionRef: reference },
      });

      if (existingPayment && existingPayment.status === 'PAID') {
        return NextResponse.json({ status: 'ignored', message: 'Transaction already processed' });
      }

      // Find order by metadata or transaction reference
      const orderNumber = data.metadata?.orderNumber;
      const order = await prisma.order.findFirst({
        where: {
          OR: [
            ...(orderNumber ? [{ orderNumber }] : []),
            { id: data.metadata?.orderId || '' },
          ],
        },
      });

      if (order) {
        await prisma.$transaction(async (tx) => {
          await tx.payment.upsert({
            where: { transactionRef: reference },
            update: {
              status: 'PAID',
              providerReference: String(data.id || reference),
              rawResponseJson: rawBody,
            },
            create: {
              orderId: order.id,
              provider: 'PAYSTACK',
              transactionRef: reference,
              amount: data.amount / 100, // convert kobo/pesewas to standard units
              currency: data.currency || 'GHS',
              status: 'PAID',
              providerReference: String(data.id || reference),
              rawResponseJson: rawBody,
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
              note: `Paystack Webhook verified charge.success (${reference})`,
              actorName: 'Paystack Webhook',
            },
          });
        });
      }
    }

    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}
