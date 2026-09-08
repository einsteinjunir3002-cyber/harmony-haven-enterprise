import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateOrderNumber } from '@/lib/utils';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      recipientName,
      occasion,
      relationship,
      messageStory,
      preferredColors,
      poemTheme,
      tone,
      requestedItems,
      uploadedMedia,
      deadlineDate,
      additionalInstructions,
      deliveryMethod,
      deliveryAddress,
      basePrice,
    } = body;

    if (!customerName || !customerPhone || !recipientName || !occasion || !messageStory) {
      return NextResponse.json(
        { error: 'Please provide your name, phone, recipient name, occasion, and your story/message.' },
        { status: 400 }
      );
    }

    const currentUser = await getCurrentUser();
    const orderNumber = generateOrderNumber();
    const initialPrice = basePrice ? parseFloat(basePrice) : 160.0;

    const result = await prisma.$transaction(async (tx) => {
      // Create Order with CUSTOM_REQUEST type
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId: currentUser?.id || null,
          customerName: customerName.trim(),
          customerEmail: (customerEmail || 'orders@harmonyhaven.com').trim().toLowerCase(),
          customerPhone: customerPhone.trim(),
          subtotal: initialPrice,
          deliveryFee: deliveryMethod === 'DELIVERY' ? 30.0 : 0.0,
          total: initialPrice + (deliveryMethod === 'DELIVERY' ? 30.0 : 0.0),
          currency: 'GHS',
          paymentStatus: 'PENDING',
          fulfillmentStatus: 'NEW',
          orderType: 'CUSTOM_REQUEST',
          deliveryMethod: deliveryMethod || 'DELIVERY',
          deliveryAddressJson: deliveryAddress ? JSON.stringify(deliveryAddress) : null,
          preferredDate: deadlineDate || null,
          notes: `4U HEARTLINES Custom Order: ${occasion} for ${recipientName} (${relationship})`,
          items: {
            create: {
              productName: `4U HEARTLINES: ${requestedItems || 'Bespoke Poem & Gifting Experience'}`,
              unitPrice: initialPrice,
              quantity: 1,
              totalPrice: initialPrice,
              personalizationJson: JSON.stringify({
                recipientName,
                occasion,
                relationship,
                poemTheme,
                tone,
                preferredColors,
              }),
            },
          },
          statusHistory: {
            create: {
              fromStatus: 'NEW',
              toStatus: 'NEW',
              note: 'Custom 4U HEARTLINES request received',
              actorName: customerName.trim(),
            },
          },
        },
      });

      // Create CustomRequest attached to this Order
      const customReq = await tx.customRequest.create({
        data: {
          orderId: order.id,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail ? customerEmail.trim() : null,
          recipientName: recipientName.trim(),
          occasion: occasion.trim(),
          relationship: relationship.trim(),
          messageStory: messageStory.trim(),
          preferredColors: preferredColors || null,
          poemTheme: poemTheme || null,
          tone: tone || null,
          requestedItems: requestedItems || 'Custom Poem & Gifting Experience',
          uploadedMediaJson: uploadedMedia ? JSON.stringify(uploadedMedia) : '[]',
          deadlineDate: deadlineDate || null,
          additionalInstructions: additionalInstructions || null,
          status: 'PENDING_REVIEW',
        },
      });

      return { order, customReq };
    });

    return NextResponse.json({
      success: true,
      order: result.order,
      orderNumber: result.order.orderNumber,
      customRequest: result.customReq,
    });
  } catch (error: any) {
    console.error('Custom request creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit custom request' },
      { status: 500 }
    );
  }
}
