import { Router } from 'express';
import { 
  getDaily, 
  getDailyByDateController, 
  getAllDailyProblemsController,
  generateDailyProblemWithAI,
  getSuggestedTopics
} from '../controllers/dailyController.js';
// import { verifyFirebaseToken } from '../config/firebaseAdmin.js';

const router = Router();

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Daily API is working!', 
    timestamp: new Date().toISOString(),
    status: 'success'
  });
});

// Get today's daily problem
router.get('/', getDaily);

// Get all daily problems (for calendar)
router.get('/all', getAllDailyProblemsController);

// Get suggested topics for AI generation
router.get('/topics/suggested', getSuggestedTopics);

// Generate daily problem using OpenAI
router.post('/generate', generateDailyProblemWithAI);

// Get daily problem by specific date (YYYY-MM-DD)
router.get('/:date', getDailyByDateController);

export default router;


