import cron from 'node-cron';
import DailyProblem from '../models/DailyProblem.js';
import { generateMCQsWithOpenAI } from './openaiGenerator.js';

function todayKey() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function dateKey(date) {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export async function ensureTodayDaily() {
  const key = todayKey();
  const existing = await DailyProblem.findOne({ date: key });
  if (existing) {
    console.log('Daily problem already exists for today');
    return existing;
  }
  
  console.log('Generating new daily problem with OpenAI...');
  const questions = await generateMCQsWithOpenAI(
    'Generate 1 high-quality UPSC prelims-style MCQ with 4 options, correct answer (A/B/C/D), detailed explanation, topic, and difficulty.',
    1
  );
  
  const q = questions[0];
  if (!q) return null;
  
  const doc = await DailyProblem.create({
    date: key,
    question: q.question,
    options: q.options,
    answer: q.answer,
    explanation: q.explanation,
    topic: q.topic || 'General Studies',
    difficulty: q.difficulty || 'Medium',
  });
  
  console.log('✅ Daily problem created successfully');
  return doc;
}

export async function getDailyByDate(dateString) {
  const key = dateKey(dateString);
  return await DailyProblem.findOne({ date: key });
}

export async function getAllDailyProblems(limit = 30) {
  return await DailyProblem.find({}).sort({ date: -1 }).limit(limit);
}

export function startDailyCron() {
  // run every day at 05:30 AM server time
  cron.schedule('30 5 * * *', async () => {
    try {
      await ensureTodayDaily();
      // eslint-disable-next-line no-console
      console.log('Daily problem ensured.');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Daily cron failed:', err.message);
    }
  });
}


