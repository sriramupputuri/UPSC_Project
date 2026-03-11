import mongoose from 'mongoose';

const ProblemSchema = new mongoose.Schema(
  {
    topic: { type: String, index: true },
    subtopic: { type: String, index: true },
    subject: { type: String, index: true },
    difficulty: { type: String },
    tags: [{ type: String }],
    question: { type: String, required: true },
    options: [{ type: String }],
    answer: { type: String },
    explanation: { type: String },
    source: { type: String },
    year: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model('Problem', ProblemSchema);


