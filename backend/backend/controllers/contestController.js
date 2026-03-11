// Mock contest controller - no database required
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateContestQuestionsWithGemini, getFallbackQuestions } from '../utils/geminiContestGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// UPSC Subtopics for comprehensive coverage
const UPSC_SUBTOPICS = [
  "Indian Polity",
  "Indian Economy", 
  "Modern Indian History",
  "Ancient & Medieval History",
  "Geography (India + World)",
  "Environment & Ecology",
  "Science & Technology",
  "Current Affairs",
  "Art & Culture",
  "International Relations",
  "Governance & Social Justice",
  "Agriculture",
  "Disaster Management",
  "Constitutional Bodies",
  "Public Administration",
  "Ethics, Integrity & Aptitude",
  "Schemes & Policies",
  "Space & Defence",
  "Miscellaneous GK"
];

// Predefined contests with comprehensive subtopic coverage
const predefinedContests = [
  {
    _id: 'contest-comprehensive',
    title: 'UPSC Comprehensive Mock Test',
    rules: 'Complete 38 questions covering all 19 subtopics in 60 minutes. Each subtopic has 2 questions.',
    durationMinutes: 60,
    difficulty: 'Mixed',
    description: 'Complete coverage of all UPSC Prelims subtopics with AI-generated questions',
    subtopics: UPSC_SUBTOPICS,
    questionsPerSubtopic: 2,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'contest-polity-economy',
    title: 'Polity & Economy Focus',
    rules: 'Complete 20 questions in 40 minutes focusing on Polity and Economy.',
    durationMinutes: 40,
    difficulty: 'Medium',
    description: 'Deep dive into Indian Polity and Economy concepts',
    subtopics: ["Indian Polity", "Indian Economy", "Governance & Social Justice", "Constitutional Bodies"],
    questionsPerSubtopic: 5,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'contest-history-culture',
    title: 'History & Culture Special',
    rules: 'Complete 16 questions in 35 minutes covering History and Culture.',
    durationMinutes: 35,
    difficulty: 'Medium',
    description: 'Test your knowledge of Indian History, Art & Culture',
    subtopics: ["Modern Indian History", "Ancient & Medieval History", "Art & Culture"],
    questionsPerSubtopic: 5,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'contest-geography-environment',
    title: 'Geography & Environment',
    rules: 'Complete 14 questions in 30 minutes on Geography and Environment.',
    durationMinutes: 30,
    difficulty: 'Medium',
    description: 'Comprehensive test of Geography and Environmental concepts',
    subtopics: ["Geography (India + World)", "Environment & Ecology", "Disaster Management"],
    questionsPerSubtopic: 4,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'contest-current-affairs',
    title: 'Current Affairs & IR',
    rules: 'Complete 12 questions in 25 minutes on Current Affairs and International Relations.',
    durationMinutes: 25,
    difficulty: 'Hard',
    description: 'Latest current affairs and International Relations',
    subtopics: ["Current Affairs", "International Relations", "Schemes & Policies"],
    questionsPerSubtopic: 4,
    createdAt: new Date().toISOString()
  }
];

// Generate contest questions from Problems_Dataset.json with better randomization
function generateContestQuestions(contestId, count = 20) {
  try {
    const problemsPath = path.join(__dirname, '../Problems_Dataset.json');
    const problemsData = JSON.parse(fs.readFileSync(problemsPath, 'utf8'));
    
    // Create multiple randomization factors
    const timestamp = Date.now();
    const contestSeed = contestId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const randomFactor = Math.random() * 10000;
    const combinedSeed = contestSeed + timestamp + randomFactor;
    
    const questions = [];
    const usedIndices = new Set();
    
    // Shuffle the entire dataset with multiple random factors
    const shuffled = [...problemsData].sort(() => {
      const random1 = Math.sin(combinedSeed + questions.length) * 10000;
      const random2 = Math.cos(timestamp + contestSeed) * 10000;
      return (random1 + random2) - Math.floor(random1 + random2);
    });
    
    // Select questions ensuring no duplicates
    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
      let problemIndex = (combinedSeed + i * 23 + timestamp) % shuffled.length;
      
      // Ensure we don't use the same question twice
      while (usedIndices.has(problemIndex) && usedIndices.size < shuffled.length) {
        problemIndex = (problemIndex + 11) % shuffled.length;
      }
      
      if (usedIndices.has(problemIndex)) break; // No more unique questions available
      
      usedIndices.add(problemIndex);
      const problem = shuffled[problemIndex];
      
      questions.push({
        _id: `${contestId}_q${i + 1}_${timestamp}`,
        question: problem.question,
        options: problem.options,
        answer: problem.answer,
        explanation: problem.explanation,
        subtopic: problem.subtopic,
        difficulty: problem.difficulty || 'Medium'
      });
    }
    
    return questions;
  } catch (err) {
    console.error('Error generating contest questions:', err);
    return [];
  }
}

export async function listContests(req, res) {
  try {
    return res.json(predefinedContests);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to list contests' });
  }
}

export async function startContest(req, res) {
  try {
    const { id } = req.params;
    console.log('Starting contest with ID:', id);
    
    // Find the contest in predefined contests
    const contest = predefinedContests.find(c => c._id === id);
    
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }
    
    let questions = [];
    
    try {
      // Try to generate questions using Gemini API with contest context
      console.log(`Generating ${contest.questionsPerSubtopic} questions per subtopic for:`, contest.subtopics);
      questions = await generateContestQuestionsWithGemini(contest.subtopics, contest.questionsPerSubtopic, 'contest');
      console.log(`Successfully generated ${questions.length} questions using Gemini API`);
    } catch (geminiError) {
      console.warn('Gemini API failed, using fallback questions:', geminiError.message);
      // Fallback to predefined questions
      questions = getFallbackQuestions(contest.subtopics);
      console.log(`Using ${questions.length} fallback questions`);
    }
    
    if (questions.length === 0) {
      return res.status(500).json({ error: 'Failed to generate contest questions' });
    }
    
    // Format questions with IDs and ensure proper structure
    const formattedQuestions = questions.map((q, index) => ({
      _id: `${contest._id}_q${index + 1}`,
      question: q.question,
      options: q.options,
      answer: q.answer,
      explanation: q.explanation,
      subtopic: q.subtopic,
      difficulty: q.difficulty || 'Medium'
    }));
    
    console.log(`Formatted ${formattedQuestions.length} questions for contest ${id}`);
    
    return res.json({
      contestId: contest._id,
      title: contest.title,
      rules: contest.rules,
      durationMinutes: contest.durationMinutes,
      difficulty: contest.difficulty,
      description: contest.description,
      subtopics: contest.subtopics,
      totalQuestions: formattedQuestions.length,
      questions: formattedQuestions,
    });
  } catch (err) {
    console.error('Error starting contest:', err);
    return res.status(500).json({ 
      error: 'Failed to start contest',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}


