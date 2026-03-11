import React, { useState, useEffect } from 'react';
import { mockTestsAPI } from '../utils/api';
import { upsc2023Questions } from '../data/upsc2023Questions';
import { upsc2022Questions } from '../data/upsc2022Questions';
import { upsc2021Questions } from '../data/upsc2021Questions';
import { upsc2020Questions } from '../data/upsc2020Questions';
import { upsc2019Questions } from '../data/upsc2019Questions';
import { upsc2018Questions } from '../data/upsc2018Questions';
import { upsc2017Questions } from '../data/upsc2017Questions';
import { upsc2016Questions } from '../data/upsc2016Questions';
import { upsc2015Questions } from '../data/upsc2015Questions';
const STATIC_YEAR_DATA = {
  2023: upsc2023Questions,
  2022: upsc2022Questions,
  2021: upsc2021Questions,
  2020: upsc2020Questions,
  2019: upsc2019Questions,
  2018: upsc2018Questions,
  2017: upsc2017Questions,
  2016: upsc2016Questions,
  2015: upsc2015Questions,
};
import { Timer, ChevronLeft, ChevronRight, Flag, BookOpen, Calendar, Clock } from 'lucide-react';

const MockTestPage = () => {
  const [availableTests, setAvailableTests] = useState([]);
  const [mockTest, setMockTest] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [startingYear, setStartingYear] = useState(null);
  const [showExplanations, setShowExplanations] = useState({});

  useEffect(() => {
    loadAvailableTests();
  }, []);

  useEffect(() => {
    if (testStarted && timeRemaining > 0 && !testCompleted) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && testStarted && !testCompleted) {
      handleSubmitTest({ skipConfirm: true });
    }
  }, [timeRemaining, testStarted, testCompleted]);

  const loadAvailableTests = async () => {
    setLoading(true);
    try {
      console.log('🔄 Loading available mock tests...');
      // Call the list endpoint directly
      const response = await fetch('/api/mocktests');
      const data = await response.json();
      console.log('✅ Available tests loaded:', data);
      setAvailableTests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Failed to load mock tests:', err);
      // Fallback to default years if API fails
      const defaultYears = [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];
      setAvailableTests(defaultYears.map(year => ({
        _id: `mock_${year}`,
        year: year,
        title: `UPSC Prelims ${year} - Mock Test`,
        description: `Complete mock test based on UPSC Prelims ${year} pattern`,
        durationMinutes: 120,
        totalQuestions: 100
      })));
    } finally {
      setLoading(false);
    }
  };

  const startTest = async (year) => {
    setStartingYear(year);
    try {
      console.log(`🚀 Starting mock test for year ${year}`);
      const staticQuestions = STATIC_YEAR_DATA[year];
      let data;

      if (staticQuestions && staticQuestions.length > 0) {
        console.log(`📘 Loading static UPSC ${year} question bank`);
        data = {
          _id: `mock_${year}_static`,
          year,
          title: `UPSC Prelims ${year} - Static MCQ Set`,
          description: `50 curated UPSC Prelims ${year} practice questions`,
          durationMinutes: 120,
          totalQuestions: staticQuestions.length,
          questions: staticQuestions.map((question, idx) => ({
            ...question,
            _id: question._id || `${year}_q${idx + 1}`,
            options: Array.isArray(question.options) ? question.options : [],
            subtopic: question.subtopic || `UPSC ${year}`,
            difficulty: question.difficulty || 'Medium'
          }))
        };
      } else {
        data = await mockTestsAPI.getByYear(year);
      }
      console.log('✅ Mock test loaded:', data);

      if (data && data.questions && data.questions.length > 0) {
        setMockTest(data);
        setTimeRemaining((data.durationMinutes || 120) * 60);
        setTestStarted(true);
        setTestCompleted(false);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setShowExplanations({});
      } else {
        alert('Failed to load mock test questions. Please try again.');
      }
    } catch (err) {
      console.error('❌ Failed to start mock test:', err);
      alert('Failed to generate mock test: ' + (err.response?.data?.error || err.message || 'Unknown error'));
    } finally {
      setStartingYear(null);
    }
  };

  const handleAnswerSelect = (answer) => {
    setAnswers({
      ...answers,
      [currentQuestionIndex]: answer
    });
    // Show explanation after selecting answer
    setShowExplanations({
      ...showExplanations,
      [currentQuestionIndex]: true
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < mockTest.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitTest = async ({ skipConfirm = false } = {}) => {
    if (!mockTest) return;
    if (!skipConfirm && !window.confirm('Are you sure you want to submit the test?')) return;

    let correct = 0;
    let attempted = 0;
    let incorrect = 0;

    const responses = mockTest.questions.map((q, idx) => {
      const selectedLetter = answers[idx] || null;
      const correctLetter = q.answer || null;
      let isCorrect = false;

      if (selectedLetter) {
        attempted++;
        if (correctLetter && selectedLetter === correctLetter) {
          correct++;
          isCorrect = true;
        } else {
          incorrect++;
        }
      }

      const letterToIndex = (letter) => (letter ? letter.charCodeAt(0) - 65 : null);

      return {
        questionId: q._id || `${mockTest.year || 'mock'}_q${idx + 1}`,
        selectedOption: letterToIndex(selectedLetter),
        isCorrect,
        correctOption: letterToIndex(correctLetter),
        timeSpent: null
      };
    });

    const totalQuestions = mockTest.questions.length;
    const unanswered = totalQuestions - attempted;
    const durationSeconds = (mockTest.durationMinutes || 120) * 60;
    const timeSpent = Math.min(
      durationSeconds,
      Math.max(0, durationSeconds - (timeRemaining ?? durationSeconds))
    );

    const subjectWiseMap = {};
    mockTest.questions.forEach((q, idx) => {
      const subject = q.subtopic || 'General Studies';
      if (!subjectWiseMap[subject]) {
        subjectWiseMap[subject] = { subject, correct: 0, total: 0 };
      }
      subjectWiseMap[subject].total += 1;
      if (responses[idx].isCorrect) {
        subjectWiseMap[subject].correct += 1;
      }
    });

    const subjectWiseScore = Object.values(subjectWiseMap).map((entry) => ({
      ...entry,
      percentage: entry.total ? Number(((entry.correct / entry.total) * 100).toFixed(2)) : 0
    }));

    try {
      await mockTestsAPI.submitResult({
        testId: mockTest._id || `mock_${mockTest.year || 'custom'}`,
        testYear: mockTest.year || new Date().getFullYear(),
        score: correct,
        totalQuestions,
        correctAnswers: correct,
        incorrectAnswers: incorrect,
        unanswered,
        timeSpent,
        subjectWiseScore,
        responses
      });
      console.log('✅ Mock test result saved to database');
    } catch (err) {
      console.error('❌ Failed to save mock test result', err);
    }

    setTestCompleted(true);
    setMockTest({
      ...mockTest,
      score: correct,
      attempted,
      percentage: ((correct / totalQuestions) * 100).toFixed(2)
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading available mock tests...</div>
      </div>
    );
  }

  // Show list of available years
  if (!testStarted) {
    return (
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>UPSC Prelims Mock Tests</h1>
          <p style={{ color: '#aaa' }}>
            Practice with previous year paper-based mock tests. Each test contains 100 questions with 120 minutes duration.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {availableTests.map((test) => (
            <div key={test._id} className="card" style={{
              background: 'linear-gradient(135deg, #1a1a1a, #0f0f0f)',
              border: '1px solid #2a2a2a',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#ffa116';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#2a2a2a';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #ffa116, #ff8800)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}>
                  {test.year}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{test.title}</h3>
                </div>
              </div>
              
              <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                {test.description}
              </p>
              
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BookOpen size={16} color="#aaa" />
                  <span>{test.totalQuestions} Questions</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} color="#aaa" />
                  <span>{test.durationMinutes} mins</span>
                </div>
              </div>
              
              <button 
                onClick={() => startTest(test.year)}
                className="btn btn-primary"
                disabled={startingYear === test.year}
                style={{ width: '100%' }}
              >
                {startingYear === test.year ? 'Loading...' : 'Start Test'}
              </button>
            </div>
          ))}
        </div>

        {availableTests.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#aaa' }}>No mock tests available. Please check your connection and try again.</p>
            <button onClick={loadAvailableTests} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
              Retry
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!mockTest || !mockTest.questions || mockTest.questions.length === 0) {
    return (
      <div className="container">
        <div className="loading">Preparing your mock test...</div>
      </div>
    );
  }

  const currentQuestion = mockTest.questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;

  if (testCompleted) {
    const percentage = parseFloat(mockTest.percentage);
    const isPassed = percentage >= 33;
    
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: isPassed ? 'linear-gradient(135deg, #00b8a3, #00a693)' : 'linear-gradient(135deg, #ef476f, #d63f5f)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2rem',
            fontSize: '2.5rem'
          }}>
            {isPassed ? '✅' : '❌'}
          </div>
          
          <h1 style={{ color: isPassed ? '#00b8a3' : '#ef476f', marginBottom: '1rem' }}>
            {isPassed ? 'Test Completed!' : 'Test Completed'}
          </h1>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '1.5rem', 
            marginTop: '2rem',
            marginBottom: '2rem'
          }}>
            <div style={{ padding: '1.5rem', background: '#1a1a1a', borderRadius: '12px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffa116' }}>{mockTest.score}</div>
              <div style={{ color: '#aaa', fontSize: '0.9rem' }}>Correct Answers</div>
            </div>
            <div style={{ padding: '1.5rem', background: '#1a1a1a', borderRadius: '12px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00b8a3' }}>{mockTest.attempted}</div>
              <div style={{ color: '#aaa', fontSize: '0.9rem' }}>Attempted</div>
            </div>
            <div style={{ padding: '1.5rem', background: '#1a1a1a', borderRadius: '12px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: isPassed ? '#00b8a3' : '#ef476f' }}>{mockTest.percentage}%</div>
              <div style={{ color: '#aaa', fontSize: '0.9rem' }}>Score</div>
            </div>
          </div>
          
          <p style={{ color: '#aaa', marginBottom: '2rem' }}>
            Total Questions: {mockTest.questions.length} | 
            Unattempted: {mockTest.questions.length - mockTest.attempted}
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={() => {
                setTestCompleted(false);
                setTestStarted(false);
                setMockTest(null);
                setTimeRemaining(null);
                setAnswers({});
                setShowExplanations({});
              }} 
              className="btn btn-primary"
            >
              Take Another Test
            </button>
            <button 
              onClick={() => {
                setTestCompleted(false);
                setCurrentQuestionIndex(0);
              }} 
              className="btn btn-secondary"
            >
              Review Answers
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Timer and Progress */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ color: '#aaa' }}>Question {currentQuestionIndex + 1} of {mockTest.questions.length}</span>
            <span style={{ margin: '0 1rem', color: '#444' }}>|</span>
            <span style={{ color: '#aaa' }}>Answered: {answeredCount}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Timer size={20} color={timeRemaining < 300 ? '#ef476f' : '#ffa116'} />
            <span className="timer" style={{ color: timeRemaining < 300 ? '#ef476f' : '#ffa116' }}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="card">
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {currentQuestion.difficulty && (
              <span style={{
                background: currentQuestion.difficulty === 'Easy' ? '#00b8a320' : 
                            currentQuestion.difficulty === 'Medium' ? '#ffa11620' : '#ef476f20',
                color: currentQuestion.difficulty === 'Easy' ? '#00b8a3' : 
                       currentQuestion.difficulty === 'Medium' ? '#ffa116' : '#ef476f',
                border: `1px solid ${
                  currentQuestion.difficulty === 'Easy' ? '#00b8a3' : 
                  currentQuestion.difficulty === 'Medium' ? '#ffa116' : '#ef476f'
                }`,
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}>
                {currentQuestion.difficulty}
              </span>
            )}
            {currentQuestion.subtopic && (
              <span style={{ 
                fontSize: '0.9rem', 
                color: '#aaa',
                background: '#2a2a2a',
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                border: '1px solid #444'
              }}>
                📚 {currentQuestion.subtopic}
              </span>
            )}
          </div>
          
          <h3 style={{ 
            marginBottom: '1.5rem', 
            lineHeight: '1.6',
            fontSize: '1.2rem',
            color: '#fff'
          }}>{currentQuestion.question}</h3>
          
          {/* Options */}
          {currentQuestion.options && currentQuestion.options.length > 0 && (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {currentQuestion.options.map((option, idx) => {
                const optionLetter = String.fromCharCode(65 + idx);
                const isSelected = answers[currentQuestionIndex] === optionLetter;
                const isCorrect = currentQuestion.answer === optionLetter;
                const showResult = showExplanations[currentQuestionIndex];
                
                return (
                  <div
                    key={idx}
                    onClick={() => handleAnswerSelect(optionLetter)}
                    style={{
                      backgroundColor: showResult && isCorrect ? '#00b8a320' : 
                                      showResult && isSelected && !isCorrect ? '#ef476f20' :
                                      isSelected ? '#ffa11620' : '#161616',
                      border: showResult && isCorrect ? '2px solid #00b8a3' :
                              showResult && isSelected && !isCorrect ? '2px solid #ef476f' :
                              isSelected ? '2px solid #ffa116' : '1px solid #2a2a2a',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                      boxShadow: isSelected ? '0 4px 12px rgba(255, 161, 22, 0.2)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = '#ffa116';
                        e.currentTarget.style.transform = 'scale(1.01)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = '#2a2a2a';
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: showResult && isCorrect ? '#00b8a3' :
                                   showResult && isSelected && !isCorrect ? '#ef476f' :
                                   isSelected ? '#ffa116' : '#2a2a2a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        color: isSelected || (showResult && isCorrect) ? '#000' : '#fff',
                        flexShrink: 0
                      }}>
                        {showResult && isCorrect ? '✓' : showResult && isSelected && !isCorrect ? '✗' : optionLetter}
                      </div>
                      <span style={{ 
                        lineHeight: '1.5',
                        color: showResult && isCorrect ? '#00b8a3' :
                               showResult && isSelected && !isCorrect ? '#ef476f' :
                               isSelected ? '#ffa116' : '#fff',
                        fontWeight: isSelected ? '500' : 'normal'
                      }}>
                        {option.replace(/^[A-D]\.\s*/, '')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Explanation */}
          {showExplanations[currentQuestionIndex] && currentQuestion.explanation && (
            <div style={{
              marginTop: '2rem',
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #1a1a1a, #0f0f0f)',
              border: '1px solid #2a2a2a',
              borderRadius: '12px'
            }}>
              <h4 style={{ color: '#ffa116', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                💡 Explanation
              </h4>
              <p style={{ color: '#ccc', lineHeight: '1.6' }}>
                {currentQuestion.explanation}
              </p>
              {answers[currentQuestionIndex] === currentQuestion.answer ? (
                <div style={{ marginTop: '1rem', color: '#00b8a3', fontWeight: 'bold' }}>
                  ✅ Correct Answer!
                </div>
              ) : answers[currentQuestionIndex] ? (
                <div style={{ marginTop: '1rem', color: '#ef476f', fontWeight: 'bold' }}>
                  ❌ Incorrect. The correct answer is {currentQuestion.answer}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
        <button
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: currentQuestionIndex === 0 ? 0.5 : 1 }}
        >
          <ChevronLeft size={20} />
          Previous
        </button>

        <button
          onClick={handleSubmitTest}
          className="btn"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ef476f' }}
        >
          <Flag size={20} />
          Submit Test
        </button>

        <button
          onClick={handleNextQuestion}
          disabled={currentQuestionIndex === mockTest.questions.length - 1}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: currentQuestionIndex === mockTest.questions.length - 1 ? 0.5 : 1 }}
        >
          Next
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Question Navigator */}
      <div className="card" style={{ marginTop: '1rem' }}>
        <h4 style={{ marginBottom: '1rem' }}>Quick Navigation</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))', gap: '0.5rem' }}>
          {mockTest.questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentQuestionIndex(idx)}
              style={{
                padding: '0.75rem',
                backgroundColor: answers[idx] ? '#00b8a3' : (idx === currentQuestionIndex ? '#ffa116' : '#2a2a2a'),
                color: '#fff',
                border: idx === currentQuestionIndex ? '2px solid #ffa116' : 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: idx === currentQuestionIndex ? 'bold' : 'normal',
                transition: 'all 0.2s'
              }}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MockTestPage;
