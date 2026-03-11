import mongoose from 'mongoose';

const LeaderboardSchema = new mongoose.Schema(
  {
    userId: { type: String, index: true },
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest' },
    score: { type: Number, default: 0 },
    rank: { type: Number, index: true },
    badge: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('Leaderboard', LeaderboardSchema);


