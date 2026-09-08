import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.AUTH_SECRET || "harmony_haven_enterprise_super_secret_jwt_key_2026_production_grade";
const COOKIE_NAME = "harmony_session";

export type UserRole = "CUSTOMER" | "STAFF" | "ADMIN" | "SUPER_ADMIN";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: SessionUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
  } catch (err) {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function hasRole(userRole: string, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    CUSTOMER: 1,
    STAFF: 2,
    ADMIN: 3,
    SUPER_ADMIN: 4,
  };
  return (roleHierarchy[userRole as UserRole] || 0) >= (roleHierarchy[requiredRole] || 0);
}

export async function requireAuth(minRole: UserRole = "CUSTOMER"): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  if (!hasRole(user.role, minRole)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}
