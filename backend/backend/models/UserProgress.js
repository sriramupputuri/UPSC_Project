import mongoose from 'mongoose';

const WeeklyProgressSchema = new mongoose.Schema(
  {
    weekStart: { type: Date, required: true },
    weekEnd: { type: Date, required: true },
    questionsSolved: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    studyHours: { type: Number, default: 0 },
    focus: { type: String, default: '' },
  },
  { _id: false }
);

const SubtopicProgressSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    total: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    color: { type: String, default: '#00b8a3' },
    recommendation: { type: String, default: '' },
  },
  { _id: false }
);

const RecommendationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
  },
  { _id: false }
);

const OverallStatsSchema = new mongoose.Schema(
  {
    totalQuestions: { type: Number, default: 0 },
    solvedQuestions: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    totalStudyHours: { type: Number, default: 0 },
    averageAccuracy: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    badges: { type: Number, default: 0 },
  },
  { _id: false }
);

const UserProgressSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    fullName: { type: String, required: true },
    avatarColor: { type: String, default: '#00b8a3' },
    overallStats: { type: OverallStatsSchema, required: true },
    weeklyProgress: { type: [WeeklyProgressSchema], default: [] },
    subtopics: { type: [SubtopicProgressSchema], default: [] },
    recommendations: { type: [RecommendationSchema], default: [] },
    lastSyncAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('UserProgress', UserProgressSchema);
