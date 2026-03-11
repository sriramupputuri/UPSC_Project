import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Clock, Users, Play, Loader } from 'lucide-react';
import { contestsAPI } from '../utils/api';

const ContestsPage = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startingContest, setStartingContest] = useState(null);
  const [activeContest, setActiveContest] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Remove predefined contests - use API contests only

  useEffect(() => {
    loadContests();
  }, []);

  // Timer for active contest
  useEffect(() => {
    if (activeContest && timeRemaining !== null && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      handleSubmitContest();
    }
  }, [timeRemaining, activeContest]);

  const loadContests = async () => {
    setLoading(true);
    try {
      console.log('🔄 Loading contests from API...');
      const data = await contestsAPI.list();
      console.log('✅ Contests loaded:', data);
      setContests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Failed to load contests:', err);
      setError('Failed to load contests. Please check your connection and try again.');
      setContests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartContest = async (contestId) => {
    setStartingContest(contestId);
    setError('');
    try {
      console.log('🚀 Starting contest:', contestId);
      const data = await contestsAPI.start(contestId);
      console.log('✅ Contest data received:', data);
      
      if (data && data.questions && data.questions.length > 0) {
        console.log(`📝 Contest started with ${data.questions.length} questions`);
        setActiveContest(data);
        setTimeRemaining(data.durationMinutes * 60);
        setCurrentQuestionIndex(0);
        setAnswers({});
      } else {
        console.error('❌ No questions in contest data');
        setError('Contest has no questions. Please try again.');
      }
    } catch (err) {
      console.error('❌ Failed to start contest:', err);
      console.error('Error details:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to start contest';
      setError(`Failed to start contest: ${errorMessage}. Please check your connection and try again.`);
    } finally {
      setStartingContest(null);
    }
  };

  const handleAnswerSelect = (answer) => {
    setAnswers({
      ...answers,
      [currentQuestionIndex]: answer
    });
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < activeContest.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitContest = () => {
    if (!confirm('Are you sure you want to submit the contest?')) return;
    
    // Calculate score
    let correct = 0;
    activeContest.questions.forEach((q, idx) => {
      if (answers[idx] === q.answer) {
        correct++;
      }
    });
    
    alert(`Contest Submitted!\n\nYour Score: ${correct}/${activeContest.questions.length}\nPercentage: ${((correct / activeContest.questions.length) * 100).toFixed(2)}%`);
    setActiveContest(null);
    setTimeRemaining(null);
    setAnswers({});
    setCurrentQuestionIndex(0);
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // If a contest is active, show the contest interface
  if (activeContest) {
    const currentQuestion = activeContest.questions[currentQuestionIndex];
    const answeredCount = Object.keys(answers).length;
    const progress = ((currentQuestionIndex + 1) / activeContest.questions.length) * 100;

    return (
      <div className="container">
        {/* Contest Header */}
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>{activeContest.title}</h2>
              <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', color: '#aaa' }}>
                <span>Question {currentQuestionIndex + 1} of {activeContest.questions.length}</span>
                <span>Answered: {answeredCount}</span>
                <span>Progress: {progress.toFixed(0)}%</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} color={timeRemaining < 300 ? '#ef476f' : '#ffa116'} />
              <span style={{ 
                fontSize: '1.2rem', 
                fontWeight: 'bold',
                color: timeRemaining < 300 ? '#ef476f' : '#ffa116'
              }}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>
          <div style={{ marginTop: '1rem', height: '4px', background: '#2a2a2a', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: '#ffa116', transition: 'width 0.3s' }}></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="card">
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {currentQuestion.difficulty && (
                <span className={`difficulty difficulty-${currentQuestion.difficulty.toLowerCase()}`} style={{
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
                  
                  return (
                    <div
                      key={idx}
                      onClick={() => handleAnswerSelect(optionLetter)}
                      style={{
                        backgroundColor: isSelected ? 'linear-gradient(135deg, #ffa11620, #ffa11610)' : '#161616',
                        border: isSelected ? '2px solid #ffa116' : '1px solid #2a2a2a',
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
                          background: isSelected ? '#ffa116' : '#2a2a2a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          color: isSelected ? '#000' : '#fff',
                          flexShrink: 0
                        }}>
                          {optionLetter}
                        </div>
                        <span style={{ 
                          lineHeight: '1.5',
                          color: isSelected ? '#ffa116' : '#fff',
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
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #2a2a2a' }}>
            <button 
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="btn btn-secondary"
              style={{ opacity: currentQuestionIndex === 0 ? 0.5 : 1 }}
            >
              ← Previous
            </button>
            
            <button onClick={handleSubmitContest} className="btn" style={{ background: '#ef476f' }}>
              Submit Contest
            </button>
            
            <button 
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === activeContest.questions.length - 1}
              className="btn btn-primary"
              style={{ opacity: currentQuestionIndex === activeContest.questions.length - 1 ? 0.5 : 1 }}
            >
              Next →
            </button>
          </div>
        </div>

        {/* Question Navigator */}
        <div className="card" style={{ marginTop: '1rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Question Navigator</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))', gap: '0.5rem' }}>
            {activeContest.questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestionIndex(idx)}
                style={{
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: currentQuestionIndex === idx ? '2px solid #ffa116' : '1px solid #2a2a2a',
                  background: answers[idx] ? '#00b8a320' : '#1a1a1a',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: currentQuestionIndex === idx ? 'bold' : 'normal'
                }}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Contest list view
  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading contests...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Contests</h1>
        <p style={{ color: '#aaa' }}>Compete with other aspirants in timed challenges</p>
      </div>

      {error && (
        <div className="card" style={{ 
          marginBottom: '1rem',
          backgroundColor: 'rgba(239, 71, 111, 0.1)',
          border: '1px solid #ef476f',
          padding: '1rem'
        }}>
          <p style={{ color: '#ef476f', margin: 0 }}>{error}</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {contests.map((contest) => (
          <div key={contest.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <Trophy size={24} color="#ffa116" />
                  <h2 style={{ margin: 0 }}>{contest.title}</h2>
                  {contest.difficulty && (
                    <span className={`difficulty difficulty-${contest.difficulty.toLowerCase()}`}>
                      {contest.difficulty}
                    </span>
                  )}
                </div>
                <p style={{ color: '#aaa', marginBottom: '1rem' }}>{contest.description}</p>
                
                <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={16} color="#aaa" />
                    <span>{contest.durationMinutes || contest.duration || '120'} minutes</span>
                  </div>
                  <div>
                    <span style={{ color: '#aaa' }}>Questions: </span>
                    <span>{contest.questions?.length || contest.questions || 100}</span>
                  </div>
                </div>
                
                {contest.rules && (
                  <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#aaa', fontStyle: 'italic' }}>
                    {contest.rules}
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => handleStartContest(contest._id)}
                className="btn btn-primary"
                disabled={startingContest === contest._id}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {startingContest === contest._id ? (
                  <>
                    <Loader size={16} className="spin" />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    Start Contest
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Past Contests */}
      <div style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Past Contests</h2>
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: '#aaa' }}>View your past contest performances and solutions</p>
          <button className="btn btn-secondary" style={{ marginTop: '1rem' }}>
            View History
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContestsPage;
