import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODELS = [
  'models/gemini-1.5-flash',
  'models/gemini-1.5-pro',
  'models/gemini-pro'
];

async function callGemini(prompt) {
  const attempts = [];

  for (const model of GEMINI_MODELS) {
    const endpoint = `https://generativelanguage.googleapis.com/v1/${model}:generateContent?key=${GEMINI_API_KEY}`;

    try {
      return await axios.post(endpoint, {
        contents: [{ parts: [{ text: prompt }] }]
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.error?.message || error.message;
      console.warn(`Gemini API Error (${model}):`, error.response?.data || message);
      attempts.push(`${model} -> ${status || 'ERR'}:${message}`);

      // Try next model if this one is unavailable
      if (status === 404 || status === 403) {
        continue;
      }

      throw new Error(`Gemini API failed (${model}): ${message}`);
    }
  }

  throw new Error(`All Gemini models unavailable: ${attempts.join(' | ')}`);
}

export async function generateContestQuestionsWithGemini(subtopics, questionsPerSubtopic = 2, context = 'contest') {
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key not configured, using fallback questions');
    throw new Error('Gemini API key not configured');
  }
  
  // Check if it's a placeholder key
  if (GEMINI_API_KEY.toLowerCase().includes('your-api-key') || GEMINI_API_KEY.toLowerCase().includes('placeholder')) {
    console.warn('Gemini API key appears to be a placeholder, using fallback questions');
    throw new Error('Gemini API key not properly configured');
  }

  const subtopicsList = subtopics.join(', ');
  
  // Add uniqueness factors based on context and timestamp
  const timestamp = Date.now();
  const randomSeed = Math.random().toString(36).substring(7);
  const contextIdentifier = context === 'mock' ? 'MOCK_TEST' : 'CONTEST_MODE';
  
  const prompt = `You are an expert UPSC exam question generator. Generate ${questionsPerSubtopic} high-quality questions for EACH of these subtopics: ${subtopicsList}.

CONTEXT: ${contextIdentifier} - Session ID: ${randomSeed} - Timestamp: ${timestamp}

INSTRUCTIONS:
1. Vary question types for better learning experience. Use these types:
   - factual: Direct knowledge-based questions
   - statement: Assertion-Reason type questions
   - matching: Match items from two columns
   - chronology: Arrange events in order
   - case_study: Scenario-based questions
   - data_interpretation: Questions based on data/graphs/tables
   - map_based: Questions requiring map analysis

2. For each question, provide:
   - question: Clear and concise question text
   - options: 4 well-differentiated options (A, B, C, D)
   - answer: Correct option (A/B/C/D)
   - explanation: Detailed explanation with relevant facts
   - difficulty: Easy/Medium/Hard
   - subtopic: The specific subtopic from the provided list
   - questionType: One of the types mentioned above

3. For different question types:
   - For 'matching': Format as "Match the following" with clear pairs
   - For 'chronology': List events to be arranged in order
   - For 'case_study': Include a brief case study before the question
   - For 'data_interpretation': Include necessary data/graph details
   - For 'map_based': Include map references if needed

CRITICAL: Return ONLY valid JSON in this exact format (no markdown, no extra text, no explanations outside JSON):
{
  "questions": [
    {
      "question": "question text here",
      "options": ["A. option1", "B. option2", "C. option3", "D. option4"],
      "answer": "A",
      "explanation": "detailed explanation here",
      "difficulty": "Medium",
      "subtopic": "Indian Polity",
      "questionType": "factual"
    }
  ]
}

REQUIREMENTS:
- Ensure each subtopic has exactly ${questionsPerSubtopic} questions
- Use at least 3 different question types per subtopic
- Mix difficulty levels appropriately
- Focus on ${context === 'mock' ? 'exam patterns and previous year trends' : 'conceptual clarity and application'}
- Make questions challenging but fair
- Ensure options are plausible and well-distributed
- Include current affairs where relevant (last 2 years)`;

  try {
    const response = await callGemini(prompt);
    const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    // Clean the response to extract JSON
    let jsonText = generatedText?.trim();

    if (!jsonText) {
      throw new Error('Gemini API returned empty content');
    }
    
    // Remove markdown code blocks if present
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json\n?/, '').replace(/```\n?$/, '');
    }
    
    // Remove any extra text before or after JSON
    const jsonStart = jsonText.indexOf('{');
    const jsonEnd = jsonText.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      jsonText = jsonText.substring(jsonStart, jsonEnd + 1);
    }

    const parsed = JSON.parse(jsonText);
    
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error('Invalid response format from Gemini API');
    }

    return parsed.questions;
  } catch (error) {
    console.error('Gemini API Error:', error.response?.data || error.message);
    throw new Error(`Failed to generate questions: ${error.message}`);
  }
}

// Dedicated function for mock test question generation
export async function generateMockTestQuestionsWithGemini(subtopics, questionsPerSubtopic = 2, year = 2024) {
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key not configured, using fallback questions');
    throw new Error('Gemini API key not configured');
  }

  if (GEMINI_API_KEY.toLowerCase().includes('your-api-key') || GEMINI_API_KEY.toLowerCase().includes('placeholder')) {
    console.warn('Gemini API key appears to be placeholder text, using fallback questions');
    throw new Error('Gemini API key not properly configured');
  }

  const subtopicsList = subtopics.join(', ');
  
  // Add uniqueness factors based on year and timestamp
  const timestamp = Date.now();
  const randomSeed = Math.random().toString(36).substring(7);
  const yearSpecificContext = `MOCK_TEST_${year}`;
  
  const prompt = `Generate ${questionsPerSubtopic} high-quality UPSC Civil Services Examination multiple-choice questions for EACH of the following subtopics: ${subtopicsList}.

CONTEXT: ${yearSpecificContext} - Session ID: ${randomSeed} - Timestamp: ${timestamp} - Mock Test Year: ${year}

For each question, provide:
1. A challenging, well-researched question
2. Four options (A, B, C, D) with only one correct answer
3. The correct answer letter
4. A detailed explanation of why the answer is correct
5. Difficulty level (Easy/Medium/Hard)
6. The specific subtopic it belongs to

CRITICAL: Return ONLY valid JSON in this exact format (no markdown, no extra text, no explanations outside JSON):
{
  "questions": [
    {
      "question": "question text here",
      "options": ["A. option1", "B. option2", "C. option3", "D. option4"],
      "answer": "A",
      "explanation": "detailed explanation here",
      "difficulty": "Medium",
      "subtopic": "Indian Polity"
    }
  ]
}

Requirements:
- Questions must be relevant to UPSC Prelims syllabus for ${year} pattern
- Options should be plausible but clearly differentiated
- Explanations should be educational and comprehensive
- Mix of difficulty levels across questions
- Each subtopic should have exactly ${questionsPerSubtopic} questions
- Ensure questions are unique and different from contest questions
- Focus on previous year paper patterns and exam-style questions for ${year}
- Include questions that reflect current affairs relevant to ${year - 1}-${year} period`;

  try {
    const response = await callGemini(prompt);
    const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    // Clean the response to extract JSON
    let jsonText = generatedText?.trim();

    if (!jsonText) {
      throw new Error('Gemini API returned empty content');
    }
    
    // Remove markdown code blocks if present
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json\n?/, '').replace(/```\n?$/, '');
    }
    
    // Remove any extra text before or after JSON
    const jsonStart = jsonText.indexOf('{');
    const jsonEnd = jsonText.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      jsonText = jsonText.substring(jsonStart, jsonEnd + 1);
    }

    const parsed = JSON.parse(jsonText);
    
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error('Invalid response format from Gemini API');
    }

    return parsed.questions;
  } catch (error) {
    console.error('Gemini API Error:', error.response?.data || error.message);
    throw new Error(`Failed to generate questions: ${error.message}`);
  }
}

