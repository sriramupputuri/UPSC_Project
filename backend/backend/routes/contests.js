import { Router } from 'express';
import { listContests, startContest } from '../controllers/contestController.js';
// import { verifyFirebaseToken } from '../config/firebaseAdmin.js';

const router = Router();

router.get('/', listContests);
// Temporarily remove Firebase auth for testing
router.get('/start/:id', startContest);

export default router;


