// Mock user controller - no database required

// Mock user stats
export async function getUserStats(req, res) {
  try {
    // Get token from header to identify user
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.split(' ')[1] 
      : null;

    if (!token || !token.startsWith('mock-jwt-')) {
      return res.status(401).json({ 
        detail: 'Authentication required' 
      });
    }

    // Mock stats data
    const stats = {
      totalQuestions: Math.floor(Math.random() * 500) + 100,
      correctAnswers: Math.floor(Math.random() * 300) + 50,
      accuracy: Math.floor(Math.random() * 40) + 60, // 60-100%
      streak: Math.floor(Math.random() * 15) + 1,
      rank: Math.floor(Math.random() * 1000) + 1,
      totalUsers: 5000,
      dailyProblemsCompleted: Math.floor(Math.random() * 30) + 5,
      contestsParticipated: Math.floor(Math.random() * 10) + 1,
      mockTestsCompleted: Math.floor(Math.random() * 8) + 2,
      averageScore: Math.floor(Math.random() * 30) + 70, // 70-100%
      subjectWiseStats: {
        'Polity': { attempted: 45, correct: 38, accuracy: 84 },
        'History': { attempted: 52, correct: 41, accuracy: 79 },
        'Geography': { attempted: 38, correct: 32, accuracy: 84 },
        'Economy': { attempted: 41, correct: 29, accuracy: 71 },
        'Science & Tech': { attempted: 33, correct: 28, accuracy: 85 },
        'Environment': { attempted: 29, correct: 24, accuracy: 83 }
      },
      recentActivity: [
        { date: '2025-11-12', type: 'Daily Problem', score: 1, total: 1 },
        { date: '2025-11-11', type: 'Mock Test', score: 78, total: 100 },
        { date: '2025-11-10', type: 'Contest', score: 15, total: 20 },
        { date: '2025-11-09', type: 'Daily Problem', score: 1, total: 1 },
        { date: '2025-11-08', type: 'Daily Problem', score: 0, total: 1 }
      ]
    };

    // Calculate derived stats
    stats.incorrectAnswers = stats.totalQuestions - stats.correctAnswers;
    stats.accuracy = Math.round((stats.correctAnswers / stats.totalQuestions) * 100);

    return res.json(stats);
  } catch (error) {
    console.error('Get user stats error:', error);
    return res.status(500).json({ 
      detail: 'Internal server error' 
    });
  }
}

// Mock leaderboard
export async function getUserLeaderboard(req, res) {
  try {
    // Generate mock leaderboard data
    const mockUsers = [
      'Arjun Kumar', 'Priya Sharma', 'Rahul Singh', 'Anita Patel', 'Vikram Gupta',
      'Sneha Reddy', 'Amit Joshi', 'Kavya Nair', 'Rohit Verma', 'Meera Agarwal',
      'Sanjay Yadav', 'Pooja Mishra', 'Karan Malhotra', 'Ritu Bansal', 'Deepak Tiwari',
      'Nisha Kapoor', 'Ajay Pandey', 'Swati Jain', 'Manish Kumar', 'Divya Saxena'
    ];

    const leaderboard = mockUsers.map((name, index) => ({
      rank: index + 1,
      username: name.toLowerCase().replace(' ', '_'),
      full_name: name,
      score: Math.floor(Math.random() * 200) + (1000 - index * 40),
      accuracy: Math.floor(Math.random() * 20) + 80 - index,
      questionsAttempted: Math.floor(Math.random() * 100) + 200 + index * 10,
      correctAnswers: Math.floor(Math.random() * 80) + 160 + index * 8,
      streak: Math.floor(Math.random() * 10) + (20 - index),
      lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }));

    // Sort by score descending
    leaderboard.sort((a, b) => b.score - a.score);

    // Update ranks after sorting
    leaderboard.forEach((user, index) => {
      user.rank = index + 1;
    });

    return res.json(leaderboard);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return res.status(500).json({ 
      detail: 'Internal server error' 
    });
  }
}
