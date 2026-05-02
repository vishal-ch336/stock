# SunGrid Invoice Wizard

Inventory Management System for Solar Equipment with AI-Powered Invoice Processing

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20 or higher
- **MongoDB Atlas** account (free tier available)
- **npm** or **pnpm**

---

## 📋 Complete Setup Guide

### Step 1: Setup MongoDB Atlas

1. **Create Account**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up with email or GitHub/Google

2. **Create Free Cluster**
   - Choose **M0 FREE** tier
   - Select cloud provider (AWS, Google Cloud, or Azure)
   - Choose closest region
   - Cluster name: `sungrid`
   - Click **"Create"** (3-5 minutes)

3. **Configure Network Access**
   - Click **"Network Access"** in left sidebar
   - Click **"Add IP Address"**
   - Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Click **"Confirm"**

4. **Create Database User**
   - Click **"Database Access"** in left sidebar
   - Click **"Add New Database User"**
   - **Authentication:** Password
   - **Username:** `sungrid-user`
   - **Password:** Click "Autogenerate Secure Password"
   - **⚠️ COPY THE PASSWORD - You won't see it again!**
   - **Privileges:** Read and write to any database
   - Click **"Add User"**

5. **Get Connection String**
   - Click **"Clusters"** in left sidebar
   - Click **"Connect"** on your cluster
   - Choose **"Connect your application"**
   - **Driver:** Node.js
   - **Version:** 5.5 or later
   - **Copy the connection string** (looks like):
   ```
   mongodb+srv://sungrid-user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

---

### Step 2: Setup Backend

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file**

   Open `server/.env` and update the MongoDB connection string:
   ```env
   # Server Configuration
   PORT=8080
   NODE_ENV=development

   # MongoDB Atlas Connection
   MONGO_URI=mongodb+srv://sungrid-user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/sungrid?retryWrites=true&w=majority

   # CORS Configuration
   CORS_ORIGIN=http://localhost:5173

   # Rate Limiting
   RATE_LIMIT_MAX=180

   # File Upload
   MAX_UPLOAD_MB=25

   # OCR Feature (optional)
   REALTIME_WS=false
   ENABLE_OCR=false
   TESSERACT_LANG=eng
   ```

   **Important:**
   - Replace `YOUR_PASSWORD` with the password from Atlas
   - Replace `cluster0.xxxxx` with your actual cluster address
   - The `/sungrid` in the URI is the database name

5. **Start backend server**
   ```bash
   npm run dev
   ```

   You should see:
   ```
   ✓ MongoDB connected
   ✓ Server started on port 8080
   ```

6. **Test backend**
   ```bash
   curl http://localhost:8080/health
   ```
   Expected: `{"status":"ok"}`

---

### Step 3: Setup Frontend

1. **Open new terminal, navigate to frontend**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   echo "VITE_API_BASE=http://localhost:8080" > .env
   ```

4. **Start frontend server**
   ```bash
   npm run dev
   ```

   Frontend will start on `http://localhost:5173`

---

### Step 4: Access the Application

1. **Open browser**
   - Navigate to `http://localhost:5173`

2. **You should see:**
   - Overview dashboard
   - Parts, Movements, Settings tabs
   - Manager mode toggle in header

3. **Test real-time updates**
   - Click **"Manager Mode"** toggle (enables write operations)
   - Go to **Movements** tab
   - Click **"Purchase"** button
   - Create a purchase transaction
   - Watch it appear instantly in Recent Changes

---

## 📂 Project Structure

```
sungrid-invoice-wizard-main/
├── frontend/              # React SPA
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Main pages
│   │   ├── stores/        # State management
│   │   ├── lib/           # API client
│   │   └── types/         # TypeScript types
│   ├── package.json
│   └── vite.config.ts
├── server/                # Express API
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Business logic
│   │   ├── models/        # Database models
│   │   ├── schemas/       # Validation schemas
│   │   ├── middleware/    # Express middleware
│   │   └── index.ts       # Main server file
│   ├── package.json
│   └── .env.example
└── README.md              # This file
```

