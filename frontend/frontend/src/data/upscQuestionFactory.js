export const buildPlaceholderQuestions = (year) =>
  Array.from({ length: 50 }, (_, index) => {
    const qNum = index + 1;
    return {
      id: qNum,
      question: `${year} Placeholder Question ${qNum}: Replace with actual UPSC MCQ text.`,
      options: [
        `Option A for Q${qNum}`,
        `Option B for Q${qNum}`,
        `Option C for Q${qNum}`,
        `Option D for Q${qNum}`,
      ],
      answer: 'A',
      explanation: 'Insert the reasoning/explanation for the correct option here.',
      subtopic: null,
      difficulty: 'Medium',
    };
  });
