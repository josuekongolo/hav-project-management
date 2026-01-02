import { Router } from 'express';
import {
  getLabelsHandler,
  getLabelByIdHandler,
  createLabelHandler,
  updateLabelHandler,
  deleteLabelHandler,
} from '../controllers/labelController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getLabelsHandler);
router.get('/:id', getLabelByIdHandler);
router.post('/', createLabelHandler);
router.patch('/:id', updateLabelHandler);
router.delete('/:id', deleteLabelHandler);

export default router;
