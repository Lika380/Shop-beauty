# Online Shop Backend

REST API for a mini online shop. Node.js + Express + PostgreSQL (raw `pg`, no ORM), JWT auth, `bcrypt` password hashing, `zod` validation.

## Stack

- Node.js + Express
- PostgreSQL via `pg`
- JWT (`jsonwebtoken`) for auth, `bcrypt` for password hashing
- `zod` for request validation
- `morgan` for request logging

## Setup

### 1. Prerequisites

- Node.js 18+
- A running PostgreSQL instance

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

| Variable | Description |
|---|---|
| `PORT` | Port the API listens on (default `3000`) |
| `DATABASE_URL` | PostgreSQL connection string, e.g. `postgres://user:password@localhost:5432/online_shop` |
| `JWT_SECRET` | Secret used to sign JWTs — set to a long random string |
| `JWT_EXPIRES_IN` | Access token lifetime (default `1d`) |

Create the database if it doesn't exist yet:

```bash
createdb online_shop
```

### 4. Run migrations

```bash
npm run migrate
```

This applies every `.sql` file in `src/db/migrations/` in order, tracked in a `schema_migrations` table so re-running is safe.

### 5. Seed test data

```bash
npm run seed
```

Creates:
- 6 categories
- 50 products (varied prices, some with `stock_quantity = 0`)
- 3 users, all pre-verified (`email_verified = true`) so they can log in immediately:
  - `admin@shop.test` / `admin123` (role `admin`)
  - `customer1@shop.test` / `customer123` (role `customer`)
  - `customer2@shop.test` / `customer123` (role `customer`)

Re-running `npm run seed` is safe — it truncates and rebuilds everything (users, categories, products, and anything referencing them) instead of appending duplicates.

### 6. Run the server

```bash
npm start
# or, with auto-restart on file changes:
npm run dev
```

Server starts on `http://localhost:3000` (or your configured `PORT`). Check `GET /health` for a liveness probe.

## Authentication

Register or log in to get a JWT, then send it as `Authorization: Bearer <token>` on protected routes. Tokens encode `user_id` and `role`.

## API Reference

All error responses use the shape:

```json
{ "error": { "message": "...", "code": "..." } }
```

### Auth

| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/auth/register` | — | `{ email, password }` → creates an unverified `customer` and emails (mocked) a 6-digit code. Returns `{ message, email }` — **no token yet** |
| POST | `/auth/verify` | — | `{ email, code }` → marks the account verified, returns `{ token, user }` |
| POST | `/auth/resend-verification` | — | `{ email }` → issues and resends a fresh code |
| POST | `/auth/login` | — | `{ email, password }` → `401` on bad credentials, `403 EMAIL_NOT_VERIFIED` if the account hasn't been verified yet, otherwise `{ token, user }` |

Email delivery is **emulated**, not real — no SMTP is configured. `sendVerificationEmail` (`src/utils/email.js`) just logs `[email:mock] To: ... Code: ...` to the server console. For convenience while testing without tailing logs, `register`/`resend-verification` also echo the code back as `dev_verification_code` in the JSON response whenever `NODE_ENV !== 'production'`. Wire up a real provider (SMTP, SendGrid, Resend, ...) in `src/utils/email.js` and drop that field before shipping to production.

### Products

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/products` | — | Query: `category` (id), `search` (name substring), `page`, `limit`, `sort` (`price_asc`/`price_desc`) |
| GET | `/products/:id` | — | |
| POST | `/products` | admin | `{ name, description?, price, stock_quantity?, category_id?, image_url? }` |
| PUT | `/products/:id` | admin | Partial update, same fields as create |
| DELETE | `/products/:id` | admin | |

### Categories

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/categories` | — | |
| POST | `/categories` | admin | `{ name }` |

### Cart (customer only)

| Method | Path | Notes |
|---|---|---|
| GET | `/cart` | Current user's cart with items |
| POST | `/cart/items` | `{ product_id, quantity }` — adds or increments |
| PUT | `/cart/items/:id` | `{ quantity }` — `:id` is the cart item id |
| DELETE | `/cart/items/:id` | Removes the item |

### Orders

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/orders` | any authenticated user | Checks out the current user's cart (see below) |
| GET | `/orders` | any authenticated user | Customers see their own orders; admins see all and may filter with `status`, `user_id`, `page`, `limit` |
| GET | `/orders/:id` | any authenticated user | Admins can view any order; customers only their own (403 otherwise) |
| PATCH | `/orders/:id/status` | admin | `{ status }` — one of `pending`, `paid`, `shipped`, `delivered`, `cancelled` |

## Checkout transaction

`POST /orders` runs entirely inside one PostgreSQL transaction (`src/controllers/orderController.js` + `src/models/orderModel.js`):

1. `BEGIN`
2. `SELECT ... FOR UPDATE` locks the product rows backing the cart's items.
3. Verifies `stock_quantity >= requested quantity` for every item; on failure, throws and the transaction rolls back, returning `400` with the offending product's name.
4. Inserts the `orders` row (`status = 'pending'`, `total` = sum of line items).
5. Inserts `order_items`, freezing `price_at_purchase` from the current product price.
6. Decrements `stock_quantity` per product.
7. Clears the cart's `cart_items`.
8. `COMMIT`

Any failure at any step rolls back the whole transaction — stock is never decremented without a corresponding order, and vice versa.

## Project structure

```
src/
  config/         DB pool + env config
  db/
    migrations/   one .sql file per schema change
    migrate.js    migration runner (tracks applied migrations)
    seed.js       test data seeding
  models/         raw SQL per entity
  controllers/    request handling, calls models
  routes/         Express routers
  middleware/      auth, requireRole, validate, errorHandler
  validators/     zod schemas per route group
  utils/          AppError, asyncHandler, jwt helpers
  app.js          Express app assembly
  server.js       process entrypoint
```

## Error codes

| Status | Meaning |
|---|---|
| 400 | Validation error, bad reference, or business-rule violation (e.g. insufficient stock) |
| 401 | Missing/invalid/expired token, or bad credentials |
| 403 | Authenticated but not permitted (wrong role, or accessing another user's order) |
| 404 | Resource not found |
| 409 | Conflict (e.g. email already registered) |
| 500 | Unexpected internal error (details are logged, not exposed) |
