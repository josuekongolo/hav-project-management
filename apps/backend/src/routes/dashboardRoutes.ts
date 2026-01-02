import { Router } from 'express';
import { getDashboardStatsHandler, getTeamWorkloadHandler, getRecentActivityHandler } from '../controllers/dashboardController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/stats', getDashboardStatsHandler);
router.get('/team', getTeamWorkloadHandler);
router.get('/activity', getRecentActivityHandler);

export default router;
