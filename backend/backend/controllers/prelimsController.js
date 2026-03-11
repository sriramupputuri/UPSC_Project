// Mock prelims controller - no database required
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Map frontend paper names to JSON keys
const paperKeyMap = {
  'GS-I': 'GSI',
  'GS-II': 'GSII', 
  'GS-III': 'GSIII',
  'GSI': 'GSI',
  'GSII': 'GSII',
  'GSIII': 'GSIII'
};

// Get all prelims questions (with optional filters)
export async function getAllPrelims(req, res) {
  try {
    console.log('getAllPrelims called with query:', req.query);
    const { paper, year } = req.query;
    
    // Read the prelims data from the JSON file
    const prelimsPath = path.join(__dirname, '..', 'Prelims_Dataset.json');
    const prelimsData = JSON.parse(fs.readFileSync(prelimsPath, 'utf8'));
    
    console.log('Available papers in JSON:', Object.keys(prelimsData));
    
    // Combine all questions from different papers
    let allQuestions = [];
    Object.entries(prelimsData).forEach(([paperKey, questions]) => {
      const questionsWithPaper = questions.map(q => ({
        ...q,
        _id: q._id || `${paperKey}_${q.Id}`,
        paper: q.Paper || paperKey, // Use the Paper field from the question, fallback to key
        wordLimit: q.WordLimit,
        marks: q.Marks,
        question: q.Question,
        year: q.Year
      }));
      allQuestions = [...allQuestions, ...questionsWithPaper];
    });
    
    console.log(`Total questions loaded: ${allQuestions.length}`);
    
    // Apply filters
    if (paper) {
      console.log(`Filtering by paper: ${paper}`);
      // Try both the paper name and the mapped key
      const paperKey = paperKeyMap[paper] || paper;
      allQuestions = allQuestions.filter(q => 
        q.paper === paper || 
        q.paper === paperKey ||
        (prelimsData[paperKey] && q.paper === paperKey)
      );
      console.log(`Questions after paper filter: ${allQuestions.length}`);
    }
    
    if (year) {
      console.log(`Filtering by year: ${year}`);
      const yearNum = parseInt(year, 10);
      allQuestions = allQuestions.filter(q => q.Year === yearNum || q.year === yearNum);
      console.log(`Questions after year filter: ${allQuestions.length}`);
    }
    
    // Sort by year (descending), then by paper, then by Id
    allQuestions.sort((a, b) => {
      const yearA = a.Year || a.year;
      const yearB = b.Year || b.year;
      if (yearA !== yearB) return yearB - yearA;
      if (a.paper !== b.paper) return a.paper.localeCompare(b.paper);
      return a.Id - b.Id;
    });
    
    console.log(`Returning ${allQuestions.length} questions`);
    return res.json(allQuestions);
  } catch (err) {
    console.error('Error in getAllPrelims:', err);
    return res.status(500).json({
      error: 'Failed to fetch prelims questions',
      details: err.message,
    });
  }
}

// Get prelims by paper and year
export async function getPrelims(req, res) {
  try {
    console.log('getPrelims called with params:', req.params);
    const { paper, year } = req.params;
    const yearNum = parseInt(year, 10);
    
    // Read the prelims data from the JSON file
    const prelimsPath = path.join(__dirname, '..', 'Prelims_Dataset.json');
    const prelimsData = JSON.parse(fs.readFileSync(prelimsPath, 'utf8'));
    
    // Map paper name to JSON key
    const paperKey = paperKeyMap[paper] || paper;
    console.log(`Looking for paper: ${paper}, mapped to key: ${paperKey}`);
    
    // Get questions for the specified paper
    let questions = [];
    if (prelimsData[paperKey]) {
      questions = prelimsData[paperKey].filter(q => q.Year === yearNum);
    }
    
    // Normalize question fields
    questions = questions.map(q => ({
      ...q,
      _id: q._id || `${paperKey}_${q.Id}`,
      paper: q.Paper || paper, // Use the Paper field from question or the requested paper name
      wordLimit: q.WordLimit,
      marks: q.Marks,
      question: q.Question,
      year: q.Year
    }));
    
    console.log(`Found ${questions.length} prelims questions for ${paper} ${year}`);
    return res.json(questions);
  } catch (err) {
    console.error('Error fetching prelims:', err);
    return res.status(500).json({
      error: 'Failed to fetch prelims questions',
      details: err.message 
    });
  }
}


