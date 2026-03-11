import { generateMockTestQuestions } from '../utils/geminiMockTestGenerator.js';
import MockTestResult from '../models/MockTestResult.js';

// UPSC Previous Year Papers available
const AVAILABLE_YEARS = [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];

export async function getMockTestByYear(req, res) {
  try {
    const { year } = req.params;
    const yearNum = Number(year);
    
    console.log(`📝 Generating mock test for year ${yearNum}`);
    
    if (!yearNum || yearNum < 2000 || yearNum > 2030) {
      return res.status(400).json({ error: 'Invalid year. Please provide a year between 2000 and 2030.' });
    }
    
    // Define subtopics for comprehensive UPSC coverage with weights
    const upscSubtopics = [
      { name: "Indian Polity", weight: 20 },
      { name: "Indian Economy", weight: 15 },
      { name: "Modern Indian History", weight: 15 },
      { name: "Ancient & Medieval History", weight: 10 },
      { name: "Geography (India + World)", weight: 15 },
      { name: "Environment & Ecology", weight: 10 },
      { name: "Science & Technology", weight: 10 },
      { name: "Current Affairs", weight: 20 },
      { name: "Art & Culture", weight: 10 },
      { name: "International Relations", weight: 10 }
    ];

    const totalQuestions = 100;
    console.log(`Attempting to generate ${totalQuestions} questions using Gemini API for year ${yearNum}`);
    
    // Generate questions for each subtopic based on weight
    const questions = [];
    for (const topic of upscSubtopics) {
      const numQuestions = Math.ceil((topic.weight / 100) * totalQuestions);
      console.log(`Generating ${numQuestions} questions for ${topic.name}`);
      
      const topicQuestions = await generateMockTestQuestions(
        [topic.name], 
        numQuestions, 
        yearNum
      );
      
      questions.push(...topicQuestions);
    }

    // Shuffle questions to mix topics
    const shuffledQuestions = questions.sort(() => Math.random() - 0.5);
    
    // Take exactly 100 questions in case of rounding issues
    const finalQuestions = shuffledQuestions.slice(0, 100);
    
    console.log(`✅ Successfully generated ${finalQuestions.length} questions using Gemini API`);
    
    const mockTest = {
      _id: `mock_${yearNum}`,
      year: yearNum,
      title: `UPSC Prelims ${yearNum} - Full Length Mock Test`,
      description: `Comprehensive mock test based on UPSC Prelims ${yearNum} pattern with ${finalQuestions.length} questions covering all major topics`,
      durationMinutes: 120, // Standard UPSC Prelims duration
      totalQuestions: finalQuestions.length,
      questions: finalQuestions,
      createdAt: new Date().toISOString(),
      instructions: [
        "This is a timed test. You have 120 minutes to complete all questions.",
        "Each question carries 2 marks.",
        "There is a negative marking of 1/3rd for each wrong answer.",
        "No marks will be deducted for unanswered questions."
      ]
    };
    
    console.log(`✅ Generated mock test with ${questions.length} questions for year ${yearNum}`);
    
    return res.json(mockTest);
  } catch (err) {
    console.error('❌ Failed to generate mock test:', err);
    return res.status(500).json({ 
      error: 'Failed to generate mock test',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}
/**
 * @route   POST /api/mocktests/submit
 * @desc    Save mock test results
 * @access  Private
 */
export async function saveTestResult(req, res) {
  try {
    const userId = req.body.userId || req.headers['x-user-id'] || 'guest';
    const {
      testId,
      testYear,
      score,
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      unanswered,
      timeSpent,
      subjectWiseScore,
      responses
    } = req.body;

    // Validate required fields
    if (!testId || !testYear || score === undefined || !totalQuestions || correctAnswers === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const testResult = new MockTestResult({
      userId,
      testId,
      testYear,
      score,
      totalQuestions,
      correctAnswers,
      incorrectAnswers: incorrectAnswers || 0,
      unanswered: unanswered || 0,
      timeSpent: timeSpent || 0,
      subjectWiseScore: subjectWiseScore || [],
      responses: responses || [],
      testCompleted: true
    });

    const savedResult = await testResult.save();
    
    return res.status(201).json({
      success: true,
      message: 'Test result saved successfully',
      result: {
        id: savedResult._id,
        testId: savedResult.testId,
        score: savedResult.score,
        dateCompleted: savedResult.dateCompleted
      }
    });
  } catch (err) {
    console.error('Failed to save test result:', err);
    return res.status(500).json({ 
      error: 'Failed to save test result',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}

/**
 * @route   GET /api/mocktests/results/:testId?
 * @desc    Get user's test results (all or for a specific test)
 * @access  Private
 */
export async function getUserTestResults(req, res) {
  try {
    const { testId } = req.params;
    const userId = req.query.userId || req.headers['x-user-id'];
    if (!userId) {
      return res.status(400).json({ error: 'userId is required to fetch results' });
    }

    const query = { userId };
    if (testId) {
      query.testId = testId;
    }
    
    const results = await MockTestResult.find(query)
      .sort({ dateCompleted: -1 })
      .select('-__v -updatedAt -userId');
    
    return res.json({
      success: true,
      count: results.length,
      results
    });
  } catch (err) {
    console.error('Failed to fetch test results:', err);
    return res.status(500).json({ 
      error: 'Failed to fetch test results',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}

export async function listMockTests(req, res) {
  try {
    const mockTests = AVAILABLE_YEARS.map(year => ({
      _id: `mock_${year}`,
      year: year,
      title: `UPSC Prelims ${year} - Mock Test`,
      description: `Complete mock test based on UPSC Prelims ${year} pattern`,
      durationMinutes: 120,
      totalQuestions: 100,
      difficulty: 'Mixed',
      createdAt: new Date().toISOString()
    }));
    
    return res.json(mockTests);
  } catch (err) {
    console.error('Failed to list mock tests:', err);
    return res.status(500).json({ error: 'Failed to list mock tests' });
  }
}


