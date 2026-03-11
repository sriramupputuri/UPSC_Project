// Mock daily controller - no database required
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import DailyProblem from '../models/DailyProblem.js';
import { generateMCQsWithGemini } from '../utils/geminiGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fallbackProblems = [
  {
    question: 'With reference to the Indian economy, consider the following statements:\n1. Fiscal deficit is always greater than revenue deficit.\n2. Primary deficit is obtained by excluding interest payments from fiscal deficit.\n3. Monetised deficit is the change in net reserve requirements of commercial banks.\nWhich of the statements given above is/are correct?',
    options: {
      A: '1 only',
      B: '2 only',
      C: '1 and 2 only',
      D: '2 and 3 only'
    },
    answer: 'B',
    explanation: 'Primary deficit equals fiscal deficit minus interest payments (statement 2). Statement 1 is incorrect because fiscal deficit can equal revenue deficit only when there is no capital expenditure financed through borrowings. Statement 3 is incorrect because monetised deficit refers to the increase in net RBI credit to the government.'
  },
  {
    question: 'The term “Mangrove Alliance for Climate” recently seen in the news refers to a collaborative platform launched to: ',
    options: {
      A: 'Develop a global carbon trading marketplace for mangrove ecosystems',
      B: 'Accelerate conservation and restoration of mangrove forests for climate resilience',
      C: 'Promote blue carbon bonds exclusively for Indian Ocean countries',
      D: 'Standardise satellite monitoring of coastal ecosystems under the UNFCCC'
    },
    answer: 'B',
    explanation: 'The Mangrove Alliance for Climate, announced at COP27, focuses on knowledge sharing, capacity building and investments to protect and restore mangrove ecosystems to enhance climate resilience.'
  }
];

let cachedProblemsDataset = null;

function getProblemsDataset() {
  if (cachedProblemsDataset) {
    return cachedProblemsDataset;
  }

  const problemsPath = path.join(__dirname, '../Problems_Dataset.json');
  try {
    cachedProblemsDataset = JSON.parse(fs.readFileSync(problemsPath, 'utf8'));
    if (!Array.isArray(cachedProblemsDataset) || cachedProblemsDataset.length === 0) {
      console.warn('Problems dataset file is empty. Falling back to built-in questions.');
      cachedProblemsDataset = fallbackProblems;
    }
  } catch (error) {
    console.error('Failed to load problems dataset:', error);
    cachedProblemsDataset = fallbackProblems;
  }

  return cachedProblemsDataset;
}

function stripOptionPrefix(option) {
  if (typeof option !== 'string') {
    return option !== undefined && option !== null ? String(option) : '';
  }
  return option.replace(/^[A-D]\s*(?:[\.\)]\s*)?/i, '').trim();
}

function normalizeOptions(options) {
  if (!options) return [];

  if (Array.isArray(options)) {
    return options
      .map((opt) => stripOptionPrefix(opt))
      .filter((opt) => opt && opt.length > 0);
  }

  if (typeof options === 'object') {
    return Object.keys(options)
      .sort()
      .map((key) => stripOptionPrefix(options[key]))
      .filter((opt) => opt && opt.length > 0);
  }

  return [];
}

function sanitizeAnswer(answer) {
  if (!answer) return 'A';
  const char = String(answer).trim().charAt(0).toUpperCase();
  const validChoices = ['A', 'B', 'C', 'D'];
  return validChoices.includes(char) ? char : 'A';
}

