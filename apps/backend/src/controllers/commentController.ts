import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import * as commentService from '../services/commentService.js';

export async function createComment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { content, taskId } = req.body;
    const authorId = req.userId!;

    if (!content || !taskId) {
      res.status(400).json({ error: 'Content and taskId are required' });
      return;
    }

    const comment = await commentService.createComment({
      content,
      taskId,
      authorId,
    });

    res.status(201).json(comment);
  } catch (error: any) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
}

export async function getCommentsByTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { taskId } = req.params;
    const comments = await commentService.getCommentsByTask(taskId);
    res.json(comments);
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
}

export async function updateComment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      res.status(400).json({ error: 'Content is required' });
      return;
    }

    const comment = await commentService.updateComment(id, { content });
    res.json(comment);
  } catch (error: any) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
}

export async function deleteComment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await commentService.deleteComment(id);
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
}
