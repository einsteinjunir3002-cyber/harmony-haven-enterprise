import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken, UserRole } from '@/lib/auth';

export async function POST() {
  try {
    // Find the primary admin user (Alberta Glory)
    const adminUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'albertaglory@harmonyhaven.com' },
          { name: 'Alberta Glory' },
          { role: 'SUPER_ADMIN' },
        ],
      },
    });

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin account not found. Please run seed script.' },
        { status: 404 }
      );
    }

    const token = signToken({
      id: adminUser.id,
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role as UserRole,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Logged in as Admin (Alberta Glory)',
      user: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        phone: adminUser.phone,
        role: adminUser.role,
      },
    });

    response.cookies.set('harmony_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error('Admin quick login error:', error);
    return NextResponse.json(
      { error: 'Admin login failed.' },
      { status: 500 }
    );
  }
}
