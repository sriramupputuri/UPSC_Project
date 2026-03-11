import React, { useEffect, useState } from 'react';
import { prelimsAPI } from '../utils/api';
import { BookOpen, FileText, ClipboardList, Clock, Edit3, CheckCircle } from 'lucide-react';

const PAPERS = ['GS-I', 'GS-II', 'GS-III'];
const YEARS = [2021, 2020, 2019, 2018, 2017, 2016, 2015];

const PrelimsPage = () => {
  const [paper, setPaper] = useState(PAPERS[0]); // Default to GS-I
  const [year, setYear] = useState(YEARS[0]); // Default to 2021
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (timerActive) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const fetchQuestions = async () => {
    // Only fetch if both paper and year are selected
    if (!paper || !year) {
      setQuestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const filters = {
        paper: paper,
        year: Number(year)
      };

      console.log('📤 Fetching prelims with filters:', filters);
      const data = await prelimsAPI.fetchAll(filters);
      console.log('✅ Prelims data received:', data?.length || 0, 'questions');
      
      if (Array.isArray(data)) {
        setQuestions(data);
        if (data.length === 0) {
          console.warn('⚠️ No questions found. Make sure to run: npm run seed in backend');
        }
      } else {
        console.error('❌ Invalid data format:', data);
        setQuestions([]);
      }
    } catch (err) {
      console.error('❌ Failed to fetch prelims questions:', err);
      console.error('Error details:', err.response?.data || err.message);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [paper, year]);

  const handleQuestionSelect = (question) => {
    setSelectedQuestion(question);
    setAnswer('');
    setTimeElapsed(0);
    setTimerActive(true);
    setSubmitted(false);
  };

  const handleCloseAnswer = () => {
    setSelectedQuestion(null);
    setAnswer('');
    setTimeElapsed(0);
    setTimerActive(false);
    setSubmitted(false);
  };

  const handleSubmit = () => {
    if (!answer.trim()) {
      alert('Please write an answer before submitting.');
      return;
    }
    setSubmitted(true);
    setTimerActive(false);
    // Here you can add API call to save the answer
    console.log('Answer submitted:', {
      questionId: selectedQuestion._id,
      answer: answer,
      timeElapsed: timeElapsed,
      wordCount: answer.trim().split(/\s+/).length,
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
  const wordLimit = selectedQuestion?.wordLimit || 150;
  const isOverLimit = wordCount > wordLimit;

  const filteredQuestions = questions.filter((q) =>
    q.question?.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>Prelims Question Bank</h1>
          <p style={{ color: '#aaa', maxWidth: '540px' }}>
            Select Paper and Year to load all questions. Click any question to write your theoretical answer with time constraint and word limit.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '0.5rem' }}>Paper</label>
            <select
              value={paper}
              onChange={(event) => {
                setPaper(event.target.value);
                setSelectedQuestion(null); // Clear selection when filter changes
              }}
              style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#fff', minWidth: '120px' }}
            >
              {PAPERS.map((paperOption) => (
                <option key={paperOption} value={paperOption}>
                  {paperOption}
                </option>
              ))}
            </select>
          </div>
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '0.5rem' }}>Year</label>
            <select
              value={year}
              onChange={(event) => {
                setYear(Number(event.target.value));
                setSelectedQuestion(null); // Clear selection when filter changes
              }}
              style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#fff', minWidth: '120px' }}
            >
              {YEARS.map((yearOption) => (
                <option key={yearOption} value={yearOption}>
                  {yearOption}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search question keywords…"
          style={{
            width: '100%',
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            border: '1px solid #2a2a2a',
            background: '#1a1a1a',
            color: '#fff',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: '1 1 280px', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ background: '#ffa11620', padding: '0.75rem', borderRadius: '10px' }}>
            <BookOpen size={28} color="#ffa116" />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#aaa' }}>Questions loaded</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
              {loading ? '—' : filteredQuestions.length}
            </div>
          </div>
        </div>
      </div>

      {selectedQuestion && (
        <div className="card" style={{ marginBottom: '2rem', border: '2px solid #ffa116' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <span style={{ padding: '0.35rem 0.9rem', borderRadius: '999px', background: '#2a2a2a', fontSize: '0.85rem', color: '#ffa116' }}>
                  {selectedQuestion.paper}
                </span>
                <span style={{ color: '#aaa', fontSize: '0.85rem' }}>
                  {selectedQuestion.year} • {selectedQuestion.wordLimit ? `${selectedQuestion.wordLimit} words` : '150 words'}
                </span>
                {selectedQuestion.marks && (
                  <span style={{ color: '#aaa', fontSize: '0.85rem' }}>{selectedQuestion.marks} marks</span>
                )}
                {timerActive && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#00b8a3', fontSize: '0.85rem' }}>
                    <Clock size={16} />
                    {formatTime(timeElapsed)}
                  </span>
                )}
              </div>
              <h2 style={{ fontSize: '1.2rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                {selectedQuestion.question}
              </h2>
            </div>
            <button
              onClick={handleCloseAnswer}
              style={{
                background: 'none',
                border: '1px solid #2a2a2a',
                color: '#aaa',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>

          {!submitted ? (
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>
                    Write your answer:
                  </label>
                  <div style={{ fontSize: '0.85rem', color: isOverLimit ? '#ef476f' : '#aaa' }}>
                    {wordCount} / {wordLimit} words
                    {isOverLimit && ' (Over limit!)'}
                  </div>
                </div>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder={`Write your answer here (${wordLimit} words limit)...`}
                  style={{
                    width: '100%',
                    minHeight: '200px',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: isOverLimit ? '2px solid #ef476f' : '1px solid #2a2a2a',
                    background: '#1a1a1a',
                    color: '#fff',
                    fontSize: '1rem',
                    lineHeight: 1.6,
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                  disabled={submitted}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setTimerActive(false);
                    setAnswer('');
                  }}
                  className="btn btn-secondary"
                  disabled={submitted}
                >
                  Clear
                </button>
                <button
                  onClick={handleSubmit}
                  className="btn btn-primary"
                  disabled={submitted || !answer.trim()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <CheckCircle size={18} />
                  Submit Answer
                </button>
              </div>
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', background: '#1a1a1a', borderRadius: '8px' }}>
              <CheckCircle size={48} color="#00b8a3" style={{ marginBottom: '1rem' }} />
              <h3 style={{ color: '#00b8a3', marginBottom: '0.5rem' }}>Answer Submitted!</h3>
              <p style={{ color: '#aaa', marginBottom: '1rem' }}>
                Word count: {wordCount} / {wordLimit} words
              </p>
              <p style={{ color: '#aaa', marginBottom: '1rem' }}>
                Time taken: {formatTime(timeElapsed)}
              </p>
              <button onClick={handleCloseAnswer} className="btn btn-secondary">
                Close
              </button>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="loading">Loading questions for {paper} - {year}…</div>
      ) : questions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#aaa', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            No questions found for {paper} - {year}
          </p>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Make sure to seed the Prelims data by running:
          </p>
          <code style={{ 
            display: 'block', 
            padding: '0.5rem 1rem', 
            background: '#1a1a1a', 
            borderRadius: '4px',
            color: '#ffa116',
            marginBottom: '1rem'
          }}>
            cd backend && npm run seed
          </code>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>
            Or try selecting a different paper or year.
          </p>
        </div>
      ) : filteredQuestions.length === 0 && search ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#aaa', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            No questions match your search
          </p>
          <button className="btn btn-secondary" onClick={() => setSearch('')}>
            Clear Search
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ marginBottom: '1rem', color: '#aaa', fontSize: '0.9rem' }}>
            Showing {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''} for {paper} - {year}
          </div>
          {filteredQuestions.map((question) => (
            <div
              key={question._id || `${question.paper}-${question.year}-${question.Id}`}
              className="card"
              style={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: selectedQuestion?._id === question._id ? '2px solid #ffa116' : '1px solid #2a2a2a',
              }}
              onClick={() => handleQuestionSelect(question)}
              onMouseEnter={(e) => {
                if (selectedQuestion?._id !== question._id) {
                  e.currentTarget.style.borderColor = '#ffa116';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedQuestion?._id !== question._id) {
                  e.currentTarget.style.borderColor = '#2a2a2a';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 auto' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ padding: '0.35rem 0.9rem', borderRadius: '999px', background: '#2a2a2a', fontSize: '0.85rem', color: '#ffa116' }}>
                      {question.paper}
                    </span>
                    <span style={{ color: '#aaa', fontSize: '0.85rem' }}>
                      {question.year} • {question.wordLimit ? `${question.wordLimit} words` : '150 words'}
                    </span>
                    {question.marks && (
                      <span style={{ color: '#aaa', fontSize: '0.85rem' }}>{question.marks} marks</span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>
                    {question.question}
                  </h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffa116' }}>
                  <Edit3 size={20} />
                  <span style={{ fontSize: '0.85rem' }}>Click to answer</span>
                </div>
              </div>
            </div>
          ))}

          {filteredQuestions.length > 0 && search && (
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: '#aaa' }}>
                {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''} match your search.
              </p>
              <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={() => setSearch('')}>
                Clear Search
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PrelimsPage;
