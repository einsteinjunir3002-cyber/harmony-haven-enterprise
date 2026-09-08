import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { name, email, phone, subject, message, isPartnership } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email and message are required.' },
        { status: 400 }
      );
    }

    const inquiry = await prisma.contactInquiry.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        subject: subject ? subject.trim() : (isPartnership ? 'Partnership Inquiry' : 'General Inquiry'),
        message: message.trim(),
        isPartnership: Boolean(isPartnership),
        status: 'NEW',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Your inquiry has been received. Our team will contact you shortly.',
      inquiry,
    });
  } catch (error) {
    console.error('Contact inquiry error:', error);
    return NextResponse.json(
      { error: 'Failed to record inquiry.' },
      { status: 500 }
    );
  }
}
