import { PrismaClient, ContactStatus, DealStage, TaskStatus, TaskPriority } from '@prisma/client';
import * as XLSX from 'xlsx';
import { z } from 'zod';

const prisma = new PrismaClient();

// ==================== TYPES ====================

export interface ParsedCSV {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
}

export interface ColumnMapping {
  [dbField: string]: string; // Maps database field to CSV column name
}

export interface ImportError {
  row: number;
  data: Record<string, string>;
  errors: string[];
}

export interface ImportResult {
  imported: number;
  failed: number;
  errors: ImportError[];
}

// ==================== VALIDATION SCHEMAS ====================

const contactImportSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  company: z.string().optional(),
  website: z.string().url('Invalid URL format').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  status: z.nativeEnum(ContactStatus).optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
});

const companyImportSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  industry: z.string().optional(),
  website: z.string().url('Invalid URL format').optional().or(z.literal('')),
  phone: z.string().optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  employees: z.coerce.number().int().positive().optional().or(z.literal('')),
  revenue: z.coerce.number().positive().optional().or(z.literal('')),
  description: z.string().optional(),
});

const dealImportSchema = z.object({
  title: z.string().min(1, 'Deal title is required'),
  value: z.coerce.number().min(0, 'Value must be positive'),
  stage: z.nativeEnum(DealStage).optional(),
  probability: z.coerce.number().min(0).max(100).optional(),
  contactEmail: z.string().email('Contact email is required for linking'),
  companyName: z.string().optional(),
  expectedCloseDate: z.string().optional(),
  description: z.string().optional(),
});

const taskImportSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  estimatedHours: z.coerce.number().min(0).optional().or(z.literal('')),
  dueDate: z.string().optional(),
  milestoneName: z.string().optional(),
  assigneeEmail: z.string().email().optional().or(z.literal('')),
  labels: z.string().optional(), // comma-separated label names
});

// ==================== CSV PARSING ====================

export function parseCSV(buffer: Buffer): ParsedCSV {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
    defval: '',
    raw: false,
  });

  if (jsonData.length === 0) {
    return { headers: [], rows: [], totalRows: 0 };
  }

  const headers = Object.keys(jsonData[0] || {});

  return {
    headers,
    rows: jsonData,
    totalRows: jsonData.length,
  };
}

export function getPreviewData(parsed: ParsedCSV, limit: number = 5) {
  return {
    headers: parsed.headers,
    preview: parsed.rows.slice(0, limit),
    totalRows: parsed.totalRows,
  };
}

// ==================== DATA TRANSFORMATION ====================

function transformRow(
  row: Record<string, string>,
  mapping: ColumnMapping
): Record<string, string> {
  const transformed: Record<string, string> = {};

  for (const [dbField, csvColumn] of Object.entries(mapping)) {
    if (csvColumn && row[csvColumn] !== undefined) {
      transformed[dbField] = row[csvColumn].trim();
    }
  }

  return transformed;
}

function extractZodErrors(error: z.ZodError): string[] {
  return error.errors.map(e => {
    const path = e.path.join('.');
    return path ? `${path}: ${e.message}` : e.message;
  });
}

// ==================== CONTACT IMPORT ====================

export async function importContacts(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
  userId: string
): Promise<ImportResult> {
  const result: ImportResult = { imported: 0, failed: 0, errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const rowIndex = i + 1;
    const row = rows[i];

    try {
      const transformed = transformRow(row, mapping);

      // Handle empty optional fields
      if (transformed.website === '') delete transformed.website;
      if (transformed.status === '') delete transformed.status;

      // Parse status if provided
      if (transformed.status) {
        const statusUpper = transformed.status.toUpperCase().replace(/\s+/g, '_');
        if (Object.values(ContactStatus).includes(statusUpper as ContactStatus)) {
          transformed.status = statusUpper;
        }
      }

      const validated = contactImportSchema.parse(transformed);
      const normalizedEmail = validated.email.toLowerCase().trim();

      // Check for duplicate email
      const existing = await prisma.contact.findUnique({
        where: { email: normalizedEmail },
      });

      if (existing) {
        result.failed++;
        result.errors.push({
          row: rowIndex,
          data: row,
          errors: [`Duplicate email: ${normalizedEmail} already exists`],
        });
        continue;
      }

      // Create contact
      await prisma.contact.create({
        data: {
          firstName: validated.firstName,
          lastName: validated.lastName,
          email: normalizedEmail,
          phone: validated.phone || null,
          company: validated.company || null,
          website: validated.website || null,
          address: validated.address || null,
          city: validated.city || null,
          country: validated.country || null,
          status: (validated.status as ContactStatus) || 'LEAD',
          source: validated.source || null,
          notes: validated.notes || null,
        },
      });

      result.imported++;
    } catch (error) {
      result.failed++;

      if (error instanceof z.ZodError) {
        result.errors.push({
          row: rowIndex,
          data: row,
          errors: extractZodErrors(error),
        });
      } else if (error instanceof Error) {
        result.errors.push({
          row: rowIndex,
          data: row,
          errors: [error.message],
        });
      } else {
        result.errors.push({
          row: rowIndex,
          data: row,
          errors: ['Unknown error occurred'],
        });
      }
    }
  }

  // Log activity
  if (result.imported > 0) {
    await prisma.activity.create({
      data: {
        type: 'NOTE_ADDED',
        title: 'Bulk import completed',
        description: `Imported ${result.imported} contacts${result.failed > 0 ? `, ${result.failed} failed` : ''}`,
        userId,
      },
    });
  }

  return result;
}

