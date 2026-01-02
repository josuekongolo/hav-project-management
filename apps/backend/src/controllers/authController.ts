import { Request, Response } from 'express';
import { register, login, getUserById } from '../services/authService.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export async function registerHandler(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, name, avatar } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' });
      return;
    }

    const result = await register({ email, password, name, avatar });

    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error && error.message === 'User with this email already exists') {
      res.status(409).json({ error: error.message });
      return;
    }
    throw error;
  }
}

export async function loginHandler(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const result = await login({ email, password });

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid credentials') {
      res.status(401).json({ error: error.message });
      return;
    }
    throw error;
  }
}

export async function getMeHandler(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await getUserById(req.userId);

    res.status(200).json({ user });
  } catch (error) {
    throw error;
  }
}