// Generate daily problem with better randomization and Gemini API
async function generateDailyProblem(date) {
  try {
    // First try to generate with Gemini API
    const dailyTopics = [
      "Current Affairs and Recent Developments",
      "Constitutional Provisions and Amendments", 
      "Economic Policies and Reforms",
      "International Relations and Diplomacy",
      "Science and Technology Innovations",
      "Environmental Issues and Climate Change",
      "Social Issues and Governance",
      "Historical Events and Personalities",
      "Geographical Features and Resources",
      "Art, Culture and Heritage"
    ];
    
    // Select a random topic based on date but with additional randomization
    const dateNum = new Date(date).getTime();
    const randomFactor = Math.sin(dateNum) * 10000;
    const topicIndex = Math.abs(Math.floor(randomFactor)) % dailyTopics.length;
    const selectedTopic = dailyTopics[topicIndex];
    
    try {
      console.log(`Generating daily problem for ${date} on topic: ${selectedTopic}`);
      
      const prompt = `Generate 1 high-quality UPSC Civil Services Examination multiple-choice question on the topic: "${selectedTopic}".

CONTEXT: DAILY_PROBLEM - Date: ${date} - Topic: ${selectedTopic} - Session: ${Date.now()}

Requirements:
- Focus on current affairs, conceptual understanding, and analytical thinking
- Question should be relevant to UPSC Prelims pattern for ${date}
- Include detailed explanation for better learning
- Ensure options are well-balanced and plausible
- Cover important aspects with practical applications
- Difficulty level: Medium to Hard
- Make it unique and different from previous daily problems`;

      const questions = await generateMCQsWithGemini(prompt);
      
      if (questions && questions.length > 0) {
        const question = questions[0];
        return {
          _id: `daily_${date}_gemini`,
          date: date,
          question: question.question,
          options: question.options,
          answer: question.answer,
          explanation: question.explanation,
          subtopic: question.topic || selectedTopic,
          difficulty: question.difficulty || 'Medium',
          subject: getSubjectFromSubtopic(question.topic || selectedTopic),
          generatedBy: 'Gemini'
        };
      }
    } catch (geminiError) {
      console.warn('Gemini API failed for daily problem, using dataset fallback:', geminiError.message);
    }
    
    // Fallback to dataset with better randomization
    return generateDailyProblemFromDataset(date);
    
  } catch (err) {
    console.error('Error generating daily problem:', err);
    return null;
  }
}

// Fallback function with better randomization
function generateDailyProblemFromDataset(date) {
  try {
    const problemsData = getProblemsDataset();
    if (!problemsData || problemsData.length === 0) {
      console.error('Problems dataset is empty.');
      return null;
    }

    // Create multiple randomization factors
    const dateNum = new Date(date).getTime();
    const timestamp = Date.now();
    const randomFactor = Math.random() * 10000;
    const combinedSeed = dateNum + timestamp + randomFactor;
    
    // Use multiple factors to select a problem
    const problemIndex = Math.abs(
      Math.floor(
        Math.sin(combinedSeed) * 10000 + 
        Math.cos(dateNum) * 10000 + 
        Math.tan(timestamp) * 1000
      )
    ) % problemsData.length;
    
    const problem = problemsData[problemIndex];
    
    // Convert options object to array format
    const optionsArray = normalizeOptions(problem.options);
    const correctAnswer = sanitizeAnswer(problem.answer);

    return {
      _id: `daily_${date}_${timestamp}`,
      date: date,
      question: problem.question,
      options: optionsArray,
      answer: correctAnswer,
      explanation: problem.explanation || 'No explanation provided.',
      subtopic: problem.subtopic,
      difficulty: problem.difficulty || 'Medium',
      subject: getSubjectFromSubtopic(problem.subtopic),
      generatedBy: 'Dataset'
    };
  } catch (err) {
    console.error('Error generating daily problem from dataset:', err);
    return null;
  }
}

// Function to get subject from subtopic
function getSubjectFromSubtopic(subtopic) {
  if (!subtopic || typeof subtopic !== 'string') {
    return 'General Studies';
  }

  const subtopicToSubjectMap = {
    'Indian Polity and Constitution': 'Polity',
    'History': 'History',
    'Geography': 'Geography',
    'Economy': 'Economy',
    'Science and Technology': 'Science & Tech',
    'Environment and Ecology': 'Environment',
    'Ethics and Integrity': 'Ethics',
    'International Relations': 'International Relations',
    'Internal Security': 'Security',
    'Disaster Management': 'Disaster Management',
    'Social Issues': 'Society',
    'Governance': 'Governance'
  };
  
  if (subtopicToSubjectMap[subtopic]) {
    return subtopicToSubjectMap[subtopic];
  }

  const lowerSubtopic = subtopic.toLowerCase();
  if (lowerSubtopic.includes('polity') || lowerSubtopic.includes('constitution')) return 'Polity';
  if (lowerSubtopic.includes('history')) return 'History';
  if (lowerSubtopic.includes('geography')) return 'Geography';
  if (lowerSubtopic.includes('economy') || lowerSubtopic.includes('economic')) return 'Economy';
  if (lowerSubtopic.includes('science') || lowerSubtopic.includes('technology')) return 'Science & Tech';
  if (lowerSubtopic.includes('environment') || lowerSubtopic.includes('ecology')) return 'Environment';
  if (lowerSubtopic.includes('ethics') || lowerSubtopic.includes('integrity')) return 'Ethics';
  if (lowerSubtopic.includes('international')) return 'International Relations';
  if (lowerSubtopic.includes('security')) return 'Security';
  if (lowerSubtopic.includes('disaster')) return 'Disaster Management';
  if (lowerSubtopic.includes('social') || lowerSubtopic.includes('society')) return 'Society';
  if (lowerSubtopic.includes('governance') || lowerSubtopic.includes('administration')) return 'Governance';
  
  return 'General Studies';
}

