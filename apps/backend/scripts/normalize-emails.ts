import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function normalizeEmails() {
  console.log('Starting email normalization...');

  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
      },
    });

    console.log(`Found ${users.length} users to process`);

    // Update each user's email to lowercase
    for (const user of users) {
      const normalizedEmail = user.email.toLowerCase().trim();

      if (user.email !== normalizedEmail) {
        console.log(`Updating ${user.email} -> ${normalizedEmail}`);

        await prisma.user.update({
          where: { id: user.id },
          data: { email: normalizedEmail },
        });
      } else {
        console.log(`Skipping ${user.email} (already normalized)`);
      }
    }

    console.log('Email normalization completed successfully!');
  } catch (error) {
    console.error('Error normalizing emails:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

normalizeEmails();
