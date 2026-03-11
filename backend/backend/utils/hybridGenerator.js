import { generateMCQsWithOpenAI } from './openaiGenerator.js';
import { generateMCQsWithGemini } from './geminiGenerator.js';

/**
 * Hybrid question generator - tries OpenAI first (faster), falls back to Gemini
 * @param {string} prompt - The generation prompt
 * @param {number} count - Number of questions to generate
 * @returns {Promise<Array>} Array of generated questions
 */
export async function generateMCQsHybrid(prompt, count = 1) {
  // Try OpenAI first (generally faster and more reliable)
  try {
    console.log(`Attempting to generate ${count} questions with OpenAI...`);
    const questions = await generateMCQsWithOpenAI(prompt, count);
    
    if (questions && questions.length > 0) {
      console.log(`✅ OpenAI generated ${questions.length} questions successfully`);
      return questions;
    }
  } catch (openaiError) {
    console.log('OpenAI failed, falling back to Gemini:', openaiError.message);
  }

  // Fallback to Gemini
  try {
    console.log(`Attempting to generate ${count} questions with Gemini...`);
    const questions = await generateMCQsWithGemini(prompt);
    
    if (questions && questions.length > 0) {
      console.log(`✅ Gemini generated ${questions.length} questions successfully`);
      return questions;
    }
  } catch (geminiError) {
    console.error('Both OpenAI and Gemini failed:', geminiError.message);
    throw new Error('Failed to generate questions with both OpenAI and Gemini');
  }

  throw new Error('No questions generated');
}

/**
 * Generate questions with preference for a specific provider
 * @param {string} prompt - The generation prompt
 * @param {string} provider - 'openai' or 'gemini'
 * @param {number} count - Number of questions
 * @returns {Promise<Array>} Array of generated questions
 */
export async function generateMCQsWithProvider(prompt, provider = 'openai', count = 1) {
  if (provider === 'openai') {
    return await generateMCQsWithOpenAI(prompt, count);
  } else {
    return await generateMCQsWithGemini(prompt);
  }
}
