# Evently

Event and ticket management API. Create and manage events, define ticket types, sell tickets (online or in-person), and validate entry at the door.

---

## Stack

| Layer     | Technology          |
| --------- |---------------------|
| Runtime   | Node.js             |
| Framework | NestJS (TypeScript) |
| Database  | PostgreSQL          |
| ORM       | Prisma              |
| Payments  | Stripe              |
| Auth      | JWT (Passport)      |

---

## Features

- **Events** — create, update, publish, and archive events
- **Ticket Types** — define multiple ticket tiers per event (e.g. General, VIP) with pricing, capacity, and custom fields
- **Orders** — place orders with flexible payment methods (Stripe online, cash in-person, or any other method)
- **Tickets** — automatic issuance after a confirmed order, with unique signed codes
- **Validation** — scan/validate tickets at the door, prevent double entry
- **Stats** — per-event stats: tickets sold, revenue, check-in rate

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [Docker](https://www.docker.com/) (for local PostgreSQL)

### 1. Clone the repo

```bash
git clone https://github.com/apoll011/evently.git
cd evently
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Fill in the values in `.env`.

### 4. Start the database

```bash
docker-compose up -d
```

### 5. Run Prisma migrations

```bash
npx prisma migrate dev
```

### 6. Start the server

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

Server runs at `http://localhost:3000` by default.

---

## Project Structure

```
src/
  events/           # Event CRUD and stats
  tickets/          # Ticket tiers per event
  orders/           # Order creation and payment handling
  ticket/           # Ticket issuance and validation
  auth/             # JWT authentication
  db/               # Prisma client wrapper
prisma/
  schema.prisma     # Database schema
docker-compose.yml
```

---


## API Overview

| Module        | Base Path                        | Description                                    | Auth                        |
|---------------|-----------------------------------|-------------------------------------------------|-----------------------------|
| Auth          | `/auth`                           | Register, login, current organizer               | `/me` requires a token      |
| Events        | `/events`                         | CRUD, publish, cancel, stats, orders, check-ins  | Organizer-owned              |
| Ticket Types  | `/events/:eventId/ticket-types`   | Tiers per event                                  | Reads public, writes owner   |
| Orders        | `/orders`                         | Create orders, Stripe webhook                    | Public (buyer flow)          |
| Tickets       | `/tickets`                        | Issuance lookup, check-in, cancel/refund          | Reads public, writes owner   |

Every event belongs to exactly one **Organizer**. Organizers register/login via `/auth` and get back a JWT; pass it as `Authorization: Bearer <token>` to manage their own events, ticket types, and check-ins. Buyers never authenticate — placing an order and fetching a receipt/ticket by its (unguessable) ID stays public.

---

## Payment Flow

**Online (Stripe)**
1. Client creates an order → server returns a Stripe Checkout URL
2. Buyer completes payment on Stripe
3. Stripe fires a webhook → server confirms payment → tickets issued
   **In-person (Cash)**
1. Seller creates an order with `paymentMethod: CASH`
2. Server marks it paid immediately → tickets issued on the spot
   Both flows produce the same result: one `Ticket` record per unit, each with a unique code the client uses to render a QR.

---

## Environment Variables

See `.env.example` for all required variables.

| Variable                | Description                   |
| ----------------------- | ----------------------------- |
| `DATABASE_URL`          | PostgreSQL connection string  |
| `JWT_SECRET`            | Secret for signing JWT tokens |
| `STRIPE_SECRET_KEY`     | Stripe secret key (optional)  |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |

---

## License

GNU
