import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  const password = await bcrypt.hash('password123', 12);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@hav.com' },
      update: {},
      create: {
        email: 'admin@hav.com',
        password,
        name: 'Admin User',
        role: 'ADMIN',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
      },
    }),
    prisma.user.upsert({
      where: { email: 'alice@hav.com' },
      update: {},
      create: {
        email: 'alice@hav.com',
        password,
        name: 'Alice Johnson',
        role: 'MEMBER',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
      },
    }),
    prisma.user.upsert({
      where: { email: 'bob@hav.com' },
      update: {},
      create: {
        email: 'bob@hav.com',
        password,
        name: 'Bob Smith',
        role: 'MEMBER',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
      },
    }),
    prisma.user.upsert({
      where: { email: 'carol@hav.com' },
      update: {},
      create: {
        email: 'carol@hav.com',
        password,
        name: 'Carol Williams',
        role: 'MEMBER',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol',
      },
    }),
  ]);

  console.log('Created/Updated 4 team members');

  const labels = await Promise.all([
    prisma.label.upsert({
      where: { name: 'Bug' },
      update: {},
      create: { name: 'Bug', color: '#ef4444' },
    }),
    prisma.label.upsert({
      where: { name: 'Feature' },
      update: {},
      create: { name: 'Feature', color: '#3b82f6' },
    }),
    prisma.label.upsert({
      where: { name: 'Enhancement' },
      update: {},
      create: { name: 'Enhancement', color: '#10b981' },
    }),
    prisma.label.upsert({
      where: { name: 'Documentation' },
      update: {},
      create: { name: 'Documentation', color: '#8b5cf6' },
    }),
    prisma.label.upsert({
      where: { name: 'Urgent' },
      update: {},
      create: { name: 'Urgent', color: '#dc2626' },
    }),
  ]);

  console.log('Created/Updated 5 labels');

  const milestone = await prisma.milestone.upsert({
    where: { id: 'milestone-1' },
    update: {},
    create: {
      id: 'milestone-1',
      name: 'MVP Launch',
      description: 'Initial product launch with core features',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-03-31'),
      status: 'ACTIVE',
    },
  });

  console.log('Created/Updated milestone: MVP Launch');

  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Set up project repository',
        description: 'Initialize Git repository and configure project structure',
        status: 'DONE',
        priority: 'HIGH',
        position: 0,
        creatorId: users[0].id,
        assigneeId: users[0].id,
        milestoneId: milestone.id,
        labels: {
          create: [{ labelId: labels[1].id }],
        },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Design database schema',
        description: 'Create comprehensive database schema with all entities',
        status: 'DONE',
        priority: 'HIGH',
        position: 1,
        creatorId: users[0].id,
        assigneeId: users[1].id,
        milestoneId: milestone.id,
        labels: {
          create: [{ labelId: labels[1].id }],
        },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Implement authentication',
        description: 'Build JWT-based authentication system',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        position: 0,
        creatorId: users[0].id,
        assigneeId: users[1].id,
        milestoneId: milestone.id,
        dueDate: new Date('2026-01-15'),
        labels: {
          create: [{ labelId: labels[1].id }],
        },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Build Kanban board UI',
        description: 'Create drag-and-drop Kanban board interface',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        position: 1,
        creatorId: users[0].id,
        assigneeId: users[2].id,
        milestoneId: milestone.id,
        dueDate: new Date('2026-01-20'),
        labels: {
          create: [{ labelId: labels[1].id }],
        },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Create team dashboard',
        description: 'Build overview dashboard showing team member workloads',
        status: 'TODO',
        priority: 'MEDIUM',
        position: 0,
        creatorId: users[0].id,
        assigneeId: users[3].id,
        milestoneId: milestone.id,
        labels: {
          create: [{ labelId: labels[1].id }],
        },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Implement milestone tracking',
        description: 'Add milestone management and progress tracking',
        status: 'TODO',
        priority: 'MEDIUM',
        position: 1,
        creatorId: users[0].id,
        milestoneId: milestone.id,
        labels: {
          create: [{ labelId: labels[1].id }],
        },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Fix responsive layout issues',
        description: 'Ensure all pages work well on mobile devices',
        status: 'TODO',
        priority: 'LOW',
        position: 2,
        creatorId: users[1].id,
        assigneeId: users[2].id,
        labels: {
          create: [{ labelId: labels[0].id }],
        },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Write API documentation',
        description: 'Document all API endpoints with examples',
        status: 'TODO',
        priority: 'LOW',
        position: 3,
        creatorId: users[1].id,
        assigneeId: users[3].id,
        labels: {
          create: [{ labelId: labels[3].id }],
        },
      },
    }),
  ]);

  console.log(`Created ${tasks.length} sample tasks`);

  console.log('\nSeeding completed successfully!');
  console.log('\nDefault login credentials:');
  console.log('  Email: admin@hav.com | Password: password123');
  console.log('  Email: alice@hav.com | Password: password123');
  console.log('  Email: bob@hav.com   | Password: password123');
  console.log('  Email: carol@hav.com | Password: password123');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
