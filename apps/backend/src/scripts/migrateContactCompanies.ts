import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateContactCompanies() {
  console.log('[Migration] Starting Contact.company → Company migration...');

  try {
    // Get all contacts with company strings
    const contacts = await prisma.contact.findMany({
      where: {
        company: {
          not: null,
        },
      },
      select: {
        id: true,
        company: true,
      },
    });

    console.log(`[Migration] Found ${contacts.length} contacts with company names`);

    // Extract unique company names
    const uniqueCompanyNames = new Set<string>();
    contacts.forEach((contact) => {
      if (contact.company && contact.company.trim()) {
        uniqueCompanyNames.add(contact.company.trim());
      }
    });

    console.log(`[Migration] Found ${uniqueCompanyNames.size} unique company names`);

    // Create Company records for each unique name
    const companyMap = new Map<string, string>(); // company name → company id

    for (const companyName of uniqueCompanyNames) {
      const company = await prisma.company.create({
        data: {
          name: companyName,
        },
      });

      companyMap.set(companyName, company.id);
      console.log(`[Migration] Created company: ${companyName} (${company.id})`);
    }

    // Update Contact.companyId references
    let contactsUpdated = 0;
    for (const contact of contacts) {
      if (contact.company && contact.company.trim()) {
        const companyId = companyMap.get(contact.company.trim());
        if (companyId) {
          await prisma.contact.update({
            where: { id: contact.id },
            data: { companyId },
          });
          contactsUpdated++;
        }
      }
    }

    console.log(`[Migration] Updated ${contactsUpdated} contacts with companyId`);

    // Update Deal.companyId based on contact's company
    const deals = await prisma.deal.findMany({
      include: {
        contact: true,
      },
    });

    let dealsUpdated = 0;
    for (const deal of deals) {
      if (deal.contact.companyId) {
        await prisma.deal.update({
          where: { id: deal.id },
          data: { companyId: deal.contact.companyId },
        });
        dealsUpdated++;
      }
    }

    console.log(`[Migration] Updated ${dealsUpdated} deals with companyId`);

    console.log('[Migration] Migration completed successfully!');
    console.log(`[Migration] Summary:`);
    console.log(`  - Companies created: ${uniqueCompanyNames.size}`);
    console.log(`  - Contacts updated: ${contactsUpdated}`);
    console.log(`  - Deals updated: ${dealsUpdated}`);
  } catch (error) {
    console.error('[Migration] Error during migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateContactCompanies()
  .then(() => {
    console.log('[Migration] Script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[Migration] Script failed:', error);
    process.exit(1);
  });
