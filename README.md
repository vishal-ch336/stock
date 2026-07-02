<div align="center">

# ☀️ SunGrid Invoice Wizard

### Inventory Management System for Solar Equipment

A full-stack, real-time inventory management platform purpose-built for solar equipment distributors. Features AI-powered PDF invoice parsing, live dashboard analytics, role-based access control via Clerk, and Server-Sent Events for instant data synchronisation across clients.

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Database Setup](#2-database-setup)
  - [3. Backend Setup](#3-backend-setup)
  - [4. Frontend Setup](#4-frontend-setup)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Data Models](#data-models)
- [Authentication & Authorization](#authentication--authorization)
- [Real-Time Updates](#real-time-updates)
- [Deployment](#deployment)
- [Development Scripts](#development-scripts)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Features

| Category | Description |
|---|---|
| **Real-Time Dashboard** | Live KPI cards, daily purchase/sale charts, and top SKU visualisations powered by Server-Sent Events |
| **Inventory Management** | Full CRUD for parts with categories, locations, unit costs, tax rates, supplier info, and solar-specific wattage tracking |
| **Transaction Ledger** | Record purchases, sales, returns, and adjustments with automatic stock reconciliation |
| **AI Invoice Import** | Upload PDF invoices and extract line items automatically — bulk-ingest into inventory in one click |
| **Role-Based Access** | Clerk authentication with Manager / Viewer roles; write operations gated behind manager permissions |
| **Analytics & Export** | Inventory net worth tracking, daily net movement charts, top SKU analysis; export data as CSV or JSON |
| **Low-Stock Alerts** | Configurable minimum stock thresholds with visual warnings on the dashboard |
| **Responsive UI** | Fully responsive design built with shadcn/ui — works seamlessly on desktop, tablet, and mobile |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                        │
│                                                                 │
│  React 18 + TypeScript ─── Zustand Stores ─── React Query       │
│  shadcn/ui + Tailwind CSS ─── Recharts ─── React Router         │
│  Clerk React SDK (auth)                                         │
└──────────────┬────────────────────────────┬─────────────────────┘
               │  REST API (JSON)           │  SSE Stream
               ▼                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVER (Express.js)                        │
│                                                                 │
│  Routes ──► Zod Validation ──► Services ──► Mongoose Models     │
│  Helmet · CORS · Compression · Rate Limiting                    │
│  Clerk Express SDK (JWT verification)                           │
│  pdf-parse (invoice extraction) · Pino (structured logging)     │
└──────────────┬──────────────────────────────────────────────────┘
               │  Mongoose ODM
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                   DATABASE (MongoDB Atlas)                       │
│                                                                 │
│  Collections: parts · movements                                 │
│  Replica Set (required for Change Streams)                      │
│  Text indexes · Compound indexes for query performance          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| [React 18](https://react.dev/) | UI framework |
| [TypeScript 5](https://www.typescriptlang.org/) | Type safety |
| [Vite 5](https://vitejs.dev/) | Build tool & dev server |
| [Zustand](https://zustand-demo.pmnd.rs/) | Lightweight state management |
| [React Query](https://tanstack.com/query) | Server state & caching |
| [shadcn/ui](https://ui.shadcn.com/) | Component library (Radix + Tailwind) |
| [Recharts](https://recharts.org/) | Data visualisation |
| [Clerk React](https://clerk.com/) | Authentication UI |
| [React Router 6](https://reactrouter.com/) | Client-side routing |
| [Zod](https://zod.dev/) | Schema validation |

### Backend

| Technology | Purpose |
|---|---|
| [Node.js 20+](https://nodejs.org/) | Runtime |
| [Express 4](https://expressjs.com/) | HTTP framework |
| [TypeScript 5](https://www.typescriptlang.org/) | Type safety |
| [Mongoose 8](https://mongoosejs.com/) | MongoDB ODM |
| [Zod](https://zod.dev/) | Request validation |
| [Clerk Express](https://clerk.com/) | JWT verification |
| [pdf-parse](https://www.npmjs.com/package/pdf-parse) | PDF text extraction |
| [Pino](https://getpino.io/) | Structured JSON logging |
| [Helmet](https://helmetjs.github.io/) | Security headers |
| [Vitest](https://vitest.dev/) | Unit & integration testing |

### Infrastructure

| Technology | Purpose |
|---|---|
| [MongoDB Atlas](https://www.mongodb.com/atlas) | Cloud database (free tier available) |
| [Render](https://render.com/) | Backend hosting |
| [Vercel](https://vercel.com/) | Frontend hosting |
| [Docker Compose](https://docs.docker.com/compose/) | Local MongoDB with replica set |

---

## Prerequisites

- **Node.js** ≥ 20.x — [Download](https://nodejs.org/)
- **npm** ≥ 10.x (ships with Node.js)
- **MongoDB Atlas** account — [Sign up free](https://www.mongodb.com/cloud/atlas)
- **Clerk** account — [Sign up free](https://clerk.com/) (for authentication)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/sungrid-invoice-wizard.git
cd sungrid-invoice-wizard
```

### 2. Database Setup

You have two options for MongoDB:

<details>
<summary><strong>Option A — MongoDB Atlas (Recommended for production)</strong></summary>

1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create an **M0 FREE** cluster (name: `sungrid`, closest region)
3. Under **Network Access** → Add IP Address → **Allow Access from Anywhere** (`0.0.0.0/0`)
4. Under **Database Access** → Add New Database User:
   - **Username:** `sungrid-user`
   - **Password:** Auto-generate and **save it securely**
   - **Privileges:** Read and write to any database
5. Under **Clusters** → **Connect** → **Connect your application** (Node.js 5.5+)
6. Copy the connection string:
   ```
   mongodb+srv://sungrid-user:<password>@cluster0.xxxxx.mongodb.net/sungrid?retryWrites=true&w=majority
   ```

</details>

<details>
<summary><strong>Option B — Local MongoDB with Docker</strong></summary>

A `docker-compose.yml` is provided in the `server/` directory with a replica set pre-configured (required for Change Streams):

```bash
cd server
docker compose up -d
```

This starts MongoDB 7 on `localhost:27017` with replica set `rs0`. The connection string will be:

```
mongodb://localhost:27017/sungrid?replicaSet=rs0
```

</details>

### 3. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create environment file from template
cp .env.example .env
```

Edit `server/.env` with your configuration (see [Environment Variables](#environment-variables) for all options):

```env
PORT=8080
NODE_ENV=development
MONGO_URI=mongodb+srv://sungrid-user:<password>@cluster0.xxxxx.mongodb.net/sungrid?retryWrites=true&w=majority
CORS_ORIGIN=http://localhost:5173
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
```

Start the development server:

```bash
npm run dev
```

Verify the server is running:

```bash
curl http://localhost:8080/health
# Expected: {"status":"ok"}
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "VITE_API_BASE=http://localhost:8080" > .env
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. You should see the sign-in page (or the dashboard if authentication is configured).

---

## Project Structure

```
sungrid-invoice-wizard/
│
├── frontend/                          # React SPA (Vite + TypeScript)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                    # shadcn/ui base components
│   │   │   ├── modals/                # Dialog components (MovementModal, etc.)
│   │   │   ├── wizard/                # Multi-step invoice import wizard
│   │   │   ├── Header.tsx             # App header with auth & manager toggle
│   │   │   ├── KPICard.tsx            # Dashboard metric cards
│   │   │   ├── PartsTable.tsx         # Inventory parts data table
│   │   │   ├── MovementsLog.tsx       # Transaction history log
│   │   │   ├── InvoiceImportWizard.tsx# PDF invoice import flow
│   │   │   ├── PurchasesSalesChart.tsx # Daily net movement chart
│   │   │   ├── TopSKUsChart.tsx       # Top SKUs bar chart
│   │   │   ├── RecentChanges.tsx      # Recent activity feed
│   │   │   └── InventoryNetWorth.tsx  # Inventory valuation display
│   │   ├── pages/
│   │   │   ├── Index.tsx              # Main layout with tab navigation
│   │   │   ├── Overview.tsx           # Dashboard with KPIs & charts
│   │   │   ├── Parts.tsx              # Parts inventory management
│   │   │   ├── Movements.tsx          # Transaction history & creation
│   │   │   ├── Settings.tsx           # Application settings
│   │   │   ├── SignInPage.tsx         # Clerk authentication page
│   │   │   └── NotFound.tsx           # 404 page
│   │   ├── stores/                    # Zustand state management
│   │   │   ├── usePartsStore.ts       # Parts CRUD state
│   │   │   ├── useMovementsStore.ts   # Movements state
│   │   │   ├── useStatsStore.ts       # Dashboard statistics state
│   │   │   └── useUIStore.ts          # UI preferences state
│   │   ├── hooks/                     # Custom React hooks
│   │   ├── lib/
│   │   │   ├── dataConnector.ts       # API client with SSE support
│   │   │   └── utils.ts              # Utility functions
│   │   └── types/                     # Shared TypeScript interfaces
│   ├── index.html                     # HTML entry point
│   ├── vite.config.ts                 # Vite configuration
│   ├── tailwind.config.ts             # Tailwind CSS configuration
│   ├── vercel.json                    # Vercel deployment config
│   └── package.json
│
├── server/                            # Express REST API (TypeScript)
│   ├── src/
│   │   ├── routes/
│   │   │   ├── parts.routes.ts        # CRUD for inventory parts
│   │   │   ├── movements.routes.ts    # Transaction recording
│   │   │   ├── stats.routes.ts        # Dashboard analytics queries
│   │   │   ├── events.routes.ts       # SSE real-time event stream
│   │   │   ├── invoices.routes.ts     # PDF parse & ingest endpoints
│   │   │   ├── export.routes.ts       # CSV/JSON data export
│   │   │   ├── import.routes.ts       # Bulk data import
│   │   │   └── reset.routes.ts        # Data reset (dev only)
│   │   ├── services/
│   │   │   ├── inventory.service.ts   # Stock reconciliation logic
│   │   │   ├── invoice-extract.service.ts # PDF text extraction & parsing
│   │   │   ├── invoice-ingest.service.ts  # Invoice data → inventory records
│   │   │   ├── stats.service.ts       # Aggregation pipeline queries
│   │   │   └── stream.service.ts      # SSE broadcaster & Pino logger
│   │   ├── models/
│   │   │   ├── Part.ts                # Part schema & model
│   │   │   └── Movement.ts           # Movement schema & model
│   │   ├── schemas/                   # Zod request validation schemas
│   │   │   ├── part.schema.ts
│   │   │   ├── movement.schema.ts
│   │   │   ├── invoice.schema.ts
│   │   │   └── common.schema.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts                # Clerk JWT verification
│   │   │   ├── error.ts               # Global error handler
│   │   │   ├── upload.ts              # Multer file upload config
│   │   │   └── validate.ts            # Zod validation middleware
│   │   ├── seed/                      # Database seeder scripts
│   │   ├── config.ts                  # Zod-validated environment config
│   │   ├── db.ts                      # MongoDB connection manager
│   │   └── index.ts                   # Express app entry point
│   ├── docker-compose.yml             # Local MongoDB replica set
│   ├── vitest.config.ts               # Test configuration
│   ├── .env.example                   # Environment template
│   └── package.json
│
├── render.yaml                        # Render deployment blueprint
├── .gitignore
└── README.md
```

---

## Environment Variables

### Backend — `server/.env`

| Variable | Required | Default | Description |
|---|:---:|---|---|
| `PORT` | No | `8080` | HTTP server port |
| `NODE_ENV` | No | `development` | Environment (`development` / `production` / `test`) |
| `MONGO_URI` | **Yes** | — | MongoDB connection string (Atlas or local) |
| `CORS_ORIGIN` | No | `http://localhost:5173` | Allowed origins (comma-separated for multiple) |
| `CLERK_SECRET_KEY` | No | — | Clerk secret key for JWT verification |
| `RATE_LIMIT_MAX` | No | `180` | Max requests per IP per minute |
| `MAX_UPLOAD_MB` | No | `25` | Maximum PDF upload size in MB |
| `ENABLE_OCR` | No | `false` | Enable Tesseract OCR for scanned invoices |
| `TESSERACT_LANG` | No | `eng` | Tesseract OCR language pack |
| `REALTIME_WS` | No | `false` | Use WebSocket instead of SSE |
| `INVOICE_PARSE_API_URL` | No | — | External invoice parsing API endpoint |
| `INVOICE_PARSE_API_KEY` | No | — | API key for external invoice parser |
| `INVOICE_PARSE_API_FORMAT` | No | `json` | Payload format for invoice API (`json` / `multipart`) |

### Frontend — `frontend/.env`

| Variable | Required | Default | Description |
|---|:---:|---|---|
| `VITE_API_BASE` | **Yes** | — | Backend API base URL (e.g., `http://localhost:8080`) |

---

## API Reference

Base URL: `http://localhost:8080`

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Returns `{"status":"ok"}` if the server is running |

### Parts

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/parts` | List all parts (supports search, filter, pagination) | Required |
| `POST` | `/api/parts` | Create a new part | Manager |
| `PATCH` | `/api/parts/:partId` | Update an existing part | Manager |
| `DELETE` | `/api/parts/:partId` | Delete a part | Manager |

### Movements (Transactions)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/movements` | List movements (supports filter by type, date range, pagination) | Required |
| `POST` | `/api/movements` | Create a new movement (auto-updates stock) | Manager |

### Statistics

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/stats/overview` | Dashboard KPIs (total SKUs, stock levels, inventory value, 24h changes) | Required |
| `GET` | `/api/stats/top-skus` | Top SKUs by movement volume | Required |
| `GET` | `/api/stats/daily-net` | Daily net movement data for charts | Required |

### Invoices

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/invoices/parse` | Upload & parse a PDF invoice (returns extracted line items) | Manager |
| `POST` | `/api/invoices/ingest` | Ingest parsed invoice data into inventory | Manager |

### Data Export

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/export/parts` | Export parts as CSV or JSON | Required |
| `GET` | `/api/export/movements` | Export movements as CSV or JSON | Required |

### Real-Time Events

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/events/stream` | SSE connection for live inventory updates | Required |

---

## Data Models

### Part

| Field | Type | Required | Description |
|---|---|:---:|---|
| `partId` | `string` | ✓ | Unique SKU identifier |
| `name` | `string` | ✓ | Part display name |
| `category` | `string` | | Product category |
| `location` | `string` | | Storage location |
| `unit` | `enum` | ✓ | Unit of measure: `pcs`, `pair`, `m`, `set`, `roll` |
| `minStock` | `number` | | Minimum stock threshold (default: `0`) |
| `inStock` | `number` | | Current stock quantity |
| `reserved` | `number` | | Reserved quantity |
| `unitCost` | `number` | | Cost per unit (₹) |
| `taxRate` | `number` | | Tax rate percentage (0–100) |
| `supplier` | `string` | | Supplier name |
| `wattpics` | `number` | | Wattage rating (solar-specific) |
| `powerUnit` | `enum` | | Power unit: `wp` or `kw` |
| `lastMovementAt` | `Date` | | Timestamp of last movement |

### Movement

| Field | Type | Required | Description |
|---|---|:---:|---|
| `partId` | `string` | ✓ | Reference to part SKU |
| `type` | `enum` | ✓ | Transaction type: `PURCHASE`, `SALE`, `RETURN`, `ADJUST` |
| `quantity` | `number` | ✓ | Units moved (positive for purchase/adjust, negative for sale/return) |
| `unitCost` | `number` | | Cost per unit at time of transaction |
| `salePrice` | `number` | | Sale price per unit |
| `counterparty` | `string` | | Supplier or customer name |
| `taxRate` | `number` | | Tax rate at time of transaction |
| `taxAmount` | `number` | | Calculated tax amount |
| `totalWithTax` | `number` | | Total amount including tax |
| `wattpics` | `number` | | Wattage (inherited from part) |
| `category` | `string` | | Category (inherited from part) |
| `note` | `string` | | Free-text note |
| `invoiceNo` | `string` | | Associated invoice number |
| `at` | `Date` | | Transaction timestamp (default: now) |

---

## Authentication & Authorization

SunGrid uses [Clerk](https://clerk.com/) for authentication with two access levels:

| Role | Permissions |
|---|---|
| **Viewer** | Read-only access to dashboard, parts list, movements log, and exports |
| **Manager** | Full access — create/update/delete parts, record movements, import invoices, reset data |

### How It Works

1. **Frontend** — Clerk React SDK manages sign-in/sign-up UI and attaches JWT tokens to API requests
2. **Backend** — `clerkMiddleware()` parses the JWT on every request; `requireAuth` and `requireManager` middleware gates protected routes
3. **Role Assignment** — Set `{ role: "manager" }` in a user's `publicMetadata` via the Clerk Dashboard

> **Note:** If `CLERK_SECRET_KEY` is not set, authentication middleware gracefully degrades, allowing unauthenticated access in development.

---

## Real-Time Updates

The application uses **Server-Sent Events (SSE)** to push inventory changes to all connected clients instantly:

1. Client connects to `GET /api/events/stream`
2. When a part or movement is created/updated/deleted, the server broadcasts an event
3. Connected clients receive the event and update their local Zustand stores
4. Dashboard KPIs, charts, and tables refresh automatically — no polling required

The SSE connection includes automatic reconnection with exponential backoff.

---

## Deployment

### Backend → Render

A `render.yaml` blueprint is included for one-click deployment:

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/) → **New** → **Blueprint**
3. Connect your repository and select `render.yaml`
4. Configure environment variables in the Render dashboard:
   - `MONGO_URI` — your Atlas connection string
   - `CLERK_SECRET_KEY` — your Clerk secret key
   - `CORS_ORIGIN` — your frontend URL (e.g., `https://your-app.vercel.app`)

### Frontend → Vercel

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) → **Import Project**
3. Set the **Root Directory** to `frontend`
4. Add environment variable:
   - `VITE_API_BASE` = your Render backend URL (e.g., `https://sungrid-api.onrender.com`)
5. Deploy — Vercel auto-detects Vite and applies the included `vercel.json` rewrites

### Production Checklist

- [ ] MongoDB Atlas IP whitelist includes hosting provider IPs (or `0.0.0.0/0`)
- [ ] `CORS_ORIGIN` matches your frontend production URL
- [ ] `NODE_ENV` is set to `production`
- [ ] `CLERK_SECRET_KEY` is set (production key, not test key)
- [ ] Rate limiting is configured appropriately for expected traffic

---

## Development Scripts

### Backend — `server/`

```bash
npm run dev          # Start dev server with hot reload (tsx watch)
npm run build        # Build for production (tsup → dist/)
npm start            # Run production build
npm run seed         # Seed database with sample data
npm test             # Run tests (vitest)
npm run test:watch   # Run tests in watch mode
```

### Frontend — `frontend/`

```bash
npm run dev          # Start Vite dev server (port 5173)
npm run build        # Production build (dist/)
npm run build:dev    # Development build (with source maps)
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
```

---

## Troubleshooting

<details>
<summary><strong>Cannot connect to MongoDB Atlas</strong></summary>

1. Verify your IP is in the Atlas **Network Access** whitelist
2. Check the connection string for typos — no spaces, special characters URL-encoded
3. Confirm the database user password is correct
4. Ensure the Atlas cluster is not paused (free clusters pause after 60 days of inactivity)

```bash
# Test connectivity
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/sungrid"
```

</details>

<details>
<summary><strong>Frontend shows "Reconnecting..." in header</strong></summary>

The SSE connection to the backend has dropped. Check that:

1. The backend server is running (`curl http://localhost:8080/health`)
2. `VITE_API_BASE` in `frontend/.env` matches the backend URL
3. CORS is configured correctly (`CORS_ORIGIN` in `server/.env`)

</details>

<details>
<summary><strong>Port already in use</strong></summary>

Change the port in `server/.env`:

```env
PORT=8081
```

Then update `frontend/.env`:

```env
VITE_API_BASE=http://localhost:8081
```

Restart both servers.

</details>

<details>
<summary><strong>Invoice PDF parsing fails</strong></summary>

1. Ensure the file is under the `MAX_UPLOAD_MB` limit (default: 25 MB)
2. Only text-based PDFs are supported by default — scanned images require enabling OCR (`ENABLE_OCR=true`)
3. Check the backend logs for detailed error output

</details>

<details>
<summary><strong>Authentication errors (401 / 403)</strong></summary>

1. Verify `CLERK_SECRET_KEY` is set correctly in `server/.env`
2. For 403 errors, ensure the user has `{ role: "manager" }` in their Clerk `publicMetadata`
3. Check that the Clerk Publishable Key is configured in the frontend

</details>

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built for [Sushmitha Solar Power]()**

*Efficient solar equipment inventory management*

</div>
