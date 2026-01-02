import { Router } from 'express';
import { getDashboardStatsHandler, getTeamWorkloadHandler } from '../controllers/dashboardController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/stats', getDashboardStatsHandler);
router.get('/team', getTeamWorkloadHandler);

export default router;
