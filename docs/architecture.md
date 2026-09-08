# System Architecture — Harmony Haven Enterprise

## Multi-Brand Model

Harmony Haven Enterprise is designed around a single parent holding entity and infinite child brands.

```
HARMONY HAVEN ENTERPRISE (Holding / Corporate Entity)
├── Kowah's Dishes (Brand ID: db-relational, slug: 'kowahs-dishes')
├── 4U HEARTLINES (Brand ID: db-relational, slug: '4u-heartlines')
├── Future Sister Brand A (Created via Admin Hub)
└── Future Sister Brand B (Created via Admin Hub)
```

### Brand Isolation & Unified Commerce
- **Isolated Theming:** Each brand controls its primary/secondary colors, typography mood, tagline, and category structures.
- **Unified Cart & Checkout:** A customer can add Kowah's Dishes soups and 4U HEARTLINES gift items into a single cart and checkout in one seamless transaction with combined Ghana delivery fee calculation.
- **Dynamic Extensibility:** Brand IDs and slugs are never hardcoded as application constants; they are queried dynamically through Prisma ORM relationships.
