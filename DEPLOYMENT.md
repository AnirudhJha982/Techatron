# Kisan Portal - Deployment Guide (MongoDB Atlas & Vercel)

This document provides step-by-step instructions for configuring, seeding, and deploying **Kisan Portal**—a full-stack Indian Government agricultural procurement portal built with **Next.js**, **TypeScript**, **MongoDB Atlas**, **Mongoose**, and **NextAuth**.

---

## Technical Stack & Architecture

- **Framework**: Next.js (App Router, Server Actions)
- **Database**: MongoDB Atlas (Cloud Database)
- **ORM / ODM**: Mongoose with serverless connection pooling cache (`src/lib/mongodb.ts`)
- **Authentication**: NextAuth.js v5 (JWT Strategy)
- **Styling**: Tailwind CSS & Lucide Icons
- **Deployment Target**: Vercel

---

## 1. Prerequisites & Environment Setup

### Required Environment Variables

Create a `.env.local` file in the root directory (or configure in Vercel Project Settings):

```env
# MongoDB Atlas Connection URI
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/kisan_portal?retryWrites=true&w=majority

# NextAuth Encryption Secret
AUTH_SECRET=your_super_secret_auth_key_here

# App Base URL
NEXTAUTH_URL=http://localhost:3000
```

---

## 2. Database Provisioning & Seeding

### Seeding Initial Data into MongoDB Atlas

The application includes a automated database seed script in `scripts/seed-mongo.ts`.

To seed your MongoDB Atlas database with test accounts, procurement centres, slots, bookings, and audit records, run:

```bash
# Using ts-node / npx
npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" scripts/seed-mongo.ts
```

### Pre-configured Demo Test Accounts:

| Role | Phone Number (Login ID) | Password | Access Level |
|---|---|---|---|
| **Admin Officer** | `9876543212` | `password123` | National HQ Dashboard & Analytics |
| **Mandi Worker** | `9876543211` | `password123` | Gate Queue Control & Produce Weighbridge |
| **Farmer** | `9876543210` | `password123` | Slot Booking, Digital Token & Payment Tracking |

---

## 3. Atomic Slot Booking Concurrency

Slot booking concurrency control is handled using MongoDB's atomic document update operations:

```typescript
const updatedSlot = await Slot.findOneAndUpdate(
  {
    _id: slotId,
    $expr: { $lt: ["$bookedCount", "$capacity"] }
  },
  { $inc: { bookedCount: 1 } },
  { new: true }
);
```

This prevents overbooking when multiple farmers attempt to book the last remaining slot simultaneously, guaranteeing thread safety without requiring external lock services.

---

## 4. Deploying to Vercel

1. Push code to your GitHub repository (`https://github.com/AnirudhJha982/Techatron.git`).
2. Connect your GitHub repository to **Vercel**.
3. In Vercel Project Settings $\rightarrow$ Environment Variables, add:
   - `MONGODB_URI`
   - `AUTH_SECRET`
4. Deploy the project. Vercel will automatically build the Next.js application using `npm run build`.

---

## 5. Verification Commands

Run local typechecking and production build verification:

```bash
# Type check
npx tsc --noEmit

# Production build test
npm run build
```
