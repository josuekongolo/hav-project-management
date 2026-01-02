import { Router } from 'express';
import { getUsersHandler, getUserTasksHandler } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getUsersHandler);
router.get('/:id/tasks', getUserTasksHandler);

export default router;
