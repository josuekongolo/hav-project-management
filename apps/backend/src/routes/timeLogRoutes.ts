import { Router } from 'express';
import * as timeLogController from '../controllers/timeLogController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/', timeLogController.createTimeLog);
router.get('/task/:taskId', timeLogController.getTimeLogsByTask);
router.get('/user/:userId', timeLogController.getTimeLogsByUser);
router.delete('/:id', timeLogController.deleteTimeLog);

export default router;
