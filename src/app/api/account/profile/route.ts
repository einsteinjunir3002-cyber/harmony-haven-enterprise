import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Please sign in to view your profile' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Please sign in to update your profile' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, avatar } = body;

    const updatedUser = await prisma.user.update({
      where: { id: sessionUser.id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        phone: phone !== undefined ? (phone ? phone.trim() : null) : undefined,
        avatar: avatar !== undefined ? (avatar ? avatar.trim() : null) : undefined,
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

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Profile PUT error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 });
  }
}
