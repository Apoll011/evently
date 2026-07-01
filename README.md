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
git clone https://github.com/your-username/evently.git
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

## Payment Methods

Evently supports multiple payment flows:

- **Stripe** — client initiates checkout, Stripe webhook confirms payment, server issues tickets
- **Cash / In-person** — seller marks order as paid on creation, tickets issued immediately

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
