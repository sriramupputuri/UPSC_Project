import React, { useState, useEffect, useMemo } from 'react';
import FlashCard from '../components/FlashCard';
import { problemsAPI } from '../utils/api';
import { Filter, BookOpenCheck, Landmark, Activity, Scale, Brain, Globe2 } from 'lucide-react';

const ProblemsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    subject: '',
    subtopic: '',
    difficulty: '',
  });

  const loadQuestions = async (activeFilters = {}) => {
    // Only load questions if a subtopic or subject is selected
    // Difficulty can be used as additional filter but not alone
    if (!activeFilters.subtopic && !activeFilters.subject) {
      setQuestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      console.log('Loading questions with filters:', activeFilters);
      const data = await problemsAPI.list(activeFilters);
      console.log('Questions loaded:', data?.length || 0);
      if (Array.isArray(data)) {
        setQuestions(data);
      } else {
        console.error('Invalid data format:', data);
        setQuestions([]);
        setError('Invalid response format from server');
      }
    } catch (err) {
      console.error('Failed to load problems:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load problems. Please check if the backend server is running.';
      setError(errorMessage);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.subject, filters.subtopic, filters.difficulty]);

  // Load all subjects and subtopics from API when component mounts
  const [allSubjects, setAllSubjects] = useState([]);
  const [allSubtopics, setAllSubtopics] = useState([]);
  const [subtopicsBySubject, setSubtopicsBySubject] = useState({});
  const [metadataLoading, setMetadataLoading] = useState(true);

  useEffect(() => {
    const loadMetadata = async () => {
      setMetadataLoading(true);
      try {
        console.log('Loading metadata (subjects and subtopics)...');
        // Fetch all data to get subjects and subtopics (no filters)
        const data = await problemsAPI.list({});
        console.log('Metadata data received:', data?.length || 0, 'questions');
        
        if (Array.isArray(data) && data.length > 0) {
          // Extract all unique subjects
          const subjects = Array.from(new Set(data.map((q) => q.subject).filter(Boolean))).sort();
          console.log('Found subjects:', subjects.length, subjects);
          
          // Extract all unique subtopics
          const subtopics = Array.from(new Set(data.map((q) => q.subtopic).filter(Boolean))).sort();
          console.log('Found subtopics:', subtopics.length);
          
          setAllSubjects(subjects);
          setAllSubtopics(subtopics);
          
          // Group subtopics by subject
          const subtopicsMap = {};
          data.forEach((q) => {
            if (q.subject && q.subtopic) {
              if (!subtopicsMap[q.subject]) {
                subtopicsMap[q.subject] = new Set();
              }
              subtopicsMap[q.subject].add(q.subtopic);
            }
          });
          
          // Convert Sets to sorted arrays
          const subtopicsBySubjectObj = {};
          Object.keys(subtopicsMap).forEach((subject) => {
            subtopicsBySubjectObj[subject] = Array.from(subtopicsMap[subject]).sort();
          });
          
          console.log('Subtopics by subject:', Object.keys(subtopicsBySubjectObj).length, 'subjects');
          setSubtopicsBySubject(subtopicsBySubjectObj);
        } else {
          console.warn('No data received for metadata. Make sure problems are seeded.');
        }
      } catch (err) {
        console.error('Failed to load metadata:', err);
        console.error('Error details:', err.response?.data || err.message);
      } finally {
        setMetadataLoading(false);
      }
    };
    loadMetadata();
  }, []);

  // Filter subtopics based on selected subject
  const availableSubtopics = useMemo(() => {
    if (!filters.subject) {
      return allSubtopics;
    }
    // Return subtopics for the selected subject
    return subtopicsBySubject[filters.subject] || [];
  }, [filters.subject, allSubtopics, subtopicsBySubject]);

  const subjects = allSubjects;


  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };
      // Clear subtopic when subject changes
      if (key === 'subject' && value !== prev.subject) {
        newFilters.subtopic = '';
      }
      return newFilters;
    });
  };

  const clearFilters = () => {
    setFilters({
      subject: '',
      subtopic: '',
      difficulty: '',
    });
  };

  const handleSubtopicSelect = (subject = '', difficulty = '') => {
    setFilters((prev) => ({
      ...prev,
      subject: subject || prev.subject,
      difficulty: difficulty || prev.difficulty,
    }));
  };

  const handleFlashcardSelect = (card) => {
    // Handle flashcard selection - can be extended later
    console.log('Flashcard selected:', card);
  };

  const highlightSubtopics = [
    {
      title: 'Modern History',
      description: 'Reform movements, freedom struggle and key personalities.',
      accent: '#ffa116',
      subject: 'History',
      Icon: Landmark,
    },
    {
      title: 'Economy & Budget',
      description: 'Fiscal policy, growth indicators and economic reforms.',
      accent: '#06d6a0',
      subject: 'Economy',
      Icon: Scale,
    },
    {
      title: 'Environment & Ecology',
      description: 'Climate change, biodiversity and environmental governance.',
      accent: '#00b8a3',
      subject: 'Environment',
      Icon: Globe2,
    },
    {
      title: 'Science & Tech',
      description: 'Emerging technologies, space missions and health advances.',
      accent: '#ef476f',
      subject: 'Science & Tech',
      Icon: Activity,
    },
    {
      title: 'Polity & Governance',
      description: 'Constitutional provisions, judiciary and public policy.',
      accent: '#118ab2',
      subject: 'Polity',
      Icon: BookOpenCheck,
    },
    {
      title: 'Ethics & Integrity',
      description: 'Case studies, ethical theories and administrative values.',
      accent: '#8b5cf6',
      subject: 'Ethics',
      Icon: Brain,
      difficulty: 'Medium',
    },
  ];

  const flashDeck = [
    {
      title: 'GS Answer Framework',
      description: 'Intro, body, conclusion with data points and case studies.',
      subject: '',
      difficulty: '',
    },
    {
      title: 'Directive Keywords',
      description: 'Differentiate analyse, elaborate, comment, justify, etc.',
    },
    {
      title: 'Value Addition Toolkit',
      description: 'Add committees, reports, SDGs, articles and verdicts.',
    },
    {
      title: 'Essay Brainstorm Grid',
      description: 'Think stakeholders, dimensions, quotes, real examples.',
    },
  ];

  const filteredQuestions = useMemo(() => {
    return questions.filter((question) => {
      if (filters.subject && question.subject?.toLowerCase() !== filters.subject.toLowerCase()) {
        return false;
      }
      if (
        filters.subtopic &&
        !question.subtopic?.toLowerCase().includes(filters.subtopic.toLowerCase())
      ) {
        return false;
      }
      if (
        filters.difficulty &&
        question.difficulty?.toLowerCase() !== filters.difficulty.toLowerCase()
      ) {
        return false;
      }
      return true;
    });
  }, [questions, filters]);

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem' }}>Problem Set</h1>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '0.75rem' }}>Explore by Topic</h2>
        <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>
          Jump straight into curated question sets based on high-yield areas.
        </p>
        <div className="subtopics-grid">
          {highlightSubtopics.map((topic) => (
            <div
              key={topic.title}
              className="subtopic-card"
              onClick={() => handleSubtopicSelect(topic.subject, topic.difficulty)}
              role="button"
              tabIndex={0}
              onKeyPress={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  handleSubtopicSelect(topic.subject, topic.difficulty);
                }
              }}
            >
              <div
                className="subtopic-card__icon"
                style={{ backgroundColor: topic.accent }}
                aria-hidden="true"
              >
                <topic.Icon size={26} />
              </div>
              <div className="subtopic-card__title">{topic.title}</div>
              <div className="subtopic-card__desc">{topic.description}</div>
              <span style={{ color: '#ffa116', fontSize: '0.85rem', fontWeight: 600 }}>
                View practice set →
              </span>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '0.75rem' }}>Flash Cards</h2>
        <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>
          Quick revision boosters to recall structures, keywords and examples.
        </p>
        <div className="subtopics-grid">
          {flashDeck.map((card) => (
            <FlashCard
              key={card.title}
              title={card.title}
              description={card.description}
              onClick={() => handleFlashcardSelect(card)}
              cta="Revise"
            />
          ))}
        </div>
      </section>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <Filter size={20} style={{ marginRight: '0.5rem' }} />
          <h3>Filters</h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              Subject {metadataLoading && <span style={{ color: '#ffa116', fontSize: '0.8rem' }}>(Loading...)</span>}
            </label>
            <select
              value={filters.subject}
              onChange={(e) => handleFilterChange('subject', e.target.value)}
              disabled={metadataLoading}
            >
              <option value="">All Subjects</option>
              {subjects.length > 0 ? (
                subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))
              ) : (
                <option value="" disabled>{metadataLoading ? 'Loading subjects...' : 'No subjects available'}</option>
              )}
            </select>
            {!metadataLoading && subjects.length > 0 && (
              <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                {subjects.length} subject{subjects.length !== 1 ? 's' : ''} available
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              Subtopic {metadataLoading && <span style={{ color: '#ffa116', fontSize: '0.8rem' }}>(Loading...)</span>}
            </label>
            <select
              value={filters.subtopic}
              onChange={(e) => handleFilterChange('subtopic', e.target.value)}
              disabled={metadataLoading || (filters.subject && availableSubtopics.length === 0)}
            >
              <option value="">All Subtopics</option>
              {availableSubtopics.length > 0 ? (
                availableSubtopics.map((subtopic) => (
                  <option key={subtopic} value={subtopic}>
                    {subtopic}
                  </option>
                ))
              ) : filters.subject ? (
                <option value="" disabled>No subtopics for {filters.subject}</option>
              ) : (
                <option value="" disabled>{metadataLoading ? 'Loading subtopics...' : 'Select a subject first'}</option>
              )}
            </select>
            {!metadataLoading && filters.subject && availableSubtopics.length > 0 && (
              <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                {availableSubtopics.length} subtopic{availableSubtopics.length !== 1 ? 's' : ''} for {filters.subject}
              </div>
            )}
            {!metadataLoading && !filters.subject && allSubtopics.length > 0 && (
              <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                {allSubtopics.length} total subtopics available
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Difficulty</label>
            <select
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

        </div>

        <button 
          onClick={clearFilters} 
          className="btn btn-secondary" 
          style={{ marginTop: '1rem' }}
        >
          Clear Filters
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="card" style={{ 
          marginBottom: '2rem', 
          backgroundColor: 'rgba(239, 71, 111, 0.1)',
          border: '1px solid #ef476f',
          color: '#ef476f',
          padding: '1rem'
        }}>
          <strong>Error:</strong> {error}
          <button 
            onClick={() => loadQuestions(filters)} 
            className="btn btn-secondary" 
            style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Questions List */}
      {!filters.subtopic && !filters.subject ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#aaa', fontSize: '1.1rem', marginBottom: '1rem' }}>
            👆 Select a <strong>Subject</strong> or <strong>Subtopic</strong> above to view questions
          </p>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>
            Questions will be displayed based on your selection
          </p>
        </div>
      ) : loading ? (
        <div className="loading">Loading questions...</div>
      ) : (
        <div>
          <div style={{ marginBottom: '1rem', color: '#aaa' }}>
            {filteredQuestions.length} problem{filteredQuestions.length !== 1 ? 's' : ''} found
            {questions.length > 0 && ` (out of ${questions.length} total)`}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredQuestions.map((question) => (
              <div key={question._id} className="card" style={{ cursor: 'default' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      {question.difficulty && (
                        <span className={`difficulty difficulty-${question.difficulty.toLowerCase()}`}>
                          {question.difficulty}
                        </span>
                      )}
                      <span style={{ fontSize: '0.9rem', color: '#aaa' }}>
                        {question.subject || 'General Studies'}
                      </span>
                    </div>
                    <h3 style={{ marginBottom: '0.5rem' }}>{question.question}</h3>
                    {question.subtopic && (
                      <div style={{ color: '#ffa116', marginBottom: '0.5rem', fontWeight: 600 }}>
                        {question.subtopic}
                      </div>
                    )}
                    {question.tags && question.tags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                        {question.tags.slice(0, 5).map((tag) => (
                          <span key={tag} style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', backgroundColor: '#2a2a2a', borderRadius: '999px', color: '#bbb' }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {question.options && question.options.length > 0 && (
                      <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {question.options.map((option, idx) => (
                          <div
                            key={idx}
                            style={{
                              backgroundColor: '#161616',
                              border: '1px solid #2a2a2a',
                              borderRadius: '8px',
                              padding: '0.75rem 1rem',
                            }}
                          >
                            <strong style={{ marginRight: '0.5rem', color: '#ffa116' }}>
                              {String.fromCharCode(65 + idx)}.
                            </strong>
                            <span>{option}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {question.explanation && (
                  <div style={{ marginTop: '1.5rem', background: '#141414', borderRadius: '8px', padding: '1rem', border: '1px dashed #2a2a2a' }}>
                    <div style={{ fontWeight: 600, color: '#ffa116', marginBottom: '0.5rem' }}>Explanation</div>
                    <div style={{ color: '#bbb', lineHeight: 1.6 }}>{question.explanation}</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredQuestions.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: '#aaa' }}>No questions found matching your filters</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProblemsPage;
