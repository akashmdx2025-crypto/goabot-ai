# 🤖 GoaBot AI — WhatsApp Assistant for Restaurants & Homestays

An AI-powered WhatsApp chatbot SaaS platform built for the Goa hospitality market. Automates customer communication for restaurants, cafes, beach shacks, and homestays.

## 🚀 Features

- **WhatsApp Chatbot** — Auto-responds to customer messages via Meta Cloud API
- **AI-Powered Conversations** — Uses OpenAI GPT-4o-mini for natural language understanding
- **Smart Booking System** — Multi-step conversational booking with confirmation
- **Menu Delivery** — Text, image, or PDF menu sharing via WhatsApp
- **Intent Classification** — Two-tier: keyword matching → AI fallback
- **Admin Dashboard** — Beautiful dark-themed React panel
- **Multi-Tenant** — Supports multiple businesses with isolated data
- **Review Responder** — AI-generated replies to customer reviews

## 📁 Project Structure

```
whatsapp-goa/
├── backend/          # Node.js + Express API server
│   ├── models/       # Mongoose data models
│   ├── routes/       # API routes (webhook, auth, bookings, menu)
│   ├── services/     # WhatsApp, AI, booking flow, menu services
│   └── seed.js       # Demo data seeder
├── frontend/         # React + Vite admin dashboard
│   └── src/
│       ├── pages/    # Dashboard, Bookings, Menu, Settings, Reviews
│       └── components/
└── README.md
```

## 🛠️ Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Meta Developer Account (for WhatsApp Cloud API)
- OpenAI API Key

### Backend
```bash
cd backend
cp .env.example .env  # Fill in your API keys
npm install
npm run seed          # Seed demo data
npm run dev           # Start server on :5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev           # Start dashboard on :5173
```

### Demo Login
After seeding: `admin@sunsetbeach.com` / `admin123`

## 📡 WhatsApp Integration

1. Create a Meta Developer App → WhatsApp Business product
2. Get your Phone Number ID and Access Token
3. Set webhook URL: `https://your-domain.com/api/webhook`
4. Use verify token from `.env` → `WHATSAPP_VERIFY_TOKEN`

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express, Mongoose |
| Frontend | React, Vite, React Router |
| Database | MongoDB |
| AI | OpenAI GPT-4o-mini |
| WhatsApp | Meta Cloud API |
| Auth | JWT + bcrypt |

## 📄 License
MIT