// ==================== COMPANY IMPORT ====================

export async function importCompanies(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
  _userId: string
): Promise<ImportResult> {
  const result: ImportResult = { imported: 0, failed: 0, errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const rowIndex = i + 1;
    const row = rows[i];

    try {
      const transformed = transformRow(row, mapping);

      // Handle empty optional fields
      if (transformed.website === '') delete transformed.website;
      if (transformed.email === '') delete transformed.email;
      if (transformed.employees === '') delete transformed.employees;
      if (transformed.revenue === '') delete transformed.revenue;

      const validated = companyImportSchema.parse(transformed);

      // Check for duplicate company name
      const existing = await prisma.company.findFirst({
        where: { name: { equals: validated.name, mode: 'insensitive' } },
      });

      if (existing) {
        result.failed++;
        result.errors.push({
          row: rowIndex,
          data: row,
          errors: [`Company "${validated.name}" already exists`],
        });
        continue;
      }

      // Create company
      await prisma.company.create({
        data: {
          name: validated.name,
          industry: validated.industry || null,
          website: validated.website || null,
          phone: validated.phone || null,
          email: validated.email || null,
          address: validated.address || null,
          city: validated.city || null,
          country: validated.country || null,
          employees: typeof validated.employees === 'number' ? validated.employees : null,
          revenue: typeof validated.revenue === 'number' ? validated.revenue : null,
          description: validated.description || null,
        },
      });

      result.imported++;
    } catch (error) {
      result.failed++;

      if (error instanceof z.ZodError) {
        result.errors.push({
          row: rowIndex,
          data: row,
          errors: extractZodErrors(error),
        });
      } else if (error instanceof Error) {
        result.errors.push({
          row: rowIndex,
          data: row,
          errors: [error.message],
        });
      } else {
        result.errors.push({
          row: rowIndex,
          data: row,
          errors: ['Unknown error occurred'],
        });
      }
    }
  }

  return result;
}

// ==================== DEAL IMPORT ====================

export async function importDeals(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
  userId: string
): Promise<ImportResult> {
  const result: ImportResult = { imported: 0, failed: 0, errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const rowIndex = i + 1;
    const row = rows[i];

    try {
      const transformed = transformRow(row, mapping);

      // Handle empty optional fields
      if (transformed.stage === '') delete transformed.stage;
      if (transformed.probability === '') delete transformed.probability;
      if (transformed.expectedCloseDate === '') delete transformed.expectedCloseDate;

      // Parse stage if provided
      if (transformed.stage) {
        const stageUpper = transformed.stage.toUpperCase().replace(/\s+/g, '_');
        if (Object.values(DealStage).includes(stageUpper as DealStage)) {
          transformed.stage = stageUpper;
        }
      }

      const validated = dealImportSchema.parse(transformed);
      const normalizedEmail = validated.contactEmail.toLowerCase().trim();

      // Find linked contact by email
      const contact = await prisma.contact.findUnique({
        where: { email: normalizedEmail },
      });

      if (!contact) {
        result.failed++;
        result.errors.push({
          row: rowIndex,
          data: row,
          errors: [`Contact with email "${normalizedEmail}" not found. Create the contact first.`],
        });
        continue;
      }

      // Find company if provided
      let companyId: string | null = null;
      if (validated.companyName) {
        const company = await prisma.company.findFirst({
          where: { name: { equals: validated.companyName, mode: 'insensitive' } },
        });
        if (company) {
          companyId = company.id;
        }
      }

      // Parse expected close date
      let expectedCloseDate: Date | null = null;
      if (validated.expectedCloseDate) {
        const parsed = new Date(validated.expectedCloseDate);
        if (!isNaN(parsed.getTime())) {
          expectedCloseDate = parsed;
        }
      }

      // Create deal
      await prisma.deal.create({
        data: {
          title: validated.title,
          value: validated.value,
          stage: (validated.stage as DealStage) || 'PROSPECT',
          probability: validated.probability || 50,
          expectedCloseDate,
          description: validated.description || null,
          contactId: contact.id,
          ownerId: userId,
          companyId,
        },
      });

      result.imported++;
    } catch (error) {
      result.failed++;

      if (error instanceof z.ZodError) {
        result.errors.push({
          row: rowIndex,
          data: row,
          errors: extractZodErrors(error),
        });
      } else if (error instanceof Error) {
        result.errors.push({
          row: rowIndex,
          data: row,
          errors: [error.message],
        });
      } else {
        result.errors.push({
          row: rowIndex,
          data: row,
          errors: ['Unknown error occurred'],
        });
      }
    }
  }

  // Log activity
  if (result.imported > 0) {
    await prisma.activity.create({
      data: {
        type: 'DEAL_CREATED',
        title: 'Bulk deal import completed',
        description: `Imported ${result.imported} deals${result.failed > 0 ? `, ${result.failed} failed` : ''}`,
        userId,
      },
    });
  }

  return result;
}

