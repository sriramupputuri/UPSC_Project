import { Router } from 'express';
import { getProblems } from '../controllers/problemController.js';

const router = Router();

// Root route must come first, before parameterized routes
router.get('/', getProblems);
router.get('/:topic', getProblems);

export default router;


