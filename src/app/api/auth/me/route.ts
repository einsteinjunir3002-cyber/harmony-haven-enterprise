import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ user: null });
    }

    const fullUser = await prisma.user.findUnique({
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

    if (!fullUser || fullUser.status === 'SUSPENDED') {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user: fullUser });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ user: null });
  }
}
