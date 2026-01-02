import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import * as notificationService from '../services/notificationService.js';

export async function getNotifications(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const unreadOnly = req.query.unreadOnly === 'true';

    const notifications = await notificationService.getNotificationsByUser(userId, unreadOnly);
    res.json(notifications);
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}

export async function getUnreadCount(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const count = await notificationService.getUnreadCount(userId);
    res.json({ count });
  } catch (error: any) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
}

export async function markAsRead(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const notification = await notificationService.markAsRead(id);
    res.json(notification);
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
}

export async function markAllAsRead(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    await notificationService.markAllAsRead(userId);
    res.status(204).send();
  } catch (error: any) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
}

export async function deleteNotification(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await notificationService.deleteNotification(id);
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
}
