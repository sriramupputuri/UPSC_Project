import { Router } from 'express';
import { getAll, postDiscussion, addReply, upvoteDiscussion } from '../controllers/discussionController.js';
// import { verifyFirebaseToken } from '../config/firebaseAdmin.js';

const router = Router();

// Get all discussions (optionally filter by topic)
router.get('/', getAll);

// Post a new discussion (temporarily without auth for testing)
router.post('/', postDiscussion);

// Add a reply to a discussion
router.post('/:id/reply', addReply);

// Upvote a discussion
router.post('/:id/upvote', upvoteDiscussion);

export default router;


