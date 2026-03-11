import axios from 'axios';

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function generateMCQsWithGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }
  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text:
              `${prompt}\n\n` +
              'Return strict JSON with this shape: ' +
              '{ "questions": [ { "question": "string", "options": ["A","B","C","D"], "answer": "string", "explanation": "string", "topic": "string", "difficulty": "Easy|Medium|Hard" } ] }',
          },
        ],
      },
    ],
  };
  const { data } = await axios.post(`${GEMINI_ENDPOINT}?key=${apiKey}`, requestBody, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 60000, // Increase timeout to 60 seconds
  });
  // Gemini response parsing
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed.questions) ? parsed.questions : [];
  } catch (e) {
    // try to extract JSON substring
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return Array.isArray(parsed.questions) ? parsed.questions : [];
    }
    return [];
  }
}


