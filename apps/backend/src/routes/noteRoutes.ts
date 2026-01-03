import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import * as noteController from '../controllers/noteController.js';

const router = Router();

// All note routes require authentication
router.use(authMiddleware);

// Note CRUD
router.get('/', noteController.getNotesByEntity);
router.get('/:id', noteController.getNoteById);
router.post('/', noteController.createNote);
router.patch('/:id', noteController.updateNote);
router.delete('/:id', noteController.deleteNote);

export default router;
