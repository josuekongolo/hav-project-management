import { Router } from 'express';
import { getUsersHandler, getUserTasksHandler, updateProfileHandler } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getUsersHandler);
router.patch('/profile', updateProfileHandler);
router.get('/:id/tasks', getUserTasksHandler);

export default router;
