import { Router } from 'express';
import * as commentController from '../controllers/commentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/', commentController.createComment);
router.get('/task/:taskId', commentController.getCommentsByTask);
router.patch('/:id', commentController.updateComment);
router.delete('/:id', commentController.deleteComment);

export default router;
