import { Request, Response } from 'express';
import * as commentService from '../services/commentService.js';

export async function createComment(req: Request, res: Response) {
  try {
    const { content, taskId } = req.body;
    const authorId = req.user!.userId;

    if (!content || !taskId) {
      return res.status(400).json({ error: 'Content and taskId are required' });
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

export async function getCommentsByTask(req: Request, res: Response) {
  try {
    const { taskId } = req.params;
    const comments = await commentService.getCommentsByTask(taskId);
    res.json(comments);
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
}

export async function updateComment(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const comment = await commentService.updateComment(id, { content });
    res.json(comment);
  } catch (error: any) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
}

export async function deleteComment(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await commentService.deleteComment(id);
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
}
