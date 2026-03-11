import mongoose from 'mongoose';

const DailyProblemSchema = new mongoose.Schema(
  {
    date: { type: String, index: true, unique: true }, // YYYY-MM-DD
    question: { type: String, required: true },
    options: [{ type: String }],
    answer: { type: String },
    explanation: { type: String },
    topic: { type: String, default: 'General Studies' },
    subject: { type: String, default: 'General Studies' },
    difficulty: { type: String, default: 'Medium' },
    generatedBy: { type: String, default: 'Dataset' },
  },
  { timestamps: true }
);

export default mongoose.model('DailyProblem', DailyProblemSchema);


