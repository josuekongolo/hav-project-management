import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import * as dealController from '../controllers/dealController.js';

const router = Router();

// All deal routes require authentication
router.use(authMiddleware);

// Deal CRUD
router.get('/', dealController.getDeals);
router.get('/stats', dealController.getDealStats);
router.get('/:id', dealController.getDealById);
router.post('/', dealController.createDeal);
router.patch('/:id', dealController.updateDeal);
router.delete('/:id', dealController.deleteDeal);

// Update deal stage
router.patch('/:id/stage', dealController.updateDealStage);

export default router;
