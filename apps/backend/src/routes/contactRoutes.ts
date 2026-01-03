import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import * as contactController from '../controllers/contactController.js';

const router = Router();

// All contact routes require authentication
router.use(authMiddleware);

// Contact CRUD
router.get('/', contactController.getContacts);
router.get('/:id', contactController.getContactById);
router.post('/', contactController.createContact);
router.patch('/:id', contactController.updateContact);
router.delete('/:id', contactController.deleteContact);

// Contact related data
router.get('/:id/activities', contactController.getContactActivities);
router.get('/:id/emails', contactController.getContactEmails);
router.get('/:id/tasks', contactController.getContactTasks);

export default router;
