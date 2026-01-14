import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/authMiddleware.js';
import * as importController from '../controllers/importController.js';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype === 'text/csv' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.originalname.endsWith('.csv')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

// Public routes (no auth required)
// Download CSV templates - just column headers, no sensitive data
router.get('/template/:entity', importController.downloadTemplate);

// Protected routes require authentication
router.use(authMiddleware);

// Preview CSV file (upload and parse headers + first rows)
router.post('/preview', upload.single('file'), importController.previewImport);

// Import data with column mapping
router.post('/contacts', importController.importContacts);
router.post('/companies', importController.importCompanies);
router.post('/deals', importController.importDeals);

// Get entity field definitions for column mapping UI
router.get('/fields/:entity', importController.getEntityFields);

export default router;
