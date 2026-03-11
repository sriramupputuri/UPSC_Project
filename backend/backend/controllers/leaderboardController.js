import Leaderboard from '../models/Leaderboard.js';

export async function getLeaderboard(req, res) {
  try {
    const docs = await Leaderboard.find({}).sort({ rank: 1 }).limit(100);
    return res.json(docs);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}


