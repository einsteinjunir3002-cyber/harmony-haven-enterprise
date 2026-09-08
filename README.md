# HARMONY HAVEN ENTERPRISE — Production E-Commerce Platform

> **Tagline:** Small Hands, Wide Reach  
> **Ecosystem:** Harmony Haven Enterprise (Parent Brand), Kowah's Dishes, 4U HEARTLINES, and expandable future brands.

A full-stack, multi-brand e-commerce and enterprise management platform built for **Harmony Haven Enterprise** in Ghana.

---

## 🌟 Executive Summary

- **Parent Enterprise:** Harmony Haven Enterprise
- **Child Brand 1:** **Kowah's Dishes** (*"Cook Less, Live More!"*) — Fresh homemade soups, grilled meats, fruity sorrel juice, and traditional shito.
- **Child Brand 2:** **4U HEARTLINES** (*"Where feelings find their words; from your heart through our pen."*) — Bespoke poetry commissions, citations, scented candle verses, and luxury curated gift boxes.
- **Dynamic Brand Expansion:** Add 3rd, 4th, and future sister brands directly through the Admin Dashboard without writing new code.
- **Ghanaian Commerce Ready:** Multi-region delivery zone calculation across all 16 Ghanaian regions, Paystack / Ghana Mobile Money integration architecture, and direct WhatsApp customer order engagement.

---

## 🔐 Administrator Access Credentials

For the business owner / executive director:

- **Username / Email:** `Alberta Glory` (or `albertaglory@harmonyhaven.com`)
- **Password:** `1234567890`
- **Role:** `SUPER_ADMIN`
- **One-Click Admin Login:** Click the **"Continue as Admin (Alberta Glory)"** button on the Sign-In page (`/account/login`) for direct instant dashboard access.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js:** v18+ (Tested on Node.js v20/v26)
- **npm:** v9+

### 2. Installation
```bash
# Navigate to project directory
cd Desktop/Alby

# Install dependencies
npm install
```

### 3. Database Sync & Seeding
```bash
# Push schema to SQLite database and generate Prisma Client
npx prisma generate
npx prisma db push

# Seed initial catalog, brands, delivery zones, and Alberta Glory admin account
npx tsx prisma/seed.ts
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Architecture & Directory Structure

```
Alby/
├── prisma/
│   ├── schema.prisma              # Relational database models (Users, Brands, Categories, Products, Orders, Payments, etc.)
│   └── seed.ts                    # Authentic seed data (Alberta Glory, Kowah's Dishes, 4U Heartlines)
├── public/
│   ├── images/gallery/            # Central web-accessible media assets
│   └── uploads/                   # Customer and admin uploaded assets
├── Sunflower Media/               # Central Working Media & Resource Repository
│   ├── branding/
│   ├── harmony-haven/
│   ├── kowahs-dishes/
│   ├── 4u-heartlines/
│   ├── products/
│   ├── gallery/
│   ├── founder/
│   ├── icons/
│   ├── documents/
│   └── uploads/
├── src/
│   ├── app/
│   │   ├── page.tsx               # Corporate Landing Page
│   │   ├── about/                 # Story, Vision, Mission, Values, Founder
│   │   ├── kowahs-dishes/         # Dedicated Kowah's Dishes Storefront
│   │   ├── 4u-heartlines/         # Dedicated 4U HEARTLINES Storefront & Custom Studio
│   │   ├── order/                 # Complete Global Catalog & Search
│   │   ├── products/[slug]/       # Product Details & Variant Configurator
│   │   ├── checkout/              # Multi-step Ghanaian Checkout
│   │   │   └── confirmation/[id]/ # Live Order Timeline Stepper & WhatsApp Dispatch
│   │   ├── contact/               # Contact Form & Business Channels
│   │   ├── partnerships/          # Corporate Gifting & B2B Inquiry Form
│   │   ├── account/               # Customer Portal & Order History
│   │   │   └── login/             # Sign In, Register & "Continue as Admin"
│   │   ├── admin/                 # Executive Administration Hub
│   │   │   ├── dashboard/         # Real DB-derived revenue & operational metrics
│   │   │   ├── brands/            # Multi-brand management (add/edit sister brands)
│   │   │   ├── products/          # Product & Variant CRUD, pricing & inventory
│   │   │   ├── orders/            # Status machine & fulfillment logs
│   │   │   ├── custom-requests/   # 4U Heartlines poem & gift review studio
│   │   │   ├── media/             # Sunflower Media hub browser
│   │   │   ├── settings/          # CMS Content Blocks & Ghana delivery fee schedule
│   │   │   ├── inquiries/         # Customer inquiries & partnership inbox
│   │   │   └── audit-logs/        # Tamper-evident staff audit trail
│   │   ├── api/                   # Server-side transactional API endpoints
│   │   └── legal/                 # Privacy, Terms, Shipping & Return policies
│   ├── components/                # Modular React UI components
│   ├── context/                   # CartContext & AuthContext
│   └── lib/                       # Prisma client, Auth JWT/bcrypt, Paystack helpers
├── docs/                          # Comprehensive Technical Documentation
└── scripts/                       # Integration test runner
```

---

## 💳 Ghanaian Payment & Webhook Architecture

1. **Client places order** → Server authoritatively calculates total from database records (prevents front-end price tampering).
2. **Transaction initiated** with unique reference and delivery zone fee.
3. **Paystack / Mobile Money** processes payment.
4. **Idempotent Webhook** (`/api/webhooks/paystack`) verifies cryptographic HMAC signature and transitions Order from `PENDING` to `PAID` + `CONFIRMED`.

---

## 📞 Official Business Information

- **Phone:** 024 514 7912
- **WhatsApp Direct:** [https://wa.me/message/UKIZH3E3AXOXB1](https://wa.me/message/UKIZH3E3AXOXB1)
- **Support Email:** successlight@gmail.com
- **Instagram:** `@harmony_haven.enterprise`
- **Location:** Operating in Ghana | Delivery Available Across All Regions
