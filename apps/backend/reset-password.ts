import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const newPassword = 'Havdis1234!?';
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  const user = await prisma.user.update({
    where: { email: 'marie@havdis.no' },
    data: { password: hashedPassword }
  });
  
  console.log('Password reset successfully for:', user.email);
  
  await prisma.$disconnect();
}

main();
