import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);
  const alice = await prisma.user.upsert({
    where: { email: 'alice@student.edu' },
    update: {},
    create: { email: 'alice@student.edu', name: 'Alice', passwordHash },
  });
  const bob = await prisma.user.upsert({
    where: { email: 'bob@student.edu' },
    update: {},
    create: { email: 'Bob', name: 'Bob', passwordHash },
  });

  await prisma.transaction.createMany({
    data: [
      { userId: alice.id, amount: 2.75, description: 'Coffee' , category: 'food'},
      { userId: alice.id, amount: 12.20, description: 'Bus card', category: 'transport'},
      { userId: bob.id, amount: 5.10, description: 'Snacks', category: 'food'},
    ],
  });
}

main().finally(async () => {
  await prisma.$disconnect();
});
