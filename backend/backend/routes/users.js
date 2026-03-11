import { Router } from 'express';
import { getUserStats, getUserLeaderboard } from '../controllers/userController.js';

const router = Router();

router.get('/stats', getUserStats);
router.get('/leaderboard', getUserLeaderboard);

export default router;
