import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  const password = await bcrypt.hash('Havdis1234!?', 12);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'andreas@havdis.no' },
      update: {},
      create: {
        email: 'andreas@havdis.no',
        password,
        name: 'Andreas',
        role: 'ADMIN',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Andreas',
      },
    }),
    prisma.user.upsert({
      where: { email: 'josue@havdis.no' },
      update: {},
      create: {
        email: 'josue@havdis.no',
        password,
        name: 'Josue',
        role: 'MEMBER',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Josue',
      },
    }),
    prisma.user.upsert({
      where: { email: 'lalit@havdis.no' },
      update: {},
      create: {
        email: 'lalit@havdis.no',
        password,
        name: 'Lalit',
        role: 'MEMBER',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lalit',
      },
    }),
    prisma.user.upsert({
      where: { email: 'ben@havdis.no' },
      update: {},
      create: {
        email: 'ben@havdis.no',
        password,
        name: 'Ben',
        role: 'MEMBER',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ben',
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
        assignees: {
          create: [{ userId: users[0].id }],
        },
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
        assignees: {
          create: [{ userId: users[1].id }],
        },
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
        assignees: {
          create: [{ userId: users[1].id }],
        },
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
        assignees: {
          create: [{ userId: users[2].id }],
        },
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
        assignees: {
          create: [{ userId: users[3].id }],
        },
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
        assignees: {
          create: [{ userId: users[2].id }],
        },
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
        assignees: {
          create: [{ userId: users[3].id }],
        },
        labels: {
          create: [{ labelId: labels[3].id }],
        },
      },
    }),
  ]);

  console.log(`Created ${tasks.length} sample tasks`);

  // Create email templates
  console.log('\nCreating email templates...');
  const emailTemplates = await Promise.all([
    prisma.emailTemplate.create({
      data: {
        name: 'Welcome Email',
        subject: 'Welcome to {{company}}!',
        body: `Hi {{firstName}},

Welcome to {{company}}! We're thrilled to have you on board.

We wanted to reach out and let you know that we're here to help you get the most out of our services. If you have any questions or need assistance, please don't hesitate to reach out.

Looking forward to working with you!

Best regards,
The {{company}} Team`,
        category: 'WELCOME',
        variables: ['firstName', 'company'],
        isActive: true,
      },
    }),
    prisma.emailTemplate.create({
      data: {
        name: 'Follow-up Email',
        subject: 'Following up on our conversation',
        body: `Hi {{firstName}},

I hope this email finds you well.

I wanted to follow up on our recent conversation about {{topic}}. Do you have any questions or would you like to schedule a call to discuss this further?

I'm available {{availability}} if you'd like to connect.

Best regards,
{{senderName}}`,
        category: 'FOLLOW_UP',
        variables: ['firstName', 'topic', 'availability', 'senderName'],
        isActive: true,
      },
    }),
    prisma.emailTemplate.create({
      data: {
        name: 'Proposal Email',
        subject: 'Proposal for {{company}}',
        body: `Hi {{firstName}},

Thank you for your interest in working with us. We've prepared a customized proposal for {{company}} that we believe will help you achieve your goals.

The proposal includes:
- {{proposalItem1}}
- {{proposalItem2}}
- {{proposalItem3}}

Total Investment: {{totalAmount}}

Please review the attached proposal and let me know if you have any questions. I'm happy to schedule a call to discuss the details.

Looking forward to working together!

Best regards,
{{senderName}}`,
        category: 'PROPOSAL',
        variables: [
          'firstName',
          'company',
          'proposalItem1',
          'proposalItem2',
          'proposalItem3',
          'totalAmount',
          'senderName',
        ],
        isActive: true,
      },
    }),
    prisma.emailTemplate.create({
      data: {
        name: 'Invoice Email',
        subject: 'Invoice #{{invoiceNumber}} from {{company}}',
        body: `Hi {{firstName}},

Thank you for your business! Please find attached invoice #{{invoiceNumber}} for the services rendered.

Invoice Details:
- Invoice Number: {{invoiceNumber}}
- Amount Due: {{amount}}
- Due Date: {{dueDate}}

Payment can be made via {{paymentMethod}}.

If you have any questions about this invoice, please don't hesitate to reach out.

Best regards,
The {{company}} Team`,
        category: 'INVOICE',
        variables: [
          'firstName',
          'company',
          'invoiceNumber',
          'amount',
          'dueDate',
          'paymentMethod',
        ],
        isActive: true,
      },
    }),
  ]);

  console.log(`Created ${emailTemplates.length} email templates`);

  console.log('\nSeeding completed successfully!');
  console.log('\nDefault login credentials:');
  console.log('  Email: Andreas@havdis.no | Password: Havdis1234!?');
  console.log('  Email: Josue@havdis.no   | Password: Havdis1234!?');
  console.log('  Email: Lalit@havdis.no   | Password: Havdis1234!?');
  console.log('  Email: Ben@havdis.no     | Password: Havdis1234!?');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
