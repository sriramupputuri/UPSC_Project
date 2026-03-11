import mongoose from 'mongoose';

const PrelimsQuestionSchema = new mongoose.Schema(
  {
    paper: { type: String, index: true }, // GS-I, GS-II, GS-III
    year: { type: Number, index: true },
    question: { type: String, required: true },
    wordLimit: { type: Number },
    marks: { type: Number },
    Id: { type: Number }, // Original ID from dataset
  },
  { timestamps: true }
);

export default mongoose.model('PrelimsQuestion', PrelimsQuestionSchema);


