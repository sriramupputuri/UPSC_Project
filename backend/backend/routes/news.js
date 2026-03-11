import { Router } from 'express';
import { 
  getNews, 
  getNewsById, 
  saveArticle, 
  getSavedArticles 
} from '../controllers/newsController.js';

const router = Router();

// Get all news articles
router.get('/', getNews);

// Save article for user (requires auth) - must come before /:id
router.post('/save', saveArticle);

// Get saved articles for user (requires auth) - must come before /:id
router.get('/saved', getSavedArticles);

// Get single news article by ID - must be last to avoid conflicts
router.get('/:id', getNewsById);

export default router;

