import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import * as callLogController from '../controllers/callLogController.js';

const router = Router();

// All call log routes require authentication
router.use(authMiddleware);

// Call log CRUD
router.get('/', callLogController.getCallLogsByEntity);
router.get('/:id', callLogController.getCallLogById);
router.post('/', callLogController.createCallLog);
router.patch('/:id', callLogController.updateCallLog);
router.delete('/:id', callLogController.deleteCallLog);

export default router;
