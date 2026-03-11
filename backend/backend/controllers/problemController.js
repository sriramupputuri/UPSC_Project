import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Map subtopics to subjects for better organization
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

// Function to get subject from subtopic
function getSubjectFromSubtopic(subtopic) {
  // Direct mapping
  if (subtopicToSubjectMap[subtopic]) {
    return subtopicToSubjectMap[subtopic];
  }
  
  // Fuzzy matching for common patterns
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
  
  // Default fallback
  return 'General Studies';
}

export async function getProblems(req, res) {
  try {
    console.log('getProblems called with params:', req.params, 'query:', req.query);
    
    const topicParam = req.params.topic || req.query.topic || req.query.subject;
    const subtopicParam = req.query.subtopic;
    const difficulty = req.query.difficulty;
    const yearParam = req.query.year;

    // Import the problems data from the JS module using file URL for Windows compatibility
    const problemsUrl = new URL('../Problems_Dataset.js', import.meta.url);
    const { upscQuestions: problemsData } = await import(problemsUrl.toString());

    // Enhance each problem with additional fields
    const enhancedProblems = problemsData.map((problem, index) => {
      const optionsArray = Array.isArray(problem.options)
        ? problem.options
        : problem.options && typeof problem.options === 'object'
          ? ['A', 'B', 'C', 'D'].filter((key) => problem.options[key]).map((key) => problem.options[key])
          : [];

      const normalizedDifficulty = problem.difficulty
        ? problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1).toLowerCase()
        : ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)];

      const explanation = problem.explanation || (problem.answer
        ? `The correct answer is option ${problem.answer}.`
        : 'Explanation not available.');

      return {
        ...problem,
        options: optionsArray,
        explanation,
        _id: problem._id || `problem_${index + 1}`,
        subject: getSubjectFromSubtopic(problem.subtopic),
        difficulty: normalizedDifficulty,
        year: problem.year || (2015 + Math.floor(Math.random() * 9)),
        tags: problem.tags || [problem.subtopic]
      };
    });

    let filteredProblems = enhancedProblems.filter(problem => {
      let matches = true;
      
      if (topicParam && topicParam !== 'all') {
        const topicRegex = new RegExp(topicParam, 'i');
        matches = matches && (
          topicRegex.test(problem.subtopic) ||
          topicRegex.test(problem.subject) ||
          (problem.tags && problem.tags.some(tag => topicRegex.test(tag)))
        );
      }
      
      if (subtopicParam) {
        const subtopicRegex = new RegExp(subtopicParam, 'i');
        matches = matches && subtopicRegex.test(problem.subtopic);
      }
      
      if (difficulty) {
        const difficultyRegex = new RegExp(`^${difficulty}$`, 'i');
        matches = matches && problem.difficulty && difficultyRegex.test(problem.difficulty);
      }
      
      if (yearParam) {
        const yearNum = parseInt(yearParam, 10);
        if (!isNaN(yearNum)) {
          matches = matches && problem.year === yearNum;
        }
      }
      
      return matches;
    });

    console.log(`Filtered ${filteredProblems.length} problems from ${enhancedProblems.length} total`);
    return res.json(filteredProblems);
  } catch (error) {
    console.error('Error in getProblems:', error);
    return res.status(500).json({
      error: 'Server error',
      message: error.message,
    });
  }
}