// ==================== TASK IMPORT ====================

export async function importTasks(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
  userId: string
): Promise<ImportResult> {
  const result: ImportResult = { imported: 0, failed: 0, errors: [] };

  // Get the max position for new tasks
  const maxPositionResult = await prisma.task.aggregate({
    _max: { position: true },
  });
  let currentPosition = (maxPositionResult._max.position || 0) + 1;

  for (let i = 0; i < rows.length; i++) {
    const rowIndex = i + 1;
    const row = rows[i];

    try {
      const transformed = transformRow(row, mapping);

      // Handle empty optional fields
      if (transformed.status === '') delete transformed.status;
      if (transformed.priority === '') delete transformed.priority;
      if (transformed.estimatedHours === '') delete transformed.estimatedHours;
      if (transformed.dueDate === '') delete transformed.dueDate;
      if (transformed.assigneeEmail === '') delete transformed.assigneeEmail;

      // Parse status if provided
      if (transformed.status) {
        const statusUpper = transformed.status.toUpperCase().replace(/\s+/g, '_');
        if (Object.values(TaskStatus).includes(statusUpper as TaskStatus)) {
          transformed.status = statusUpper;
        }
      }

      // Parse priority if provided
      if (transformed.priority) {
        const priorityUpper = transformed.priority.toUpperCase();
        if (Object.values(TaskPriority).includes(priorityUpper as TaskPriority)) {
          transformed.priority = priorityUpper;
        }
      }

      const validated = taskImportSchema.parse(transformed);

      // Find milestone if provided
      let milestoneId: string | null = null;
      if (validated.milestoneName) {
        const milestone = await prisma.milestone.findFirst({
          where: { name: { equals: validated.milestoneName, mode: 'insensitive' } },
        });
        if (milestone) {
          milestoneId = milestone.id;
        }
      }

      // Find assignee if provided
      let assigneeId: string | null = null;
      if (validated.assigneeEmail) {
        const assignee = await prisma.user.findUnique({
          where: { email: validated.assigneeEmail.toLowerCase() },
        });
        if (assignee) {
          assigneeId = assignee.id;
        }
      }

      // Parse due date
      let dueDate: Date | null = null;
      if (validated.dueDate) {
        const parsed = new Date(validated.dueDate);
        if (!isNaN(parsed.getTime())) {
          dueDate = parsed;
        }
      }

      // Create task
      const task = await prisma.task.create({
        data: {
          title: validated.title,
          description: validated.description || null,
          status: (validated.status as TaskStatus) || 'TODO',
          priority: (validated.priority as TaskPriority) || 'MEDIUM',
          position: currentPosition++,
          estimatedHours: typeof validated.estimatedHours === 'number' ? validated.estimatedHours : null,
          dueDate,
          milestoneId,
          creatorId: userId,
        },
      });

      // Add assignee if found
      if (assigneeId) {
        await prisma.taskAssignee.create({
          data: {
            taskId: task.id,
            userId: assigneeId,
          },
        });
      }

      // Handle labels (comma-separated)
      if (validated.labels) {
        const labelNames = validated.labels.split(',').map(l => l.trim()).filter(Boolean);
        for (const labelName of labelNames) {
          // Find or create label
          let label = await prisma.label.findFirst({
            where: { name: { equals: labelName, mode: 'insensitive' } },
          });

          if (!label) {
            // Create label with a random color
            const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];
            label = await prisma.label.create({
              data: {
                name: labelName,
                color: colors[Math.floor(Math.random() * colors.length)],
              },
            });
          }

          await prisma.taskLabel.create({
            data: {
              taskId: task.id,
              labelId: label.id,
            },
          });
        }
      }

      result.imported++;
    } catch (error) {
      result.failed++;

      if (error instanceof z.ZodError) {
        result.errors.push({
          row: rowIndex,
          data: row,
          errors: extractZodErrors(error),
        });
      } else if (error instanceof Error) {
        result.errors.push({
          row: rowIndex,
          data: row,
          errors: [error.message],
        });
      } else {
        result.errors.push({
          row: rowIndex,
          data: row,
          errors: ['Unknown error occurred'],
        });
      }
    }
  }

  return result;
}

