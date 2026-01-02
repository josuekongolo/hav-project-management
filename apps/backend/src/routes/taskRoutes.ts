import { Router } from 'express';
import {
  getTasksHandler,
  getTaskByIdHandler,
  createTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
  moveTaskHandler,
} from '../controllers/taskController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getTasksHandler);
router.get('/:id', getTaskByIdHandler);
router.post('/', createTaskHandler);
router.patch('/:id', updateTaskHandler);
router.delete('/:id', deleteTaskHandler);
router.patch('/:id/move', moveTaskHandler);

export default router;
