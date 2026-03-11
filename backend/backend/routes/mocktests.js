import { Router } from 'express';
import { 
  getMockTestByYear, 
  listMockTests, 
  saveTestResult, 
  getUserTestResults 
} from '../controllers/mockTestController.js';

const router = Router();

// Get list of all available mock tests
router.get('/', listMockTests);

// Get mock test by year
router.get('/:year', getMockTestByYear);

// Save test results
router.post('/submit', saveTestResult);

// Get user's test results (all or for a specific test)
router.get('/results/:testId?', getUserTestResults);

export default router;