// ==================== TEMPLATES ====================

export function generateTemplate(entity: 'contacts' | 'companies' | 'deals' | 'tasks'): string {
  const templates: Record<string, string[]> = {
    contacts: [
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Company',
      'Website',
      'Address',
      'City',
      'Country',
      'Status',
      'Source',
      'Notes',
    ],
    companies: [
      'Name',
      'Industry',
      'Website',
      'Phone',
      'Email',
      'Address',
      'City',
      'Country',
      'Employees',
      'Revenue',
      'Description',
    ],
    deals: [
      'Title',
      'Value',
      'Stage',
      'Probability',
      'Contact Email',
      'Company Name',
      'Expected Close Date',
      'Description',
    ],
    tasks: [
      'Title',
      'Description',
      'Status',
      'Priority',
      'Estimated Hours',
      'Due Date',
      'Milestone',
      'Assignee Email',
      'Labels',
    ],
  };

  const headers = templates[entity];
  if (!headers) {
    throw new Error(`Invalid entity type: ${entity}`);
  }

  return headers.join(',') + '\n';
}

// ==================== FIELD DEFINITIONS ====================

export const ENTITY_FIELDS = {
  contacts: [
    { key: 'firstName', label: 'First Name', required: true },
    { key: 'lastName', label: 'Last Name', required: true },
    { key: 'email', label: 'Email', required: true },
    { key: 'phone', label: 'Phone', required: false },
    { key: 'company', label: 'Company Name', required: false },
    { key: 'website', label: 'Website', required: false },
    { key: 'address', label: 'Address', required: false },
    { key: 'city', label: 'City', required: false },
    { key: 'country', label: 'Country', required: false },
    { key: 'status', label: 'Status', required: false },
    { key: 'source', label: 'Source', required: false },
    { key: 'notes', label: 'Notes', required: false },
  ],
  companies: [
    { key: 'name', label: 'Company Name', required: true },
    { key: 'industry', label: 'Industry', required: false },
    { key: 'website', label: 'Website', required: false },
    { key: 'phone', label: 'Phone', required: false },
    { key: 'email', label: 'Email', required: false },
    { key: 'address', label: 'Address', required: false },
    { key: 'city', label: 'City', required: false },
    { key: 'country', label: 'Country', required: false },
    { key: 'employees', label: 'Employees', required: false },
    { key: 'revenue', label: 'Revenue', required: false },
    { key: 'description', label: 'Description', required: false },
  ],
  deals: [
    { key: 'title', label: 'Deal Title', required: true },
    { key: 'value', label: 'Value', required: true },
    { key: 'stage', label: 'Stage', required: false },
    { key: 'probability', label: 'Probability (%)', required: false },
    { key: 'contactEmail', label: 'Contact Email', required: true },
    { key: 'companyName', label: 'Company Name', required: false },
    { key: 'expectedCloseDate', label: 'Expected Close Date', required: false },
    { key: 'description', label: 'Description', required: false },
  ],
  tasks: [
    { key: 'title', label: 'Task Title', required: true },
    { key: 'description', label: 'Description', required: false },
    { key: 'status', label: 'Status (TODO, IN_PROGRESS, IN_REVIEW, DONE)', required: false },
    { key: 'priority', label: 'Priority (LOW, MEDIUM, HIGH, URGENT)', required: false },
    { key: 'estimatedHours', label: 'Estimated Hours', required: false },
    { key: 'dueDate', label: 'Due Date', required: false },
    { key: 'milestoneName', label: 'Milestone Name', required: false },
    { key: 'assigneeEmail', label: 'Assignee Email', required: false },
    { key: 'labels', label: 'Labels (comma-separated)', required: false },
  ],
};
