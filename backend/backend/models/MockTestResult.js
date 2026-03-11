import mongoose from 'mongoose';

const MockTestResultSchema = new mongoose.Schema(
  {
    userId: { 
      type: String,
      required: true,
      index: true
    },
    testId: { 
      type: String, 
      required: true,
      index: true 
    },
    testYear: { 
      type: Number, 
      required: true,
      index: true 
    },
    score: { 
      type: Number, 
      required: true 
    },
    totalQuestions: { 
      type: Number, 
      required: true 
    },
    correctAnswers: { 
      type: Number, 
      required: true 
    },
    incorrectAnswers: { 
      type: Number, 
      default: 0 
    },
    unanswered: { 
      type: Number, 
      default: 0 
    },
    timeSpent: { 
      type: Number, // in seconds
      required: true 
    },
    subjectWiseScore: [{
      subject: String,
      correct: Number,
      total: Number,
      percentage: Number
    }],
    responses: [{
      questionId: String,
      selectedOption: Number, // index of selected option (0-3)
      isCorrect: Boolean,
      correctOption: Number, // index of correct option (0-3)
      timeSpent: Number // in seconds
    }],
    testCompleted: { 
      type: Boolean, 
      default: true 
    },
    dateCompleted: { 
      type: Date, 
      default: Date.now 
    }
  },
  { 
    timestamps: true,
    collection: 'mtests' // Explicitly set the collection name to 'mtests'
  }
);

// Index for faster queries
MockTestResultSchema.index({ userId: 1, testId: 1 });
MockTestResultSchema.index({ userId: 1, testYear: 1 });
MockTestResultSchema.index({ userId: 1, dateCompleted: -1 });

export default mongoose.model('MockTestResult', MockTestResultSchema);
