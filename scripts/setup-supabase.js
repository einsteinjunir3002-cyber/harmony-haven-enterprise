#!/usr/bin/env node

/**
 * Harmony Haven Enterprise — Automated Supabase Switch & Deployment Script
 * 
 * Usage:
 *   node scripts/setup-supabase.js "postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
let supabaseUrl = args[0];

const envPath = path.join(__dirname, '..', '.env');
const prismaSchemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const postgresSchemaPath = path.join(__dirname, '..', 'prisma', 'schema.postgresql.prisma');

if (!supabaseUrl) {
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/^DATABASE_URL=["']?(postgres(?:ql)?:\/\/[^"'\r\n]+)["']?/m);
    if (match) {
      supabaseUrl = match[1];
      console.log('Found Supabase DATABASE_URL in .env file.');
    }
  }
}

if (!supabaseUrl) {
  console.error('\x1b[31mError: No Supabase Connection String provided.\x1b[0m');
  console.log('\nUsage:');
  console.log('  node scripts/setup-supabase.js "postgresql://postgres.[ref]:[password]@...supabase.com:6543/postgres"\n');
  process.exit(1);
}

// Clean and prepare URL
supabaseUrl = supabaseUrl.trim().replace(/^["']|["']$/g, '');

console.log('\x1b[36m===============================================================\x1b[0m');
console.log('\x1b[36m🚀 HARMONY HAVEN ENTERPRISE — SUPABASE SETUP & VERCEL SYNC\x1b[0m');
console.log('\x1b[36m===============================================================\x1b[0m\n');

try {
  // 1. Copy PostgreSQL schema to active schema.prisma
  console.log('1. Configuring Prisma schema for PostgreSQL / Supabase...');
  if (fs.existsSync(postgresSchemaPath)) {
    fs.copyFileSync(postgresSchemaPath, prismaSchemaPath);
    console.log('   ✓ prisma/schema.prisma updated with provider = "postgresql"');
  } else {
    let schema = fs.readFileSync(prismaSchemaPath, 'utf8');
    schema = schema.replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"');
    fs.writeFileSync(prismaSchemaPath, schema, 'utf8');
    console.log('   ✓ Switched provider to postgresql');
  }

  // 2. Update .env with new DATABASE_URL
  console.log('2. Updating local .env configuration...');
  let envData = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  if (/^DATABASE_URL=/m.test(envData)) {
    envData = envData.replace(/^DATABASE_URL=.*$/m, `DATABASE_URL="${supabaseUrl}"`);
  } else {
    envData = `DATABASE_URL="${supabaseUrl}"\n` + envData;
  }
  fs.writeFileSync(envPath, envData, 'utf8');
  console.log('   ✓ .env updated with live Supabase DATABASE_URL');

  // 3. Push schema to Supabase database
  console.log('3. Pushing Prisma schema to Supabase...');
  execSync('npx prisma db push --accept-data-loss', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: supabaseUrl },
  });
  console.log('   ✓ Supabase database schema synced successfully');

  // 4. Seed database
  console.log('4. Seeding authentic catalog and administrator credentials...');
  try {
    execSync('npx tsx prisma/seed.ts', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: supabaseUrl },
    });
    console.log('   ✓ Database seeded with Alberta Glory super-admin, Kowah\'s Dishes & 4U Heartlines');
  } catch (seedErr) {
    console.warn('   ⚠️ Note on seed:', seedErr.message);
  }

  // 5. Add DATABASE_URL to Vercel
  console.log('5. Syncing DATABASE_URL to Vercel Environment Variables...');
  try {
    try {
      execSync('vercel env rm DATABASE_URL production --yes', { stdio: 'pipe' });
    } catch {}
    execSync(`vercel env add DATABASE_URL production`, {
      input: supabaseUrl,
      stdio: ['pipe', 'inherit', 'inherit'],
    });
    console.log('   ✓ Added DATABASE_URL to Vercel production environment');
  } catch (vercelEnvErr) {
    console.warn('   ⚠️ Could not set Vercel env variable automatically (check vercel login):', vercelEnvErr.message);
  }

  // 6. Deploy to Vercel
  console.log('6. Triggering Vercel production build with live Supabase database...');
  execSync('vercel --prod --yes', { stdio: 'inherit' });
  console.log('\n\x1b[32m✔ SUCCESS! Harmony Haven Enterprise is live on Vercel with Supabase persistence!\x1b[0m\n');
} catch (err) {
  console.error('\x1b[31mSetup failed:\x1b[0m', err.message);
  process.exit(1);
}
