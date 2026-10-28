import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

// Helper to get sanitized database connection URL for serverless/Supabase
function getDatabaseUrl(): string | undefined {
  let url = process.env.DATABASE_URL;
  if (!url) return undefined;

  // If using Supabase connection pooler, force transaction mode (port 6543) instead of session mode (port 5432)
  // This completely eliminates "FATAL: (EMAXCONNSESSION) max clients reached in session mode - max clients are limited to pool_size: 15"
  if (url.includes('pooler.supabase.com')) {
    url = url.replace(':5432', ':6543');
    try {
      const urlObj = new URL(url);
      if (!urlObj.searchParams.has('pgbouncer')) {
        urlObj.searchParams.set('pgbouncer', 'true');
      }
      if (!urlObj.searchParams.has('connection_limit')) {
        urlObj.searchParams.set('connection_limit', '1');
      }
      url = urlObj.toString();
    } catch {
      // Fallback if URL constructor fails
      if (!url.includes('pgbouncer=true')) {
        url += (url.includes('?') ? '&' : '?') + 'pgbouncer=true&connection_limit=1';
      }
    }
  }

  return url;
}

const dbUrl = getDatabaseUrl();
if (dbUrl) {
  process.env.DATABASE_URL = dbUrl;
}

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
    datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Always keep client on globalThis in both development and serverless production containers
globalForPrisma.prisma = prisma;
