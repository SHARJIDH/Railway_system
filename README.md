# Railway Management System

A ticket booking platform.

## Features

- User registration and authentication with JWT
- Train management with admin privileges
- Real-time seat booking with concurrency control
- Automated seat availability tracking
- Type-safe database operations with Prisma
- Transaction-based booking system

## Technology Stack

- **Backend**: Node.js, Express.js
- **ORM**: Prisma 6.0.1
- **Database**: PostgreSQL (Neon.tech)
- **Authentication**: JWT
- **Security**: Helmet, CORS
- **Type Safety**: Prisma Client

## Prerequisites

- Node.js 
- PostgreSQL database (i have used Neon.tech)
- npm or yarn

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000

# Database Configuration (Neon.tech)
DATABASE_URL="postgresql://user:password@host:port/database?schema=public&sslmode=require"

# Authentication
JWT_SECRET=your_jwt_secret
ADMIN_API_KEY=your_admin_api_key

# Optional: Prisma Logging
DEBUG="prisma:client,prisma:engine"
```

## Prisma Setup

1. **Initialize Prisma**:
   ```bash
   npx prisma init
   ```

2. **Database Push** (Development):
   ```bash
   npx prisma db push
   ```

3. **Create Migration** (Production):
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

5. **View Database with Prisma Studio**:
   ```bash
   npx prisma studio
   ```

## Installation

1. Clone the repository
  ```bash
  https://github.com/SHARJIDH/Railway_system.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (see above)
4. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```
5. Apply database migrations:
   ```bash
   npm run prisma:migrate
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```

## Database Schema (Prisma)

```prisma
model User {
  id        Int       @id @default(autoincrement())
  username  String    @unique
  email     String    @unique
  password  String
  bookings  Booking[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Train {
  id                 Int                @id @default(autoincrement())
  train_number      String             @unique
  train_name        String
  source_station    String
  destination_station String
  total_seats       Int
  bookings          Booking[]
  seatAvailability  SeatAvailability[]
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt
}

model Booking {
  id         Int      @id @default(autoincrement())
  user       User     @relation(fields: [user_id], references: [id])
  user_id    Int
  train      Train    @relation(fields: [train_id], references: [id])
  train_id   Int
  seat_number Int
  travel_date DateTime
  status     String   @default("confirmed")
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([train_id, seat_number, travel_date])
}

model SeatAvailability {
  id          Int      @id @default(autoincrement())
  train       Train    @relation(fields: [train_id], references: [id])
  train_id    Int
  travel_date DateTime
  available_seats Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([train_id, travel_date])
}
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login

### Trains
- `POST /trains` - Add new train (admin only)
- `GET /trains/search` - Search available trains
- `GET /trains/:id` - Get train details
- `PUT /trains/:id` - Update train (admin only)
- `DELETE /trains/:id` - Delete train (admin only)

### Bookings
- `POST /bookings` - Create new booking
- `GET /bookings/my-bookings` - Get user's bookings
- `DELETE /bookings/:id` - Cancel booking

## Development Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Apply database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:reset` - Reset database (caution: deletes all data)
- `npm run prisma:seed` - Seed the database with initial data
