import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import * as companyController from '../controllers/companyController.js';

const router = Router();

// All company routes require authentication
router.use(authMiddleware);

// Company CRUD
router.get('/', companyController.getCompanies);
router.get('/search', companyController.searchCompanies);
router.get('/:id', companyController.getCompanyById);
router.post('/', companyController.createCompany);
router.patch('/:id', companyController.updateCompany);
router.delete('/:id', companyController.deleteCompany);

export default router;
