import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import * as emailTemplateController from '../controllers/emailTemplateController.js';

const router = Router();

// All email template routes require authentication
router.use(authMiddleware);

// Email template CRUD
router.get('/', emailTemplateController.getEmailTemplates);
router.get('/:id', emailTemplateController.getEmailTemplateById);
router.post('/', emailTemplateController.createEmailTemplate);
router.patch('/:id', emailTemplateController.updateEmailTemplate);
router.delete('/:id', emailTemplateController.deleteEmailTemplate);

// Template rendering
router.post('/:id/render', emailTemplateController.renderTemplate);

export default router;
