# Security Architecture

## 1. Authentication & Session Management
- Passwords are encrypted using salted `bcryptjs` hashing (cost factor 10).
- Stateless JWT sessions signed with `AUTH_SECRET` stored in secure `HttpOnly` `SameSite=Lax` cookies.
- Server-side RBAC guards (`requireAuth('ADMIN')`) protect all administration endpoints.

## 2. Server-Side Price Verification
- Frontend prices and calculations are treated as untrusted hints.
- The `/api/orders` endpoint recalculates order subtotals, variant adjustments, and delivery fees directly against database records inside an atomic transaction.

## 3. Cryptographic Webhook Security
- Paystack / Mobile Money webhooks require HMAC-SHA512 signature validation using `PAYMENT_WEBHOOK_SECRET`.
- Transaction references are verified before any order state is updated.
- Duplicate webhooks are rejected via idempotency checks on `transactionRef`.

## 4. File Upload Hygiene
- Strict MIME type whitelist (`image/jpeg`, `image/png`, `image/webp`, `image/gif`, `application/pdf`).
- File size capped at 10MB.
- Original filenames are stripped and replaced with crypto-randomized collision-proof hashes (`Date.now()_randomBytes.ext`).
