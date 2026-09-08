# Production Deployment Guidelines

## 1. Hosting Options

### Option A: Vercel + Supabase/Neon PostgreSQL (Recommended)
1. Push the repository to GitHub.
2. Connect your repository to [Vercel](https://vercel.com).
3. Create a managed PostgreSQL database on [Supabase](https://supabase.com) or [Neon](https://neon.tech).
4. In `prisma/schema.prisma`, update provider to `"postgresql"`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
5. Set the environment variables in Vercel project settings:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `PAYSTACK_SECRET_KEY`
   - `PAYSTACK_PUBLIC_KEY`
   - `PAYMENT_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_SITE_URL`

### Option B: Docker / VPS (DigitalOcean / AWS EC2)
A production `Dockerfile` can build the standalone Next.js bundle:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```
