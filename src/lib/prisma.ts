import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

// On serverless environments (e.g. Vercel), ensure SQLite db is accessible in writable /tmp if not using Postgres
if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
  const isPostgres = process.env.DATABASE_URL?.startsWith('postgres');
  if (!isPostgres) {
    try {
      const tmpDbPath = '/tmp/dev.db';
      const sourceLocations = [
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(process.cwd(), 'dev.db'),
        path.resolve('./prisma/dev.db'),
      ];
      if (!fs.existsSync(tmpDbPath)) {
        for (const src of sourceLocations) {
          if (fs.existsSync(src)) {
            fs.copyFileSync(src, tmpDbPath);
            break;
          }
        }
      }
      process.env.DATABASE_URL = `file:${tmpDbPath}`;
    } catch (e) {
      console.warn('Could not setup sqlite in /tmp:', e);
    }
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