---

## 🔌 API Endpoints

### Parts
- `GET /api/parts` - List all parts
- `POST /api/parts` - Create part
- `PATCH /api/parts/:partId` - Update part
- `DELETE /api/parts/:partId` - Delete part

### Movements
- `GET /api/movements` - List transactions
- `POST /api/movements` - Create transaction

### Statistics
- `GET /api/stats/overview` - Dashboard KPIs
- `GET /api/stats/top-skus` - Top SKUs
- `GET /api/stats/daily-net` - Daily charts

### Real-time
- `GET /api/events/stream` - SSE connection

### Invoices
- `POST /api/invoices/parse` - Parse PDF invoice
- `POST /api/invoices/ingest` - Import invoice data

---

## 🛠️ Development Scripts

### Backend (`cd server`)
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm start          # Run production build
npm test           # Run tests
```

### Frontend (`cd frontend`)
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Lint code
```

---

## 🔧 Troubleshooting

### Backend won't connect to MongoDB Atlas

**Check:**
1. Network Access whitelist includes your IP
2. Connection string is correct (no spaces, special chars encoded)
3. Password is correct
4. Cluster is running (not paused)

**Solution:**
```bash
# Test connection string
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/sungrid"
```

### Frontend shows "Reconnecting..." in header

**Problem:** Backend not running or SSE connection failed

**Solution:**
```bash
# Check backend is running
curl http://localhost:8080/health

# If not, start backend
cd server && npm run dev
```

### Port 8080 already in use

**Solution:**
Edit `server/.env`:
```env
PORT=8081
```

Then restart backend and update `frontend/.env`:
```env
VITE_API_BASE=http://localhost:8081
```

---

## 📚 Key Features

- ✅ **Real-time Inventory Management** - Live updates via SSE
- ✅ **AI-Powered Invoice Import** - Parse PDF invoices automatically
- ✅ **Transaction History** - Track purchases, sales, returns, adjustments
- ✅ **Analytics Dashboard** - KPIs, charts, top SKUs
- ✅ **Manager Mode** - Role-based access control
- ✅ **Export Data** - CSV and JSON exports
- ✅ **Responsive Design** - Works on mobile and desktop

---

## 🏗️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite for development
- Zustand for state management
- shadcn-ui components
- Tailwind CSS

### Backend
- Node.js + Express
- MongoDB with Mongoose
- Server-Sent Events (SSE)
- Zod validation
- pdf-parse for invoices

### Database
- MongoDB Atlas (Cloud)
- Replica sets for change streams
- Automatic backups

---

## 📝 Environment Variables

### Backend (server/.env)
```env
PORT=8080                                    # API port
MONGO_URI=mongodb+srv://...                 # Atlas connection
CORS_ORIGIN=http://localhost:5173           # Frontend URL
RATE_LIMIT_MAX=180                          # Requests per minute
MAX_UPLOAD_MB=25                            # PDF max size
NODE_ENV=development                        # Environment
```

### Frontend (frontend/.env)
```env
VITE_API_BASE=http://localhost:8080         # Backend URL
```

---

## 🚢 Production Deployment

### Backend
1. Deploy to Heroku, Railway, Render, or any Node.js host
2. Set environment variables
3. Ensure MongoDB Atlas IP whitelist includes hosting provider IPs
4. Build: `npm run build`
5. Start: `npm start`

### Frontend
1. Build: `npm run build`
2. Deploy `dist/` folder to Vercel, Netlify, Cloudflare Pages
3. Set `VITE_API_BASE` to production backend URL

---

## 📞 Support

For issues or questions:
- Check MongoDB Atlas status: [status.cloud.mongodb.com](https://status.cloud.mongodb.com)
- Review logs in both frontend and backend terminals
- Ensure all environment variables are set correctly

---

## 📄 License

MIT

---

**Built with ❤️ for efficient inventory management**
