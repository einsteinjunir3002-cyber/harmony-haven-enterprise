import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { calculateOrderTotals } from '@/lib/payment';
import { generateOrderNumber } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      items,
      customerName,
      customerEmail,
      customerPhone,
      deliveryMethod,
      deliveryZoneId,
      deliveryAddress,
      preferredDate,
      preferredTime,
      notes,
      paymentTiming = 'PAY_BEFORE_DELIVERY',
      paymentMethod = 'MOMO',
      momoNetwork = 'MTN',
      momoPhone,
    } = body;

    if (!items || !items.length) {
      return NextResponse.json({ error: 'Cart cannot be empty.' }, { status: 400 });
    }

    if (!customerName || !customerEmail || !customerPhone) {
      return NextResponse.json(
        { error: 'Customer name, email and phone number are required.' },
        { status: 400 }
      );
    }

    const currentUser = await getCurrentUser();

    // 1. Calculate authoritative server-side totals
    const calculation = await calculateOrderTotals({
      items,
      deliveryZoneId,
      deliveryMethod: deliveryMethod || 'DELIVERY',
    });

    const orderNumber = generateOrderNumber();

    const isPayOnDelivery = paymentTiming === 'PAY_ON_DELIVERY';
    const initialPaymentStatus = isPayOnDelivery ? 'PAY_ON_DELIVERY' : 'PAID';
    const paymentModeLabel = isPayOnDelivery
      ? 'Payment on Delivery (MoMo on arrival)'
      : 'Pay Before Delivery (Instant MoMo)';

    // 2. Transactional creation of Order, OrderItems, OrderStatusHistory, and inventory deduction
    const newOrder = await prisma.$transaction(async (tx) => {
      // Create the Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId: currentUser?.id || null,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim().toLowerCase(),
          customerPhone: customerPhone.trim(),
          subtotal: calculation.subtotal,
          deliveryFee: calculation.deliveryFee,
          discount: calculation.discount,
          total: calculation.total,
          currency: calculation.currency,
          paymentStatus: initialPaymentStatus,
          fulfillmentStatus: 'CONFIRMED',
          orderType: 'STANDARD_PRODUCT_ORDER',
          deliveryMethod: deliveryMethod || 'DELIVERY',
          deliveryAddressJson: deliveryAddress ? JSON.stringify(deliveryAddress) : null,
          preferredDate: preferredDate || null,
          preferredTime: preferredTime || null,
          notes: notes || null,
          internalNotes: `Payment Timing: ${paymentTiming} | Method: MoMo (${momoNetwork}) | Customer MoMo: ${momoPhone || customerPhone}`,
          items: {
            create: calculation.verifiedItems.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              productName: item.productName,
              variantName: item.variantName,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              totalPrice: item.totalPrice,
              personalizationJson: item.personalizationJson,
            })),
          },
          statusHistory: {
            create: {
              fromStatus: 'NEW',
              toStatus: 'CONFIRMED',
              note: `Order placed by customer (${paymentModeLabel} - ${momoNetwork})`,
              actorName: customerName.trim(),
            },
          },
        },
        include: {
          items: true,
          statusHistory: true,
        },
      });

      // Deduct inventory for items tracking inventory
      for (const item of calculation.verifiedItems) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stockQuantity: { decrement: item.quantity } },
          });
        }
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } },
        });
      }

      return order;
    });

    return NextResponse.json({
      success: true,
      order: newOrder,
      orderNumber: newOrder.orderNumber,
      total: newOrder.total,
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process order' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: {
        OR: [{ customerId: user.id }, { customerEmail: user.email }],
      },
      include: {
        items: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch customer orders' }, { status: 500 });
  }
}
