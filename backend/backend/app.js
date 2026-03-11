import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Import routes
import problemsRouter from './routes/problems.js';
import prelimsRouter from './routes/prelims.js';
import authRouter from './routes/auth.js';
import dailyRouter from './routes/daily.js';
import contestsRouter from './routes/contests.js';
import discussionsRouter from './routes/discussions.js';
import leaderboardRouter from './routes/leaderboard.js';
import mocktestsRouter from './routes/mocktests.js';
import usersRouter from './routes/users.js';
import progressRouter from './routes/progress.js';
import newsRouter from './routes/news.js';

// Initialize express app
const app = express();

// Get current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const QUESTIONS_DIR = path.join(__dirname, 'questions');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// API routes
app.use('/api/auth', authRouter);
app.use('/api/problems', problemsRouter);
app.use('/api/prelims', prelimsRouter);
app.use('/api/daily', dailyRouter);
app.use('/api/contests', contestsRouter);
app.use('/api/discussions', discussionsRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/mocktests', mocktestsRouter);
app.use('/api/users', usersRouter);
app.use('/api/progress', progressRouter);
app.use('/api/news', newsRouter);

// Static UPSC previous year mock tests from extracted JSON
app.get('/api/mocktest/:year', (req, res) => {
  const { year } = req.params;
  const filePath = path.join(QUESTIONS_DIR, `${year}.json`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      ok: false,
      error: 'Not Found',
      message: `Questions for year ${year} not found`,
    });
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);

    // Support both plain array JSON and object JSON like
    // { year: 2015, total: 100, questions: [ ... ] }
    let questions = Array.isArray(parsed) ? parsed : parsed.questions || [];
    const total = Array.isArray(questions) ? questions.length : 0;

    return res.json({
      ok: true,
      year: Number(year),
      total,
      questions,
    });
  } catch (err) {
    console.error('Failed to read questions file', year, err);
    return res.status(500).json({
      ok: false,
      error: 'Internal Server Error',
      message: 'Failed to load questions for the requested year',
    });
  }
});

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// Root route
app.get('/', (req, res) => {
  res.json({ 
    ok: true, 
    message: 'UPSC Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      problems: '/api/problems',
      prelims: '/api/prelims',
      daily: '/api/daily',
      contests: '/api/contests',
      discussions: '/api/discussions',
      leaderboard: '/api/leaderboard',
      mocktests: '/api/mocktests',
      users: '/api/users',
      news: '/api/news'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    ok: true, 
    message: 'UPSC backend is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    ok: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

export default app;

