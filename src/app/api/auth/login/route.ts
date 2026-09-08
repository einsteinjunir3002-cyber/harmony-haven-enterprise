import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { emailOrName, password } = await request.json();

    if (!emailOrName || !password) {
      return NextResponse.json(
        { error: 'Please provide your email/username and password.' },
        { status: 400 }
      );
    }

    const cleanIdentifier = emailOrName.trim().toLowerCase();

    // Look up user by email or case-insensitive name
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanIdentifier },
          { name: { equals: emailOrName.trim() } },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials. Please check your username/email and password.' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials. Please check your password.' },
        { status: 401 }
      );
    }

    if (user.status === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'Your account is currently suspended. Please contact support.' },
        { status: 403 }
      );
    }

    const token = signToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as any,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });

    response.cookies.set('harmony_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during login.' },
      { status: 500 }
    );
  }
}
