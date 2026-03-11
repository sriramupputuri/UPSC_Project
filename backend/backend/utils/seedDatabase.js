import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Problem from '../models/Problem.js';
import PrelimsQuestion from '../models/PrelimsQuestion.js';

dotenv.config();

const SUBJECT_KEYWORDS = [
  { subject: 'Polity', keywords: ['polity', 'constitution', 'parliament', 'governance'] },
  { subject: 'Economy', keywords: ['economy', 'budget', 'growth', 'inflation', 'banking'] },
  { subject: 'Environment', keywords: ['environment', 'climate', 'ecology', 'biodiversity'] },
  { subject: 'Science & Tech', keywords: ['science', 'technology', 'space', 'research', 'innovation'] },
  { subject: 'History', keywords: ['history', 'freedom', 'reform', 'ancient', 'medieval', 'modern'] },
  { subject: 'Geography', keywords: ['geography', 'monsoon', 'geomorphology', 'ocean', 'climate'] },
  { subject: 'Ethics', keywords: ['ethics', 'integrity', 'attitude', 'case study'] },
  { subject: 'International Relations', keywords: ['international', 'foreign', 'diplomacy', 'global'] },
];

function readJsonSafe(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading/parsing ${filePath}:`, e.message);
    // Try with different encoding
    try {
      const raw2 = fs.readFileSync(filePath, 'latin1');
      const fixed = raw2.replace(/�/g, '"').replace(/�/g, '"').replace(/�/g, "'").replace(/�/g, "'");
      return JSON.parse(fixed);
    } catch (e2) {
      console.error('Failed with alternative encoding too:', e2.message);
      return null;
    }
  }
}

function normaliseOptionText(option, index) {
  if (!option) return '';
  let text = String(option).trim();
  const prefixRegex = new RegExp(`^[${String.fromCharCode(65 + index)}${index + 1}]\\s*([).:-]+)?\\s*`, 'i');
  text = text.replace(prefixRegex, '').trim();
  text = text.replace(/^[A-D]\.\s*/i, '');
  return text.trim();
}

function normaliseOptions(options) {
  if (!options) return [];
  let list = [];
  if (Array.isArray(options)) {
    list = options;
  } else if (typeof options === 'string') {
    const separator = options.includes('|') ? '|' : options.includes(';') ? ';' : ',';
    list = options.split(separator);
  }
  return list
    .map((opt, index) => normaliseOptionText(opt, index))
    .filter(Boolean);
}

function inferSubject(entry) {
  const subjectField = entry.subject || entry.Subject;
  if (subjectField) return subjectField;

  const haystack = [
    entry.topic,
    entry.Topic,
    entry.category,
    entry.Category,
    entry.subtopic,
    entry.Subtopic,
    entry.SubTopic,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  for (const candidate of SUBJECT_KEYWORDS) {
    if (candidate.keywords.some((keyword) => haystack.includes(keyword))) {
      return candidate.subject;
    }
  }

  return 'General Studies';
}

function inferDifficulty(entry) {
  return (
    entry.difficulty ||
    entry.Difficulty ||
    (entry.tags && entry.tags.includes('Hard') && 'Hard') ||
    (entry.tags && entry.tags.includes('Easy') && 'Easy') ||
    'Medium'
  );
}

function coerceTags(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((tag) => String(tag).trim()).filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
}

function listCandidates(root, filenames) {
  return filenames
    .map((filename) => path.isAbsolute(filename) ? filename : path.join(root, filename))
    .filter((filepath) => fs.existsSync(filepath));
}

function resolveDatasetPath(root, explicit, fallbacks) {
  if (explicit) {
    const absolute = path.isAbsolute(explicit) ? explicit : path.join(root, explicit);
    if (fs.existsSync(absolute)) {
      console.log(`Found dataset via explicit path: ${absolute}`);
      return absolute;
    }
  }
  const candidates = listCandidates(root, fallbacks);
  if (candidates.length > 0) {
    console.log(`Found dataset at: ${candidates[0]}`);
    return candidates[0];
  }
  // Try one more time with direct check in root
  const directPath = path.join(root, 'Prelims_Dataset.json');
  if (fs.existsSync(directPath)) {
    console.log(`Found dataset at direct path: ${directPath}`);
    return directPath;
  }
  console.log(`No dataset found. Checked root: ${root}, fallbacks:`, fallbacks);
  return null;
}

function normaliseProblems(data) {
  if (!data) return [];
  const array = Array.isArray(data)
    ? data
    : Array.isArray(data.records)
    ? data.records
    : Array.isArray(data.questions)
    ? data.questions
    : Array.isArray(data.items)
    ? data.items
    : Array.isArray(data.data)
    ? data.data
    : [];

  const normalised = array
    .map((entry) => {
      const question =
        entry.question ||
        entry.Question ||
        entry.question_text ||
        entry['Question Text'] ||
        entry['MCQ'];
      if (!question) return null;

      const tags = coerceTags(entry.tags || entry.Tags);

      return {
        topic:
          entry.topic ||
          entry.Topic ||
          entry.category ||
          entry.Category ||
          inferSubject(entry),
        subtopic: entry.subtopic || entry.SubTopic || entry['Sub Topic'] || null,
        subject: inferSubject(entry),
        difficulty: inferDifficulty(entry),
        tags,
        question,
        options: normaliseOptions(entry.options || entry.Options || entry.choices || entry.Choices),
        answer:
          entry.answer ||
          entry.Answer ||
          entry.correct_answer ||
          entry['Correct Answer'] ||
          entry.CorrectOption ||
          entry.CorrectOptionText ||
          null,
        explanation:
          entry.explanation ||
          entry.Explanation ||
          entry.solution ||
          entry.Solution ||
          entry.AnswerExplanation ||
          null,
        source: entry.source || entry.Source || entry.reference || null,
        year: Number(entry.year || entry.Year) || undefined,
      };
    })
    .filter(Boolean);

  return normalised;
}

function flattenPrelimsData(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  let records = [];
  Object.keys(data || {}).forEach((key) => {
    const arr = Array.isArray(data[key]) ? data[key] : [];
    // Map keys like GSI, GSII, GSIII to proper paper names
    const paperMap = {
      'GSI': 'GS-I',
      'GSII': 'GS-II',
      'GSIII': 'GS-III',
    };
    const paperName = paperMap[key] || (key.startsWith('GS') ? key : 'GS-I');
    records = records.concat(
      arr.map((item) => ({
        ...item,
        Paper: item.Paper || paperName,
      }))
    );
  });
  console.log(`Flattened ${records.length} prelims records from ${Object.keys(data).length} sections`);
  return records;
}

async function seedProblems(datasetPath) {
  if (!datasetPath) {
    // eslint-disable-next-line no-console
    console.warn('Problems dataset path could not be resolved. Skipping seeding for problems.');
    return;
  }

  const data = readJsonSafe(datasetPath);
  if (!data) {
    // eslint-disable-next-line no-console
    console.warn(`Problems dataset not found or invalid: ${datasetPath}`);
    return;
  }

  const count = await Problem.countDocuments();
  if (count > 0) {
    // eslint-disable-next-line no-console
    console.log('Problems already seeded, skipping');
    return;
  }

  const docs = normaliseProblems(data);

  if (!docs.length) {
    // eslint-disable-next-line no-console
    console.warn('Problems dataset was parsed but resulted in zero records');
    return;
  }

  await Problem.insertMany(docs);
  // eslint-disable-next-line no-console
  console.log(`Seeded Problems collection (${docs.length} documents)`);
}

async function seedPrelims(datasetPath) {
  if (!datasetPath) {
    // eslint-disable-next-line no-console
    console.warn('Prelims dataset path could not be resolved. Skipping seeding for prelims.');
    console.warn('Make sure Prelims_Dataset.json exists in the backend directory.');
    return;
  }

  console.log(`Attempting to read Prelims dataset from: ${datasetPath}`);
  console.log(`File exists: ${fs.existsSync(datasetPath)}`);
  
  const data = readJsonSafe(datasetPath);
  if (!data) {
    // eslint-disable-next-line no-console
    console.error(`Prelims dataset not found or invalid: ${datasetPath}`);
    console.error('Please check:');
    console.error('1. File exists at the path above');
    console.error('2. File is valid JSON');
    console.error('3. File has read permissions');
    return;
  }
  
  console.log(`Successfully read Prelims dataset. Data type: ${Array.isArray(data) ? 'Array' : typeof data}`);

  console.log('Prelims dataset loaded, processing...');
  const records = flattenPrelimsData(data);

  if (!records.length) {
    // eslint-disable-next-line no-console
    console.warn('Prelims dataset was parsed but resulted in zero records');
    return;
  }

  // Check if we should clear existing data or skip
  const count = await PrelimsQuestion.countDocuments();
  if (count > 0) {
    console.log(`Prelims already has ${count} documents. Clearing and re-seeding...`);
    await PrelimsQuestion.deleteMany({});
  }

  const prelimsDocs = records
    .filter((q) => q.Question || q.question) // Only include records with questions
    .map((q) => ({
      paper: q.Paper || q.paper || 'GS-I',
      year: Number(q.Year || q.year) || 2024,
      question: q.Question || q.question,
      wordLimit: Number(q.WordLimit || q.wordLimit || q.word_limit) || undefined,
      marks: Number(q.Marks || q.marks) || undefined,
      Id: q.Id || q.id || undefined, // Preserve the Id field
    }));

  if (prelimsDocs.length > 0) {
    await PrelimsQuestion.insertMany(prelimsDocs);
    // eslint-disable-next-line no-console
    console.log(`✅ Seeded PrelimsQuestion collection (${prelimsDocs.length} documents)`);
  } else {
    console.warn('No valid prelims documents to insert');
  }
}

async function ensureDataDirectory(root) {
  const dataDir = path.join(root, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return dataDir;
}

async function main() {
  await connectDB();
  const root = process.cwd();
  await ensureDataDirectory(root);

  const problemsPath = resolveDatasetPath(root, process.env.PROBLEMS_DATASET, [
    'data/UPSC_Mains_Subtopics_2000_Questions.json',
    'UPSC_Mains_Subtopics_2000_Questions.json',
    'data/Problems_Dataset.json',
    'Problems_Dataset.json',
  ]);

  const prelimsPath = resolveDatasetPath(root, process.env.PRELIMS_DATASET, [
    'Prelims_Dataset.json', // Check in backend directory first
    'data/Prelims_Dataset.json',
    'data/Prelims_GS_Dataset.json',
    'Prelims_GS_Dataset.json',
  ]);
  
  console.log('Root directory:', root);
  console.log('Looking for Prelims dataset...');
  console.log('Prelims path resolved:', prelimsPath);

  await seedProblems(problemsPath);
  await seedPrelims(prelimsPath);
  process.exit(0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Seeding failed:', err);
  process.exit(1);
});