// Fallback questions for each subtopic in case API fails
export const getFallbackQuestions = (subtopics) => {
  const fallbackQuestions = {
    "Indian Polity": [
      {
        question: "Which Article of the Indian Constitution deals with the Right to Constitutional Remedies?",
        options: ["A. Article 32", "B. Article 226", "C. Article 141", "D. Article 245"],
        answer: "A",
        explanation: "Article 32 provides the right to move to the Supreme Court for the enforcement of fundamental rights. Dr. B.R. Ambedkar called it the 'heart and soul' of the Constitution.",
        difficulty: "Medium",
        subtopic: "Indian Polity"
      }
    ],
    "Indian Economy": [
      {
        question: "Which of the following is NOT a component of Money Supply (M1) in India?",
        options: ["A. Currency with public", "B. Demand deposits with banks", "C. Other deposits with RBI", "D. Time deposits with banks"],
        answer: "D",
        explanation: "M1 includes currency with public, demand deposits with banks, and other deposits with RBI. Time deposits are part of M3, not M1.",
        difficulty: "Medium",
        subtopic: "Indian Economy"
      }
    ],
    "Modern Indian History": [
      {
        question: "The Vernacular Press Act of 1878 was enacted during the Viceroyalty of:",
        options: ["A. Lord Lytton", "B. Lord Ripon", "C. Lord Curzon", "D. Lord Mayo"],
        answer: "A",
        explanation: "The Vernacular Press Act of 1878 was enacted by Lord Lytton to control the vernacular press that was becoming critical of British policies.",
        difficulty: "Easy",
        subtopic: "Modern Indian History"
      }
    ]
  };

  let questions = [];
  subtopics.forEach(subtopic => {
    if (fallbackQuestions[subtopic]) {
      questions.push(...fallbackQuestions[subtopic]);
    } else {
      // Generic fallback for other subtopics
      questions.push({
        question: `Which of the following is most important for the ${subtopic} section of UPSC Prelims?`,
        options: ["A. Conceptual understanding", "B. Rote memorization", "C. Only current affairs", "D. Previous year papers only"],
        answer: "A",
        explanation: `For ${subtopic}, conceptual understanding combined with current knowledge is essential for success in UPSC Prelims.`,
        difficulty: "Medium",
        subtopic: subtopic
      });
    }
  });

  return questions;
};
