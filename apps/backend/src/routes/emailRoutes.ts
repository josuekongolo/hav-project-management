import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import * as emailController from '../controllers/emailController.js';

const router = Router();

// All email routes require authentication
router.use(authMiddleware);

// Email history
router.get('/', emailController.getEmails);
router.get('/:id', emailController.getEmailById);

// Send emails
router.post('/send', emailController.sendEmail);
router.post('/send-with-template', emailController.sendEmailWithTemplate);
router.post('/send-bulk', emailController.sendBulkEmails);

// Drafts
router.post('/draft', emailController.saveDraft);

// Delete
router.delete('/:id', emailController.deleteEmail);

export default router;