function formatGeneratedProblem(date, generatedProblem) {
  if (!generatedProblem) {
    return null;
  }

  const topic = generatedProblem.subtopic || generatedProblem.topic || 'General Studies';
  const subject = generatedProblem.subject || getSubjectFromSubtopic(topic);

  return {
    date,
    question: generatedProblem.question,
    options: normalizeOptions(generatedProblem.options),
    answer: sanitizeAnswer(generatedProblem.answer),
    explanation: generatedProblem.explanation || 'No explanation provided.',
    topic,
    subject,
    difficulty: generatedProblem.difficulty || 'Medium',
    generatedBy: generatedProblem.generatedBy || 'Dataset',
  };
}

async function generateUniqueDailyProblem(date, maxAttempts = 3) {
  let attempt = 0;
  let generated = null;
  let lastQuestion = null;

  try {
    const latestProblem = await DailyProblem.findOne({}, null, { sort: { date: -1 } }).lean();
    lastQuestion = latestProblem?.question?.trim();
  } catch (err) {
    console.error('Failed to read latest daily problem for comparison:', err);
  }

  while (attempt < maxAttempts) {
    try {
      generated = await generateDailyProblem(date);
    } catch (err) {
      console.error('Error during daily problem generation:', err);
      generated = null;
    }

    if (!generated || !generated.question) {
      break;
    }

    if (!lastQuestion || generated.question.trim() !== lastQuestion) {
      break;
    }

    attempt += 1;
  }

  return generated;
}

async function getOrCreateDailyProblem(date) {
  if (!date) return null;

  let existing = null;
  try {
    existing = await DailyProblem.findOne({ date });
  } catch (err) {
    console.error('Database read failed, returning fallback daily problem:', err.message);
    const fallbackGenerated = await generateUniqueDailyProblem(date);
    return formatGeneratedProblem(date, fallbackGenerated);
  }

  if (existing) {
    return existing;
  }

  const generated = await generateUniqueDailyProblem(date);
  if (!generated) {
    return null;
  }

  const formattedProblem = formatGeneratedProblem(date, generated);
  if (!formattedProblem) {
    return null;
  }

  try {
    return await DailyProblem.create(formattedProblem);
  } catch (err) {
    if (err.code === 11000) {
      return await DailyProblem.findOne({ date });
    }
    console.error('Database write failed, returning generated fallback:', err.message);
    return formattedProblem;
  }
}

function normalizeDateParam(date) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString().split('T')[0];
}

export async function getDaily(req, res) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const dailyProblem = await getOrCreateDailyProblem(today);

    if (!dailyProblem) {
      return res.status(500).json({ error: 'Failed to generate daily problem' });
    }
    
    return res.json(dailyProblem);
  } catch (err) {
    console.error('Error fetching daily problem:', err);
    return res.status(500).json({ error: 'Failed to fetch daily problem' });
  }
}

export async function getDailyByDateController(req, res) {
  try {
    const { date } = req.params;
    const normalizedDate = normalizeDateParam(date);

    if (!normalizedDate) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    const dailyProblem = await getOrCreateDailyProblem(normalizedDate);

    if (!dailyProblem) {
      return res.status(404).json({ error: 'No daily problem found for this date' });
    }
    
    return res.json(dailyProblem);
  } catch (err) {
    console.error('Error fetching daily problem by date:', err);
    return res.status(500).json({ error: 'Failed to fetch daily problem' });
  }
}

export async function getAllDailyProblemsController(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const todayStr = new Date().toISOString().split('T')[0];

    await getOrCreateDailyProblem(todayStr);

    const problems = await DailyProblem.find({})
      .sort({ date: -1 })
      .limit(limit)
      .lean();

    return res.json(problems);
  } catch (err) {
    console.error('Error fetching all daily problems:', err);
    return res.status(500).json({ error: 'Failed to fetch daily problems' });
  }
}

