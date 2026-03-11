// Mock discussion controller - no database required
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock discussions storage
let mockDiscussions = [
  {
    _id: '1',
    topic: 'general',
    userId: 'user1',
    username: 'Student123',
    text: 'What are the best strategies for preparing UPSC Prelims?',
    replies: [
      {
        userId: 'user2',
        username: 'Aspirant2024',
        text: 'I recommend starting with NCERT books and then moving to standard references.',
        timestamp: new Date(Date.now() - 86400000).toISOString()
      }
    ],
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    upvotes: 5,
    upvotedBy: ['user2', 'user3', 'user4', 'user5', 'user6']
  },
  {
    _id: '2',
    topic: 'polity',
    userId: 'user3',
    username: 'PolityExpert',
    text: 'Can someone explain the difference between Fundamental Rights and Directive Principles?',
    replies: [],
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    upvotes: 3,
    upvotedBy: ['user1', 'user2', 'user4']
  },
  {
    _id: '3',
    topic: 'current-affairs',
    userId: 'user4',
    username: 'CurrentAffairsGuru',
    text: 'Monthly Current Affairs Discussion - November 2024',
    replies: [
      {
        userId: 'user1',
        username: 'Student123',
        text: 'The recent climate summit outcomes are important for Environment section.',
        timestamp: new Date(Date.now() - 43200000).toISOString()
      }
    ],
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    upvotes: 8,
    upvotedBy: ['user1', 'user2', 'user3', 'user5', 'user6', 'user7', 'user8', 'user9']
  }
];

export async function getAll(req, res) {
  try {
    const { topic } = req.query;
    let discussions = [...mockDiscussions];
    
    if (topic) {
      discussions = discussions.filter(d => d.topic === topic);
    }
    
    // Sort by timestamp (newest first)
    discussions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return res.json(discussions);
  } catch (err) {
    console.error('Failed to load discussions:', err);
    return res.status(500).json({ error: 'Failed to load discussions' });
  }
}

export async function postDiscussion(req, res) {
  try {
    const { topic, text, username } = req.body;
    
    if (!text || !username) {
      return res.status(400).json({ error: 'Text and username are required' });
    }
    
    // For now, use username as userId if not authenticated
    const userId = req.userId || username;
    
    const newDiscussion = {
      _id: String(mockDiscussions.length + 1),
      topic: topic || 'general',
      userId, 
      username,
      text,
      replies: [],
      timestamp: new Date().toISOString(),
      upvotes: 0,
      upvotedBy: []
    };
    
    mockDiscussions.unshift(newDiscussion);
    
    return res.json(newDiscussion);
  } catch (err) {
    console.error('Failed to create discussion:', err);
    return res.status(400).json({ error: 'Failed to create discussion' });
  }
}

export async function addReply(req, res) {
  try {
    const { id } = req.params;
    const { text, username } = req.body;
    
    if (!text || !username) {
      return res.status(400).json({ error: 'Text and username are required' });
    }
    
    const userId = req.userId || username;
    
    const discussion = mockDiscussions.find(d => d._id === id);
    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }
    
    const newReply = {
      userId,
      username,
      text,
      timestamp: new Date().toISOString()
    };
    
    discussion.replies.push(newReply);
    
    return res.json(discussion);
  } catch (err) {
    console.error('Failed to add reply:', err);
    return res.status(400).json({ error: 'Failed to add reply' });
  }
}

export async function upvoteDiscussion(req, res) {
  try {
    const { id } = req.params;
    const userId = req.userId || req.body.userId || 'anonymous';
    
    const discussion = mockDiscussions.find(d => d._id === id);
    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }
    
    // Check if user already upvoted
    const alreadyUpvoted = discussion.upvotedBy.includes(userId);
    
    if (alreadyUpvoted) {
      // Remove upvote
      discussion.upvotedBy = discussion.upvotedBy.filter(id => id !== userId);
      discussion.upvotes = Math.max(0, discussion.upvotes - 1);
    } else {
      // Add upvote
      discussion.upvotedBy.push(userId);
      discussion.upvotes += 1;
    }
    
    return res.json(discussion);
  } catch (err) {
    console.error('Failed to upvote:', err);
    return res.status(400).json({ error: 'Failed to upvote' });
  }
}
