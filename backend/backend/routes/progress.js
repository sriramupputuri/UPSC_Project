import { Router } from 'express';
import { getAllUserProgress, getUserProgress } from '../controllers/progressController.js';

const router = Router();

router.get('/', getAllUserProgress);
router.get('/:userId', getUserProgress);

export default router;
