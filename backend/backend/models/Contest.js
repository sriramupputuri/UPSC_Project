import mongoose from 'mongoose';

const ContestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    rules: { type: String },
    durationMinutes: { type: Number, default: 120 },
    questions: [
      {
        question: String,
        options: [String],
        answer: String,
        explanation: String,
        topic: String,
        difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
      },
    ],
    startsAt: { type: Date },
    endsAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('Contest', ContestSchema);


