const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@railway.com' },
    update: {},
    create: {
      email: 'admin@railway.com',
      username: 'admin',
      password: adminPassword,
      role: 'admin'
    }
  });

  // Create sample train
  const train = await prisma.train.upsert({
    where: { train_number: 'TR001' },
    update: {},
    create: {
      train_number: 'TR001',
      train_name: 'Express One',
      source_station: 'New York',
      destination_station: 'Washington DC',
      total_seats: 100
    }
  });

  // Create seat availability for next 30 days
  const today = new Date();
  const nextThirtyDays = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return date;
  });

  for (const date of nextThirtyDays) {
    await prisma.seatAvailability.upsert({
      where: {
        train_id_travel_date: {
          train_id: train.id,
          travel_date: date
        }
      },
      update: {},
      create: {
        train_id: train.id,
        travel_date: date,
        available_seats: train.total_seats
      }
    });
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
