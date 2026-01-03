import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import * as noteService from '../services/noteService.js';

export async function createNote(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const { content, noteableType, noteableId } = req.body;

    const note = await noteService.createNote({
      content,
      noteableType,
      noteableId,
      authorId: userId,
    });

    res.status(201).json({ note });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create note' });
  }
}

export async function getNotesByEntity(req: AuthRequest, res: Response) {
  try {
    const { noteableType, noteableId } = req.query;

    if (!noteableType || !noteableId || typeof noteableType !== 'string' || typeof noteableId !== 'string') {
      res.status(400).json({ error: 'noteableType and noteableId are required' });
      return;
    }

    const notes = await noteService.getNotesByEntity(
      noteableType as noteService.NoteableType,
      noteableId
    );

    res.json({ notes });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get notes' });
  }
}

export async function getNoteById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const note = await noteService.getNoteById(id);
    res.json({ note });
  } catch (error) {
    res.status(404).json({ error: error instanceof Error ? error.message : 'Note not found' });
  }
}

export async function updateNote(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const note = await noteService.updateNote(id, req.body, userId);
    res.json({ note });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update note' });
  }
}

export async function deleteNote(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const result = await noteService.deleteNote(id, userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete note' });
  }
}
