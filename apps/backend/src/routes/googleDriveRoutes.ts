import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import * as googleDriveController from '../controllers/googleDriveController.js';

const router = Router();

// OAuth routes
router.get('/auth-url', googleDriveController.getAuthUrl);
router.get('/callback', googleDriveController.handleOAuthCallback);

// All other routes require authentication
router.use(authMiddleware);

// File operations
router.get('/files', googleDriveController.listFiles);
router.get('/files/:fileId', googleDriveController.getFileMetadata);
router.get('/files/:fileId/download', googleDriveController.downloadFile);
router.post('/files/upload', googleDriveController.upload.single('file'), googleDriveController.uploadFile);
router.delete('/files/:fileId', googleDriveController.deleteFile);
router.post('/files/:fileId/share', googleDriveController.shareFile);

// XLSX specific operations
router.get('/xlsx/:fileId', googleDriveController.readXlsxFile);
router.post('/xlsx/upload', googleDriveController.uploadXlsxFile);

export default router;
