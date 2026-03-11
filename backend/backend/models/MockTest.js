import mongoose from 'mongoose';

const MockTestSchema = new mongoose.Schema(
  {
    year: { type: Number, index: true },
    durationMinutes: { type: Number, default: 180 },
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
  },
  { timestamps: true }
);

export default mongoose.model('MockTest', MockTestSchema);