// Generate daily problem using OpenAI
export async function generateDailyProblemWithAI(req, res) {
  try {
    const { topic, difficulty = 'Medium', count = 1 } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    // Create a comprehensive prompt for UPSC daily problem
    const prompt = `Generate ${count} high-quality UPSC Civil Services Examination multiple-choice question(s) on the topic: "${topic}".

Requirements:
- Difficulty level: ${difficulty}
- Focus on current affairs, conceptual understanding, and analytical thinking
- Questions should be relevant to UPSC Prelims pattern
- Include detailed explanations for better learning
- Ensure options are well-balanced and plausible
- Cover important aspects of the topic with practical applications

Topic areas to consider: Indian Polity, History, Geography, Economy, Science & Technology, Environment, Current Affairs, Ethics, International Relations, Internal Security.`;

    const questions = await generateMCQsWithOpenAI(prompt, count);
    
    if (!questions || questions.length === 0) {
      return res.status(500).json({ error: 'Failed to generate questions with AI' });
    }

    // Format questions for daily problem structure
    const formattedQuestions = questions.map((q, index) => ({
      _id: `ai_daily_${Date.now()}_${index}`,
      date: new Date().toISOString().split('T')[0],
      question: q.question,
      options: q.options,
      answer: q.answer,
      explanation: q.explanation,
      topic: q.topic || topic,
      difficulty: q.difficulty || difficulty,
      subject: getSubjectFromSubtopic(q.topic || topic),
      generatedBy: 'OpenAI',
      createdAt: new Date().toISOString()
    }));

    return res.json({
      success: true,
      questions: formattedQuestions,
      count: formattedQuestions.length
    });

  } catch (err) {
    console.error('Error generating daily problem with AI:', err);
    return res.status(500).json({ 
      error: 'Failed to generate daily problem with AI',
      details: err.message 
    });
  }
}

// Get suggested topics for daily problem generation
export async function getSuggestedTopics(req, res) {
  try {
    const topics = [
      // Current Affairs & Polity
      'Constitutional Amendments and Recent Developments',
      'Fundamental Rights and Directive Principles',
      'Electoral Reforms and Democratic Governance',
      'Federalism and Centre-State Relations',
      'Judicial Reforms and PIL',
      
      // Economy
      'Digital Economy and Fintech Revolution',
      'Sustainable Development Goals and India',
      'Agricultural Reforms and Food Security',
      'Infrastructure Development and Smart Cities',
      'Banking Sector Reforms',
      
      // International Relations
      'India-China Border Issues and Diplomacy',
      'Climate Change and Global Cooperation',
      'Maritime Security in Indo-Pacific',
      'Trade Wars and Economic Partnerships',
      'Terrorism and Global Security',
      
      // Science & Technology
      'Space Technology and ISRO Missions',
      'Artificial Intelligence and Ethics',
      'Biotechnology and Healthcare Innovation',
      'Renewable Energy Technologies',
      'Cybersecurity and Data Protection',
      
      // Environment & Geography
      'Climate Change Mitigation Strategies',
      'Biodiversity Conservation',
      'Disaster Management and Preparedness',
      'Water Resources Management',
      'Urban Planning and Sustainable Cities',
      
      // History & Culture
      'Freedom Struggle and National Movement',
      'Ancient Indian Philosophy and Traditions',
      'Medieval Indian Architecture',
      'Cultural Heritage and Preservation',
      'Social Reform Movements',
      
      // Social Issues
      'Gender Equality and Women Empowerment',
      'Education Policy and Digital Learning',
      'Healthcare Access and Public Health',
      'Poverty Alleviation Programs',
      'Social Justice and Inclusive Growth'
    ];

    return res.json({
      topics: topics,
      categories: {
        'Polity & Governance': topics.slice(0, 5),
        'Economy': topics.slice(5, 10),
        'International Relations': topics.slice(10, 15),
        'Science & Technology': topics.slice(15, 20),
        'Environment & Geography': topics.slice(20, 25),
        'History & Culture': topics.slice(25, 30),
        'Social Issues': topics.slice(30, 35)
      }
    });
  } catch (err) {
    console.error('Error fetching suggested topics:', err);
    return res.status(500).json({ error: 'Failed to fetch suggested topics' });
  }
}


