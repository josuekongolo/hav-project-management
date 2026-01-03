import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import * as emailController from '../controllers/emailController.js';

const router = Router();

// Tracking routes (no auth required - called from email clients)
router.get('/track/open/:id', emailController.trackEmailOpen);
router.get('/track/click/:id', emailController.trackEmailClick);

// Test SMTP connection (no auth required for testing)
router.get('/test-smtp', async (_req, res) => {
  try {
    const { emailService } = await import('../services/emailService.js');
    const isConnected = await emailService.verifyConnection();
    res.json({
      connected: isConnected,
      message: isConnected ? 'SMTP connection successful' : 'SMTP connection failed - check console for details'
    });
  } catch (error) {
    console.error('SMTP test error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'SMTP test failed' });
  }
});

// All other email routes require authentication
router.use(authMiddleware);

// Email history
router.get('/', emailController.getEmails);
router.get('/stats', emailController.getEmailStats);
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
