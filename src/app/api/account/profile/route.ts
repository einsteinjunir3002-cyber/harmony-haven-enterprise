import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Please sign in to view your profile' }, { status: 401 });
    }

    let user = await prisma.user.findUnique({
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

    // Fallback: lookup by email if id mismatch
    if (!user && sessionUser.email) {
      user = await prisma.user.findUnique({
        where: { email: sessionUser.email },
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
    }

    // Auto-heal missing user record
    if (!user) {
      user = await prisma.user.create({
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
          createdAt: true,
          addresses: {
            orderBy: { isDefault: 'desc' },
          },
        },
      });
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

    // 1. Locate existing user by ID or by email
    let existingUser = await prisma.user.findUnique({
      where: { id: sessionUser.id },
    });

    if (!existingUser && sessionUser.email) {
      existingUser = await prisma.user.findUnique({
        where: { email: sessionUser.email },
      });
    }

    let updatedUser;
    if (existingUser) {
      updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
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
    } else {
      // Auto-heal: create the user record with the updated profile data
      const targetEmail = sessionUser.email || `customer_${sessionUser.id}@harmonyhaven.com`;
      updatedUser = await prisma.user.create({
        data: {
          id: sessionUser.id,
          email: targetEmail,
          name: name?.trim() || sessionUser.name || 'Valued Customer',
          phone: phone ? phone.trim() : null,
          avatar: avatar ? avatar.trim() : null,
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
