import { Router } from 'express';
import {
  getMilestonesHandler,
  getMilestoneByIdHandler,
  createMilestoneHandler,
  updateMilestoneHandler,
  deleteMilestoneHandler,
} from '../controllers/milestoneController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getMilestonesHandler);
router.get('/:id', getMilestoneByIdHandler);
router.post('/', createMilestoneHandler);
router.patch('/:id', updateMilestoneHandler);
router.delete('/:id', deleteMilestoneHandler);

export default router;
