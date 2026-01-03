import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type NoteableType = 'Contact' | 'Deal' | 'Company';

export interface CreateNoteData {
  content: string;
  noteableType: NoteableType;
  noteableId: string;
  authorId: string;
}

export interface UpdateNoteData {
  content?: string;
}

export async function createNote(data: CreateNoteData) {
  const { content, noteableType, noteableId, authorId } = data;

  // Determine which foreign key to set based on noteableType
  const noteData: any = {
    content,
    noteableType,
    noteableId,
    authorId,
  };

  if (noteableType === 'Contact') {
    // Verify contact exists
    const contact = await prisma.contact.findUnique({ where: { id: noteableId } });
    if (!contact) {
      throw new Error('Contact not found');
    }
    noteData.contactId = noteableId;
  } else if (noteableType === 'Deal') {
    // Verify deal exists
    const deal = await prisma.deal.findUnique({ where: { id: noteableId } });
    if (!deal) {
      throw new Error('Deal not found');
    }
    noteData.dealId = noteableId;
  } else if (noteableType === 'Company') {
    // Verify company exists
    const company = await prisma.company.findUnique({ where: { id: noteableId } });
    if (!company) {
      throw new Error('Company not found');
    }
    noteData.companyId = noteableId;
  } else {
    throw new Error('Invalid noteableType');
  }

  const note = await prisma.note.create({
    data: noteData,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  });

  // Log activity
  if (noteableType === 'Contact') {
    await prisma.activity.create({
      data: {
        type: 'NOTE_ADDED',
        title: 'Note added',
        description: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
        contactId: noteableId,
        userId: authorId,
      },
    });
  }

  return note;
}

export async function getNotesByEntity(noteableType: NoteableType, noteableId: string) {
  const notes = await prisma.note.findMany({
    where: {
      noteableType,
      noteableId,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return notes;
}

export async function getNoteById(id: string) {
  const note = await prisma.note.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  });

  if (!note) {
    throw new Error('Note not found');
  }

  return note;
}

export async function updateNote(id: string, data: UpdateNoteData, userId: string) {
  const note = await prisma.note.findUnique({ where: { id } });
  if (!note) {
    throw new Error('Note not found');
  }

  // Verify the user is the author
  if (note.authorId !== userId) {
    throw new Error('You can only edit your own notes');
  }

  const updatedNote = await prisma.note.update({
    where: { id },
    data,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  });

  return updatedNote;
}

export async function deleteNote(id: string, userId: string) {
  const note = await prisma.note.findUnique({ where: { id } });
  if (!note) {
    throw new Error('Note not found');
  }

  // Verify the user is the author
  if (note.authorId !== userId) {
    throw new Error('You can only delete your own notes');
  }

  await prisma.note.delete({
    where: { id },
  });

  return { message: 'Note deleted successfully' };
}
