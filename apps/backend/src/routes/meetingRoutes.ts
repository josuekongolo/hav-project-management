import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import * as meetingController from '../controllers/meetingController.js';

const router = Router();

// All meeting routes require authentication
router.use(authMiddleware);

// Meeting CRUD
router.get('/', meetingController.getMeetingsByEntity);
router.get('/user/me', meetingController.getMeetingsByUser);
router.get('/:id', meetingController.getMeetingById);
router.post('/', meetingController.createMeeting);
router.patch('/:id', meetingController.updateMeeting);
router.delete('/:id', meetingController.deleteMeeting);

export default router;
