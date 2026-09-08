# Database Architecture & PostgreSQL Schema

## Relational Schema Overview

Prisma ORM is used with standard SQL relational models. In local development it runs on SQLite (`file:./dev.db`), and for cloud production it connects to PostgreSQL (`DATABASE_URL="postgresql://user:password@host:5432/harmony_haven"`).

### Core Entities:
1. **User:** Role-Based Access Control (`CUSTOMER`, `STAFF`, `ADMIN`, `SUPER_ADMIN`).
2. **Brand:** Parent brands registry with slugs, descriptions, taglines, and brand colors.
3. **Category:** Scoped per brand.
4. **Product:** Base prices, inventory tracking flags, stock counts, physical vs made-to-order types.
5. **ProductVariant:** Size, meat selections, jar packaging, and price adjustments.
6. **Order:** Collision-proof Ghanaian order numbers (`HH-2026-XXXXXX`), delivery zone calculation, order status history.
7. **OrderItem:** Captures historical unit price at time of purchase to ensure auditability.
8. **OrderStatusHistory:** Append-only log of fulfillment stages (`NEW` → `CONFIRMED` → `PREPARING` → `READY` → `OUT_FOR_DELIVERY` → `DELIVERED`).
9. **CustomRequest:** 4U HEARTLINES personalization records (recipient, story, poem theme, tone, uploaded attachments).
10. **DeliveryZone:** Configurable Ghanaian regions and fees.
11. **ContentBlock:** CMS key-value store for Vision, Mission, Values, and Founder details.
12. **AuditLog:** Tamper-evident log of administrative modifications.
