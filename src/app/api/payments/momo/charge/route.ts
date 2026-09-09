import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Map Ghana network selector keys to Paystack Mobile Money provider codes
const PROVIDER_MAP: Record<string, string> = {
  MTN: 'mtn',
  TELECEL: 'vod', // Vodafone / Telecel Cash
  AT: 'tgo',      // AirtelTigo / AT Money
};

export async function POST(request: Request) {
  try {
    const { orderId, phone, network } = await request.json();

    if (!orderId || !phone) {
      return NextResponse.json(
        { error: 'Order ID and registered MoMo phone number are required.' },
        { status: 400 }
      );
    }

    // 1. Fetch authoritative order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    // 2. Normalize Ghanaian phone number to 10 digits (e.g. 024XXXXXXX)
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('233') && cleanPhone.length === 12) {
      cleanPhone = '0' + cleanPhone.slice(3);
    }
    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit Ghanaian mobile money number (e.g. 024 123 4567).' },
        { status: 400 }
      );
    }

    const providerCode = PROVIDER_MAP[network] || 'mtn';
    const amountInPesewas = Math.round(order.total * 100);
    const reference = `HH_MOMO_${order.orderNumber.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}`;

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const isLiveConfigured = secretKey && !secretKey.includes('placeholder');

    // 3. If real Paystack credentials exist, initiate direct USSD push prompt
    if (isLiveConfigured) {
      try {
        const paystackRes = await fetch('https://api.paystack.co/charge', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amountInPesewas,
            email: order.customerEmail || 'billing@harmonyhaven.com',
            currency: 'GHS',
            reference,
            mobile_money: {
              phone: cleanPhone,
              provider: providerCode,
            },
            metadata: {
              orderId: order.id,
              orderNumber: order.orderNumber,
              customerPhone: cleanPhone,
              customerName: order.customerName,
              network,
            },
          }),
        });

        const paystackData = await paystackRes.json();

        if (!paystackRes.ok || !paystackData.status) {
          console.error('Paystack charge error:', paystackData);
          return NextResponse.json(
            {
              error: paystackData.message || 'Failed to send MoMo prompt to your phone. Please verify your number and network.',
              details: paystackData,
            },
            { status: 400 }
          );
        }

        // Return live prompt status
        return NextResponse.json({
          success: true,
          simulated: false,
          reference: paystackData.data?.reference || reference,
          status: paystackData.data?.status || 'pay_offline',
          displayText: paystackData.data?.display_text || `A payment prompt has been sent to ${cleanPhone}. Please authorize on your phone.`,
          orderId: order.id,
          amount: order.total,
          phone: cleanPhone,
          network,
        });
      } catch (gatewayErr: any) {
        console.error('Paystack connection exception:', gatewayErr);
        return NextResponse.json(
          { error: 'Could not connect to the Mobile Money gateway. Please try again or pay on delivery.' },
          { status: 502 }
        );
      }
    }

    // 4. If running in simulated/test mode without live keys:
    return NextResponse.json({
      success: true,
      simulated: true,
      reference,
      status: 'pay_offline',
      displayText: `A prompt has been simulated for ${cleanPhone}. Please enter your MoMo PIN on your phone to complete GH₵${order.total.toFixed(2)}.`,
      note: 'Paystack Secret Key is currently not set to a live key. Add PAYSTACK_SECRET_KEY to your Vercel project to send real USSD prompts to physical phones.',
      orderId: order.id,
      amount: order.total,
      phone: cleanPhone,
      network,
    });
  } catch (err: any) {
    console.error('MoMo charge handler error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to initialize Mobile Money charge' },
      { status: 500 }
    );
  }
}
