import axios from 'axios';

const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

export async function generateMCQsWithOpenAI(prompt, count = 1) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    console.warn('OpenAI API key not configured, falling back to Gemini');
    throw new Error('OpenAI API key not configured');
  }

  const systemPrompt = `You are an expert UPSC exam question generator. Generate high-quality multiple-choice questions in strict JSON format.`;
  
  const userPrompt = `${prompt}

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "questions": [
    {
      "question": "question text here",
      "options": ["A. option1", "B. option2", "C. option3", "D. option4"],
      "answer": "A",
      "explanation": "detailed explanation",
      "topic": "topic name",
      "difficulty": "Easy"
    }
  ]
}`;

  try {
    console.log('Calling OpenAI API...');
    const { data } = await axios.post(
      OPENAI_ENDPOINT,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: count > 1 ? 3000 : 800,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        timeout: 30000,
      }
    );

    const content = data.choices?.[0]?.message?.content || '';
    console.log('OpenAI response received');

    // Parse JSON response
    try {
      const parsed = JSON.parse(content);
      return Array.isArray(parsed.questions) ? parsed.questions : [];
    } catch (e) {
      // Try to extract JSON from response
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        return Array.isArray(parsed.questions) ? parsed.questions : [];
      }
      console.error('Failed to parse OpenAI response:', content);
      return [];
    }
  } catch (error) {
    console.error('OpenAI API error:', error.response?.data || error.message);
    throw error;
  }
}
