import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODELS = [
  'gemini-2.0-flash'
];

// Base URL for Gemini API
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

function ensureGeminiKey() {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured. Please set GEMINI_API_KEY in your environment.');
  }

  if (GEMINI_API_KEY.toLowerCase().includes('your-api-key') || GEMINI_API_KEY.toLowerCase().includes('placeholder')) {
    throw new Error('Gemini API key is a placeholder. Please provide a valid key.');
  }
}

async function callGemini(prompt) {
  const attempts = [];

  for (const model of GEMINI_MODELS) {
    const endpoint = `${GEMINI_BASE_URL}/models/${model}:generateContent`;
    console.log(`🔍 Attempting to call Gemini API with model: ${model}`);
    console.log(`📝 Prompt length: ${prompt.length} characters`);
    
    try {
      const requestBody = {
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 32,
          topP: 0.95,
          maxOutputTokens: 2048,
          stopSequences: []
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_NONE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_NONE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_NONE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE'
          }
        ]
      };

      console.log('📤 Sending request to Gemini API...');
      const response = await axios.post(
        endpoint,
        requestBody,
        {
          params: { key: GEMINI_API_KEY },
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 120000 // 120 seconds timeout
        }
      );
      
      console.log('✅ Received response from Gemini API');
      console.log(`Response status: ${response.status}`);
      
      if (!response.data) {
        throw new Error('Empty response data from Gemini API');
      }
      
      return response;
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.error?.message || error.message;
      attempts.push(`${model} -> ${status || 'ERR'}:${message}`);

      if (status === 404 || status === 403) {
        continue;
      }

      throw new Error(`Gemini API failed (${model}): ${message}`);
    }
  }

  throw new Error(`All Gemini models unavailable: ${attempts.join(' | ')}`);
}

function normalizeOptions(options) {
  if (!options) return [];

  if (Array.isArray(options)) {
    return options.map((opt, idx) => {
      const label = String.fromCharCode(65 + idx);
      return opt.startsWith(`${label}.`) ? opt : `${label}. ${opt}`;
    });
  }

  if (typeof options === 'object') {
    const labels = ['A', 'B', 'C', 'D'];
    return labels
      .filter((label) => options[label])
      .map((label) => {
        const value = options[label];
        return value.startsWith(`${label}.`) ? value : `${label}. ${value}`;
      });
  }

  return [];
}

function sanitizeQuestions(rawQuestions, year) {
  return rawQuestions.map((question, idx) => {
    const options = normalizeOptions(question.options);

    return {
      _id: question._id || `${year}_q${idx + 1}`,
      question: question.question || '',
      options,
      answer: question.answer ? question.answer.toString().trim().toUpperCase() : null,
      explanation: question.explanation || '',
      subtopic: question.subtopic || null,
      difficulty: question.difficulty || null
    };
  }).filter((q) => q.question && q.options.length >= 2);
}

export async function generateMockTestQuestions(subtopics, questionsPerSubtopic = 10, year = 2024) {
  ensureGeminiKey();

  const totalQuestionsNeeded = subtopics.length * questionsPerSubtopic;
  const subtopicsList = subtopics.join(', ');
  const timestamp = Date.now();
  const sessionId = Math.random().toString(36).substring(2, 10);

  const prompt = `You are an UPSC Prelims question setter. Generate EXACTLY ${totalQuestionsNeeded} unique multiple choice questions for UPSC Prelims ${year}.

Requirements:
- Cover EACH of these subtopics with ${questionsPerSubtopic} questions: ${subtopicsList}
- Use historical context, PYQ patterns, and current affairs relevant to ${year - 1}-${year}
- Difficulty mix: Easy/Medium/Hard
- Provide realistic explanations referencing facts or concepts
- Ensure no duplicate or trivial questions

Return ONLY valid JSON, no markdown, in this shape:
{
  "questions": [
    {
      "question": "text",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "answer": "A",
      "explanation": "...",
      "difficulty": "Medium",
      "subtopic": "Indian Polity"
    }
  ]
}

Metadata: SESSION ${sessionId} | YEAR ${year} | GENERATED_AT ${timestamp}`;

  const response = await callGemini(prompt);
  const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!generatedText) {
    throw new Error('Gemini API returned empty response');
  }

  console.log('📥 Raw response from Gemini:', generatedText);
  
  let jsonText = generatedText;
  if (!jsonText) {
    throw new Error('Empty response from Gemini API');
  }
  
  // Try to extract JSON if it's wrapped in markdown code blocks
  if (jsonText.includes('```')) {
    const codeBlockMatch = jsonText.match(/```(?:json)?\n([\s\S]*?)\n```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
      jsonText = codeBlockMatch[1].trim();
    } else {
      // If we can't find a proper code block, try to extract JSON directly
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }
    }
  }
  
  // Clean up any remaining markdown or formatting
  jsonText = jsonText
    .replace(/^\s*```(?:json)?\s*/, '')
    .replace(/\s*```\s*$/, '')
    .trim();
    
  console.log('🧹 Cleaned JSON text:', jsonText.slice(0, 200) + '...');

  let parsed;
  try {
    console.log('🔍 Attempting to parse JSON response...');
    parsed = JSON.parse(jsonText);
    console.log('✅ Successfully parsed JSON response');
  } catch (error) {
    console.error('❌ JSON parse error:', error.message);
    console.error('Problematic JSON text:', jsonText);
    throw new Error(`Failed to parse Gemini response: ${error.message}. Response: ${jsonText.slice(0, 200)}...`);
  }

  if (!parsed?.questions || !Array.isArray(parsed.questions)) {
    throw new Error('Gemini response missing questions array');
  }

  if (parsed.questions.length !== totalQuestionsNeeded) {
    throw new Error(`Gemini response must contain exactly ${totalQuestionsNeeded} questions but returned ${parsed.questions.length}`);
  }

  const sanitized = sanitizeQuestions(parsed.questions, year);

  if (sanitized.length !== totalQuestionsNeeded) {
    throw new Error(`Only ${sanitized.length}/${totalQuestionsNeeded} questions were valid after sanitization`);
  }

  return sanitized;
}

