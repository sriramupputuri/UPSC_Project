import UserProgress from '../models/UserProgress.js';

const DEFAULT_USER_PROGRESS = [
  {
    userId: 'user1',
    username: 'arjun_kumar',
    fullName: 'Arjun Kumar',
    avatarColor: '#00b8a3',
    overallStats: {
      totalQuestions: 2500,
      solvedQuestions: 1425,
      currentStreak: 18,
      longestStreak: 29,
      totalStudyHours: 212,
      averageAccuracy: 76,
      rank: 128,
      badges: 14,
    },
    weeklyProgress: [
      {
        weekStart: new Date('2025-10-27T00:00:00.000Z'),
        weekEnd: new Date('2025-11-02T23:59:59.999Z'),
        questionsSolved: 210,
        accuracy: 78,
        studyHours: 26,
        focus: 'Revision + Economy',
      },
      {
        weekStart: new Date('2025-11-03T00:00:00.000Z'),
        weekEnd: new Date('2025-11-09T23:59:59.999Z'),
        questionsSolved: 185,
        accuracy: 74,
        studyHours: 24,
        focus: 'Environment & Science',
      },
      {
        weekStart: new Date('2025-11-10T00:00:00.000Z'),
        weekEnd: new Date('2025-11-16T23:59:59.999Z'),
        questionsSolved: 165,
        accuracy: 79,
        studyHours: 22,
        focus: 'Polity Marathon',
      },
    ],
    subtopics: [
      { name: 'Indian Polity', total: 150, completed: 135, accuracy: 84, color: '#00b8a3', recommendation: 'Revise fundamental rights and DPSP charts.' },
      { name: 'Indian Economy', total: 140, completed: 115, accuracy: 71, color: '#ffa116', recommendation: 'Practice inflation & monetary policy MCQs.' },
      { name: 'Modern History', total: 130, completed: 110, accuracy: 83, color: '#ef476f', recommendation: 'Attempt spectrum-based flash quizzes.' },
      { name: 'Environment', total: 110, completed: 82, accuracy: 68, color: '#8b5cf6', recommendation: 'Read latest UNEP & COP summaries.' },
      { name: 'Science & Tech', total: 140, completed: 96, accuracy: 72, color: '#f59e0b', recommendation: 'Map ISRO missions + biotech case studies.' },
      { name: 'Art & Culture', total: 100, completed: 34, accuracy: 65, color: '#10b981', recommendation: 'Start Nitin Singhania short notes.' },
    ],
    recommendations: [
      { title: 'Boost Environment Accuracy', description: 'Accuracy dipped below 70%. Revisit PYQs from 2020-24 with notes.', priority: 'high' },
      { title: 'Maintain Streak', description: '18-day streak active. Schedule lighter quizzes on Sundays.', priority: 'medium' },
      { title: 'Art & Culture Kickoff', description: 'Allocate 3 sessions this week to cover temple architecture basics.', priority: 'high' },
    ],
  },
  {
    userId: 'user2',
    username: 'priya_sharma',
    fullName: 'Priya Sharma',
    avatarColor: '#ef476f',
    overallStats: {
      totalQuestions: 2500,
      solvedQuestions: 980,
      currentStreak: 11,
      longestStreak: 21,
      totalStudyHours: 168,
      averageAccuracy: 69,
      rank: 233,
      badges: 9,
    },
    weeklyProgress: [
      {
        weekStart: new Date('2025-10-27T00:00:00.000Z'),
        weekEnd: new Date('2025-11-02T23:59:59.999Z'),
        questionsSolved: 140,
        accuracy: 67,
        studyHours: 18,
        focus: 'History Power Week',
      },
      {
        weekStart: new Date('2025-11-03T00:00:00.000Z'),
        weekEnd: new Date('2025-11-09T23:59:59.999Z'),
        questionsSolved: 155,
        accuracy: 71,
        studyHours: 21,
        focus: 'Current Affairs Deep Dive',
      },
      {
        weekStart: new Date('2025-11-10T00:00:00.000Z'),
        weekEnd: new Date('2025-11-16T23:59:59.999Z'),
        questionsSolved: 120,
        accuracy: 66,
        studyHours: 17,
        focus: 'Ethics & Integrity',
      },
    ],
    subtopics: [
      { name: 'Modern History', total: 130, completed: 118, accuracy: 77, color: '#ef476f', recommendation: 'Solve 2015-2023 mains-aligned MCQs.' },
      { name: 'Ancient History', total: 120, completed: 74, accuracy: 63, color: '#06d6a0', recommendation: 'Revise Buddhist councils and NCERT tables.' },
      { name: 'Geography', total: 160, completed: 108, accuracy: 71, color: '#118ab2', recommendation: 'Mapwork on rivers + Indian soils recap.' },
      { name: 'Governance', total: 110, completed: 48, accuracy: 58, color: '#8b5cf6', recommendation: 'Cover ARC reports summaries this fortnight.' },
      { name: 'Ethics & Integrity', total: 100, completed: 62, accuracy: 74, color: '#84cc16', recommendation: 'Draft 5 case study templates.' },
      { name: 'Current Affairs', total: 200, completed: 128, accuracy: 69, color: '#ec4899', recommendation: 'Update December PIB notes & indices.' },
    ],
    recommendations: [
      { title: 'Governance Gap', description: 'Coverage under 50%. Add 2 governance answer-writing drills.', priority: 'high' },
      { title: 'Ethics Consistency', description: 'Accuracy is high—schedule weekend mocks to sustain momentum.', priority: 'medium' },
      { title: 'Map Revision', description: 'Integrate 15-min daily atlas sprint for countries-in-news.', priority: 'low' },
    ],
  },
  {
    userId: 'user3',
    username: 'rahul_singh',
    fullName: 'Rahul Singh',
    avatarColor: '#3b82f6',
    overallStats: {
      totalQuestions: 2500,
      solvedQuestions: 760,
      currentStreak: 6,
      longestStreak: 14,
      totalStudyHours: 132,
      averageAccuracy: 64,
      rank: 312,
      badges: 7,
    },
    weeklyProgress: [
      {
        weekStart: new Date('2025-10-27T00:00:00.000Z'),
        weekEnd: new Date('2025-11-02T23:59:59.999Z'),
        questionsSolved: 105,
        accuracy: 61,
        studyHours: 15,
        focus: 'Basics Reinforcement',
      },
      {
        weekStart: new Date('2025-11-03T00:00:00.000Z'),
        weekEnd: new Date('2025-11-09T23:59:59.999Z'),
        questionsSolved: 118,
        accuracy: 65,
        studyHours: 17,
        focus: 'CSAT + Geography',
      },
      {
        weekStart: new Date('2025-11-10T00:00:00.000Z'),
        weekEnd: new Date('2025-11-16T23:59:59.999Z'),
        questionsSolved: 95,
        accuracy: 62,
        studyHours: 14,
        focus: 'Economy Core',
      },
    ],
    subtopics: [
      { name: 'Indian Polity', total: 150, completed: 88, accuracy: 59, color: '#00b8a3', recommendation: 'Watch Laxmikanth rapid revision series.' },
      { name: 'Indian Economy', total: 140, completed: 64, accuracy: 57, color: '#ffa116', recommendation: 'Solve budget + survey MCQs every alternate day.' },
      { name: 'Science & Tech', total: 140, completed: 52, accuracy: 61, color: '#f59e0b', recommendation: 'Cover ISRO + biotech developments from last 6 months.' },
      { name: 'Disaster Management', total: 70, completed: 18, accuracy: 55, color: '#f97316', recommendation: 'Create concise notes on NDMA guidelines.' },
      { name: 'Schemes & Policies', total: 120, completed: 46, accuracy: 58, color: '#eab308', recommendation: 'Use flashcards for flagship schemes + ministries.' },
      { name: 'Ethics & Integrity', total: 100, completed: 40, accuracy: 66, color: '#84cc16', recommendation: 'Maintain diary for examples to plug into case studies.' },
    ],
    recommendations: [
      { title: 'Revive Streak', description: 'Plan shorter morning sessions to rebuild discipline.', priority: 'high' },
      { title: 'Economy Booster', description: 'Accuracy under 60%. Attempt 3 timed sectional tests.', priority: 'high' },
      { title: 'CSAT Touchpoints', description: 'Add 2 logical reasoning drills per week.', priority: 'medium' },
    ],
  },
];

function formatProgress(doc) {
  if (!doc) return null;
  const { _id, __v, ...rest } = doc;
  return rest;
}

export async function getAllUserProgress(req, res) {
  try {
    let users = await UserProgress.find().lean();

    if (!users.length) {
      await UserProgress.insertMany(DEFAULT_USER_PROGRESS);
      users = await UserProgress.find().lean();
    }

    return res.json({ users: users.map(formatProgress) });
  } catch (error) {
    console.error('Get all user progress error:', error);
    return res.status(500).json({ detail: 'Failed to fetch progress data' });
  }
}

export async function getUserProgress(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ detail: 'userId is required' });
    }

    let user = await UserProgress.findOne({ userId }).lean();

    if (!user) {
      const defaultUser = DEFAULT_USER_PROGRESS.find((entry) => entry.userId === userId);
      if (defaultUser) {
        const created = await UserProgress.create(defaultUser);
        user = created.toObject();
      }
    }

    if (!user) {
      return res.status(404).json({ detail: 'User progress not found' });
    }

    return res.json({ user: formatProgress(user) });
  } catch (error) {
    console.error('Get user progress error:', error);
    return res.status(500).json({ detail: 'Failed to fetch user progress' });
  }
}
