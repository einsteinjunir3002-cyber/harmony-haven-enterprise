import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ user: null });
    }

    let fullUser = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
      },
    });

    if (!fullUser && sessionUser.email) {
      fullUser = await prisma.user.findUnique({
        where: { email: sessionUser.email },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          role: true,
          status: true,
        },
      });
    }

    if (!fullUser) {
      // Auto-heal missing user record
      fullUser = await prisma.user.create({
        data: {
          id: sessionUser.id,
          name: sessionUser.name || 'Valued Customer',
          email: sessionUser.email || `customer_${sessionUser.id}@harmonyhaven.com`,
          passwordHash: 'SESSION_AUTHENTICATED',
          role: sessionUser.role || 'CUSTOMER',
          status: 'ACTIVE',
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          role: true,
          status: true,
        },
      });
    }

    if (fullUser.status === 'SUSPENDED') {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user: fullUser });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ user: null });
  }
}
