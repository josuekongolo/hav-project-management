import { Router } from 'express';
import { loginHandler, getMeHandler } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Registration disabled - team members are pre-configured
// router.post('/register', registerHandler);
router.post('/login', loginHandler);
router.get('/me', authMiddleware, getMeHandler);

export default router;
