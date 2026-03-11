import React, { useState, useEffect } from 'react';
import { questionsAPI, userAPI, dailyAPI } from '../utils/api';
import { Calendar, Flame, ChevronLeft, ChevronRight, CalendarDays, Award, Target, CheckCircle, Sparkles, Plus, Wand2, BookOpen, TrendingUp, Clock } from 'lucide-react';

const fallbackDailyProblem = {
  date: new Date().toISOString().split('T')[0],
  question: 'Which of the following initiatives primarily aims at restoring degraded mangrove ecosystems along the Indian coastline?',
  options: [
    'Green Skill Development Programme',
    'Mangrove Initiative for Shoreline Habitats & Tangible Incomes (MISHTI)',
    'National Adaptation Fund for Climate Change',
    'Integrated Coastal Zone Management Project'
  ],
  answer: 'B',
  explanation:
    'MISHTI was announced in Union Budget 2023-24 to take up mangrove plantation along the coastline and on salt pan lands through convergence of MGNREGS and CAMPA Fund, thereby focusing directly on mangrove restoration.',
  difficulty: 'Medium',
  topic: 'Environment',
  subject: 'Environment'
};

const DailyProblemPage = () => {
  const [dailyProblem, setDailyProblem] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [allDailyProblems, setAllDailyProblems] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [completedDates, setCompletedDates] = useState(new Set());
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [badges, setBadges] = useState([]);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [suggestedTopics, setSuggestedTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState([]);

  useEffect(() => {
    loadDailyProblem();
    loadStats();
    loadAllDailyProblems();
    loadCompletedDates();
    loadSuggestedTopics();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadDailyProblemByDate(selectedDate);
    }
  }, [selectedDate]);

  const loadDailyProblem = async () => {
    try {
      console.log('🔄 Loading daily problem...');
      const data = await questionsAPI.getDailyProblem();
      console.log('✅ Daily problem loaded:', data);
      setDailyProblem(data);
    } catch (err) {
      console.error('❌ Failed to load daily problem:', err);
      console.error('Error details:', err.response?.data || err.message);
      console.warn('Using fallback daily problem until API recovers.');
      setDailyProblem((prev) => prev || fallbackDailyProblem);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await userAPI.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadAllDailyProblems = async () => {
    try {
      const data = await dailyAPI.getAll();
      setAllDailyProblems(data);
    } catch (err) {
      console.error('Failed to load all daily problems:', err);
    }
  };

  const loadCompletedDates = () => {
    // Load completed dates from localStorage
    const completed = localStorage.getItem('completedDailyProblems');
    if (completed) {
      setCompletedDates(new Set(JSON.parse(completed)));
    }
    
    // Load streak data
    const streak = localStorage.getItem('dailyProblemStreak');
    if (streak) {
      const streakData = JSON.parse(streak);
      setCurrentStreak(streakData.current || 0);
      setLongestStreak(streakData.longest || 0);
    }
    
    // Load badges
    const userBadges = localStorage.getItem('dailyProblemBadges');
    if (userBadges) {
      setBadges(JSON.parse(userBadges));
    }
  };

  const loadSuggestedTopics = async () => {
    try {
      const response = await fetch('/api/daily/topics/suggested');
      const data = await response.json();
      setSuggestedTopics(data.topics || []);
    } catch (err) {
      console.error('Failed to load suggested topics:', err);
    }
  };

  const generateAIProblem = async () => {
    if (!selectedTopic.trim()) return;
    
    setGeneratingAI(true);
    try {
      const response = await fetch('/api/daily/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: selectedTopic,
          difficulty: 'Medium',
          count: 1
        })
      });

      const data = await response.json();
      
      if (data.success && data.questions.length > 0) {
        setAiGeneratedQuestions(data.questions);
        setDailyProblem(data.questions[0]);
        setSubmitted(false);
        setSelected(null);
        setIsCorrect(null);
        setShowAIGenerator(false);
      } else {
        alert('Failed to generate AI problem. Please try again.');
      }
    } catch (err) {
      console.error('Error generating AI problem:', err);
      alert('Error generating AI problem. Please check your connection.');
    } finally {
      setGeneratingAI(false);
    }
  };

  const markDateAsCompleted = (date) => {
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    const newCompleted = new Set([...completedDates, dateStr]);
    setCompletedDates(newCompleted);
    
    // Save to localStorage
    localStorage.setItem('completedDailyProblems', JSON.stringify([...newCompleted]));
    
    // Update streak only if it's today's problem
    const today = new Date().toISOString().split('T')[0];
    if (dateStr === today) {
      updateStreakWithCompletedDates(newCompleted);
    }
  };

  const updateStreakWithCompletedDates = (completedDatesSet) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Check if today is completed
    if (!completedDatesSet.has(todayStr)) {
      return;
    }
    
    // Calculate current streak
    let streak = 1;
    let checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - 1);
    
    while (completedDatesSet.has(checkDate.toISOString().split('T')[0])) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    const newLongest = Math.max(longestStreak, streak);
    setCurrentStreak(streak);
    setLongestStreak(newLongest);
    
    // Save streak data
    localStorage.setItem('dailyProblemStreak', JSON.stringify({
      current: streak,
      longest: newLongest
    }));
    
    // Check for badges
    checkForBadges(streak);
  };

  const updateStreak = () => {
    updateStreakWithCompletedDates(completedDates);
  };

  const checkForBadges = (streak) => {
    const newBadges = [...badges];
    
    // 50-day streak badge
    if (streak >= 50 && !badges.some(b => b.id === 'streak_50')) {
      newBadges.push({
        id: 'streak_50',
        name: 'Consistency Master',
        description: 'Solved daily problems for 50 consecutive days',
        icon: '🏆',
        earnedDate: new Date().toISOString()
      });
    }
    
    // 30-day streak badge
    if (streak >= 30 && !badges.some(b => b.id === 'streak_30')) {
      newBadges.push({
        id: 'streak_30',
        name: 'Dedicated Learner',
        description: 'Solved daily problems for 30 consecutive days',
        icon: '🎯',
        earnedDate: new Date().toISOString()
      });
    }
    
    // 7-day streak badge
    if (streak >= 7 && !badges.some(b => b.id === 'streak_7')) {
      newBadges.push({
        id: 'streak_7',
        name: 'Week Warrior',
        description: 'Solved daily problems for 7 consecutive days',
        icon: '⭐',
        earnedDate: new Date().toISOString()
      });
    }
    
    if (newBadges.length > badges.length) {
      setBadges(newBadges);
      localStorage.setItem('dailyProblemBadges', JSON.stringify(newBadges));
    }
  };

  const loadDailyProblemByDate = async (date) => {
    setLoading(true);
    setSubmitted(false);
    setSelected(null);
    setIsCorrect(null);
    try {
      console.log('🔄 Loading daily problem for date:', date);
      const data = await dailyAPI.getByDate(date);
      console.log('✅ Daily problem for date loaded:', data);
      setDailyProblem(data);
    } catch (err) {
      console.error('❌ Failed to load daily problem for date:', err);
      console.error('Error details:', err.response?.data || err.message);
      console.warn('Falling back to local daily problem data.');
      setDailyProblem(fallbackDailyProblem);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { daysInMonth, firstDay };
  };

  const hasProblemForDate = (date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return allDailyProblems.some(p => p.date === dateStr);
  };

  const isDateCompleted = (date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return completedDates.has(dateStr);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentMonth(newDate);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleOptionClick = (idx) => {
    setSelected(idx);
    setSubmitted(true);
    
    // Get the selected option letter (A, B, C, D)
    const selectedLetter = String.fromCharCode(65 + idx);
    
    // Check if answer is correct
    const correct = selectedLetter === dailyProblem.answer;
    setIsCorrect(correct);
    
    // Mark this date as completed (regardless of correct/incorrect)
    const problemDate = selectedDate || new Date().toISOString().split('T')[0];
    markDateAsCompleted(problemDate);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '1rem',
          minHeight: '400px',
          justifyContent: 'center'
        }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #2a2a2a', 
            borderTop: '4px solid #ffa116', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite' 
          }}></div>
          <p style={{ color: '#ffa116', fontSize: '1.2rem' }}>Loading daily problem...</p>
        </div>
      </div>
    );
  }

  if (!dailyProblem) {
    return (
      <div className="container">
        <div className="card" style={{ 
          textAlign: 'center', 
          padding: '3rem',
          background: 'linear-gradient(135deg, #1a1a1a, #0f0f0f)',
          border: '1px solid #2a2a2a',
          borderRadius: '16px'
        }}>
          <h2 style={{ color: '#ef476f', marginBottom: '1rem' }}>⚠️ No Problem Available</h2>
          <p style={{ color: '#aaa', marginBottom: '2rem' }}>
            No daily problem available today. This might be due to:
          </p>
          <ul style={{ 
            textAlign: 'left', 
            color: '#bbb', 
            maxWidth: '400px', 
            margin: '0 auto 2rem',
            lineHeight: '1.6'
          }}>
            <li>Backend server connection issue</li>
            <li>Problem generation error</li>
            <li>Data loading failure</li>
          </ul>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              background: 'linear-gradient(135deg, #00b8a3, #00a693)',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            🔄 Retry Loading
          </button>
        </div>
      </div>
    );
  }

  // Calendar rendering
  const renderCalendar = () => {
    const { daysInMonth, firstDay } = getDaysInMonth(currentMonth);
    const days = [];
    const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} style={{ padding: '0.5rem' }}></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const hasProblem = hasProblemForDate(date);
      const isCompleted = isDateCompleted(date);
      const isToday = dateStr === new Date().toISOString().split('T')[0];

      // Enhanced color coding logic with gradients
      let backgroundColor = 'linear-gradient(135deg, #1a1a1a, #161616)';
      let borderColor = '#2a2a2a';
      let textColor = '#555';
      let boxShadow = 'none';
      let transform = 'scale(1)';
      
      if (hasProblem) {
        textColor = '#fff';
        if (isToday) {
          backgroundColor = 'linear-gradient(135deg, #00b8a3, #00a693)';
          borderColor = '#00b8a3';
          boxShadow = '0 4px 15px rgba(0, 184, 163, 0.3)';
          transform = 'scale(1.05)';
        } else if (isCompleted) {
          backgroundColor = 'linear-gradient(135deg, #ef476f, #d63384)';
          borderColor = '#ef476f';
          boxShadow = '0 4px 15px rgba(239, 71, 111, 0.3)';
        } else {
          backgroundColor = 'linear-gradient(135deg, #2a2a2a, #1f1f1f)';
          borderColor = '#444';
          boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
        }
      }

      days.push(
        <button
          key={day}
          onClick={() => {
            if (hasProblem) {
              setSelectedDate(dateStr);
            }
          }}
          disabled={!hasProblem}
          style={{
            padding: '0.75rem',
            borderRadius: '12px',
            border: `2px solid ${borderColor}`,
            background: backgroundColor,
            color: textColor,
            cursor: hasProblem ? 'pointer' : 'not-allowed',
            fontSize: '0.9rem',
            fontWeight: isToday ? 'bold' : 'normal',
            position: 'relative',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: transform,
            boxShadow: boxShadow,
            minHeight: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            if (hasProblem) {
              e.target.style.transform = 'scale(1.1)';
              e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (hasProblem) {
              e.target.style.transform = isToday ? 'scale(1.05)' : 'scale(1)';
              e.target.style.boxShadow = boxShadow;
            }
          }}
        >
          {day}
          {isCompleted && (
            <CheckCircle 
              size={12} 
              style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                color: '#ef476f'
              }}
            />
          )}
          {isToday && !isCompleted && (
            <div style={{
              position: 'absolute',
              bottom: '4px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#00b8a3'
            }}></div>
          )}
        </button>
      );
    }

    return (
      <div className="card" style={{ 
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, #1a1a1a, #0f0f0f)',
        border: '1px solid #2a2a2a',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1.5rem',
          padding: '1rem 0',
          borderBottom: '1px solid #2a2a2a'
        }}>
          <button 
            onClick={() => navigateMonth(-1)} 
            className="btn btn-secondary" 
            style={{ 
              padding: '0.75rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2a2a2a, #1f1f1f)',
              border: '1px solid #444',
              transition: 'all 0.3s ease'
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ 
              margin: 0, 
              background: 'linear-gradient(135deg, #00b8a3, #ffa116)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}>
              {monthName}
            </h3>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.5rem', 
              marginTop: '0.5rem',
              color: '#aaa',
              fontSize: '0.9rem'
            }}>
              <CalendarDays size={16} />
              <span>Daily Problem Calendar</span>
            </div>
          </div>
          <button 
            onClick={() => navigateMonth(1)} 
            className="btn btn-secondary" 
            style={{ 
              padding: '0.75rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2a2a2a, #1f1f1f)',
              border: '1px solid #444',
              transition: 'all 0.3s ease'
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} style={{ textAlign: 'center', fontWeight: 'bold', color: '#aaa', padding: '0.5rem' }}>
              {day}
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
          {days}
        </div>
        <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#aaa', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#00b8a330', border: '1px solid #00b8a3' }}></div>
            <span>Today</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#ef476f30', border: '1px solid #ef476f' }}></div>
            <span>Completed</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#2a2a2a', border: '1px solid #444' }}></div>
            <span>Available</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0 }}>Daily Problem</h1>
            <p style={{ color: '#aaa', marginTop: '0.5rem' }}>
              Solve daily problems to maintain your streak and earn badges!
            </p>
          </div>
          <button
            onClick={async () => {
              try {
                console.log('🧪 Testing API connection...');
                const response = await fetch('/api/daily/test');
                const data = await response.json();
                console.log('✅ API Test Result:', data);
                alert(`API Test: ${data.message}`);
              } catch (err) {
                console.error('❌ API Test Failed:', err);
                alert(`API Test Failed: ${err.message}`);
              }
            }}
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            🧪 Test API
          </button>
        </div>
      </div>

      {/* Main Layout - Calendar on left, Content on right */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: window.innerWidth > 768 ? '350px 1fr' : '1fr', 
        gap: '2rem', 
        alignItems: 'start' 
      }}>
        {/* Left Sidebar - Calendar and Stats */}
        <div>
          {/* AI Generator Section */}
          <div className="card" style={{ 
            marginBottom: '2rem',
            background: 'linear-gradient(135deg, #1a1a1a, #0f0f0f)',
            border: '1px solid #2a2a2a',
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '1rem',
              padding: '1rem 0',
              borderBottom: '1px solid #2a2a2a'
            }}>
              <h3 style={{ 
                margin: 0, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                background: 'linear-gradient(135deg, #ffa116, #ff6b6b)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                <Wand2 size={20} />
                AI Problem Generator
              </h3>
              <button
                onClick={() => setShowAIGenerator(!showAIGenerator)}
                style={{
                  background: showAIGenerator ? 'linear-gradient(135deg, #ef476f, #d63384)' : 'linear-gradient(135deg, #00b8a3, #00a693)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s ease'
                }}
              >
                {showAIGenerator ? 'Close' : <Plus size={16} />}
              </button>
            </div>
            
            {showAIGenerator && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    color: '#aaa',
                    fontSize: '0.9rem'
                  }}>
                    Select or Enter Topic:
                  </label>
                  <input
                    type="text"
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    placeholder="e.g., Constitutional Amendments, Climate Change..."
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #444',
                      background: '#2a2a2a',
                      color: '#fff',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
                
                {suggestedTopics.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem', 
                      color: '#aaa',
                      fontSize: '0.9rem'
                    }}>
                      Suggested Topics:
                    </label>
                    <div style={{ 
                      display: 'grid', 
                      gap: '0.5rem', 
                      maxHeight: '150px', 
                      overflowY: 'auto'
                    }}>
                      {suggestedTopics.slice(0, 8).map((topic, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedTopic(topic)}
                          style={{
                            padding: '0.5rem 0.75rem',
                            borderRadius: '6px',
                            border: selectedTopic === topic ? '1px solid #ffa116' : '1px solid #444',
                            background: selectedTopic === topic ? '#ffa11620' : '#2a2a2a',
                            color: selectedTopic === topic ? '#ffa116' : '#bbb',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            textAlign: 'left',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <button
                  onClick={generateAIProblem}
                  disabled={!selectedTopic.trim() || generatingAI}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: generatingAI 
                      ? 'linear-gradient(135deg, #666, #555)' 
                      : 'linear-gradient(135deg, #00b8a3, #00a693)',
                    color: 'white',
                    cursor: generatingAI || !selectedTopic.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {generatingAI ? (
                    <>
                      <div style={{ 
                        width: '16px', 
                        height: '16px', 
                        border: '2px solid #fff', 
                        borderTop: '2px solid transparent', 
                        borderRadius: '50%', 
                        animation: 'spin 1s linear infinite' 
                      }}></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Generate AI Problem
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Calendar */}
          {renderCalendar()}
          
          {/* Badges Section */}
          {badges.length > 0 && (
            <div className="card" style={{ marginBottom: '1rem' }}>
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={20} color="#ffa116" />
                Badges Earned
              </h3>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {badges.map(badge => (
                  <div key={badge.id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem',
                    padding: '0.75rem',
                    background: '#2a2a2a',
                    borderRadius: '8px',
                    border: '1px solid #ffa116'
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>{badge.icon}</span>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#ffa116' }}>{badge.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#aaa' }}>{badge.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Content - Problem and Stats */}
        <div>
          {/* Streak Stats */}
          <div className="card" style={{ 
            marginBottom: '2rem', 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #1a1a1a, #0f0f0f)',
            border: '1px solid #2a2a2a',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ 
              padding: '1rem 0',
              borderBottom: '1px solid #2a2a2a',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ 
                margin: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.5rem',
                background: 'linear-gradient(135deg, #00b8a3, #ffa116)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '1.5rem'
              }}>
                <Target size={24} color="#ffa116" />
                Your Progress
              </h3>
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: window.innerWidth > 768 ? 'repeat(3, 1fr)' : '1fr',
              gap: '2rem',
              padding: '0 1rem'
            }}>
              <div style={{
                padding: '1.5rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ffa11620, #ffa11610)',
                border: '1px solid #ffa11640',
                transition: 'transform 0.3s ease'
              }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, #ffa116, #ff8c00)',
                  borderRadius: '50%',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  boxShadow: '0 4px 15px rgba(255, 161, 22, 0.3)'
                }}>
                  <Flame size={32} color="#fff" />
                </div>
                <div style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: 'bold', 
                  color: '#ffa116',
                  marginBottom: '0.5rem'
                }}>
                  {currentStreak}
                </div>
                <div style={{ color: '#aaa', fontSize: '0.9rem' }}>Current Streak</div>
              </div>
              <div style={{
                padding: '1.5rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #00b8a320, #00b8a310)',
                border: '1px solid #00b8a340',
                transition: 'transform 0.3s ease'
              }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, #00b8a3, #00a693)',
                  borderRadius: '50%',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  boxShadow: '0 4px 15px rgba(0, 184, 163, 0.3)'
                }}>
                  <TrendingUp size={32} color="#fff" />
                </div>
                <div style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: 'bold', 
                  color: '#00b8a3',
                  marginBottom: '0.5rem'
                }}>
                  {longestStreak}
                </div>
                <div style={{ color: '#aaa', fontSize: '0.9rem' }}>Longest Streak</div>
              </div>
              <div style={{
                padding: '1.5rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ef476f20, #ef476f10)',
                border: '1px solid #ef476f40',
                transition: 'transform 0.3s ease'
              }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, #ef476f, #d63384)',
                  borderRadius: '50%',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  boxShadow: '0 4px 15px rgba(239, 71, 111, 0.3)'
                }}>
                  <CheckCircle size={32} color="#fff" />
                </div>
                <div style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: 'bold', 
                  color: '#ef476f',
                  marginBottom: '0.5rem'
                }}>
                  {completedDates.size}
                </div>
                <div style={{ color: '#aaa', fontSize: '0.9rem' }}>Total Solved</div>
              </div>
            </div>
          </div>

      {/* Daily Problem */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #1a1a1a, #0f0f0f)',
        border: '1px solid #2a2a2a',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <h1 style={{ margin: 0 }}>
              {selectedDate && selectedDate !== new Date().toISOString().split('T')[0] 
                ? `Problem for ${new Date(selectedDate).toLocaleDateString()}` 
                : "Today's Problem"}
            </h1>
            {dailyProblem.difficulty && (
              <span className={`difficulty difficulty-${String(dailyProblem.difficulty).toLowerCase()}`}>
                {dailyProblem.difficulty}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: '#aaa' }}>
            <span>📅 {dailyProblem.date}</span>
          </div>
        </div>

        <div style={{ padding: '1.5rem', backgroundColor: '#2a2a2a', borderRadius: '8px', marginBottom: '2rem', lineHeight: '1.8' }}>
          <p style={{ fontSize: '1.1rem' }}>{dailyProblem.question}</p>
        </div>

        {!submitted ? (
          <div>
            <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem' }}>
              {(dailyProblem.options || []).map((opt, idx) => (
                <div 
                  key={idx} 
                  className="radio-option" 
                  onClick={() => handleOptionClick(idx)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    padding: '0.75rem 1rem', 
                    background: selected === idx ? '#2a2a2a' : '#161616', 
                    border: selected === idx ? '2px solid #ffa116' : '1px solid #2a2a2a', 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <strong style={{ color: '#ffa116' }}>{String.fromCharCode(65 + idx)}.</strong>
                  <span>{opt}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            {/* Show selected answer with feedback */}
            <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {(dailyProblem.options || []).map((opt, idx) => {
                const optionLetter = String.fromCharCode(65 + idx);
                const isSelectedOption = selected === idx;
                const isCorrectOption = optionLetter === dailyProblem.answer;
                
                return (
                  <div 
                    key={idx} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.75rem', 
                      padding: '0.75rem 1rem', 
                      background: isCorrectOption ? 'rgba(0, 184, 163, 0.1)' : (isSelectedOption && !isCorrect ? 'rgba(255, 82, 82, 0.1)' : '#161616'),
                      border: isCorrectOption ? '2px solid #00b8a3' : (isSelectedOption && !isCorrect ? '2px solid #ff5252' : '1px solid #2a2a2a'),
                      borderRadius: '8px'
                    }}
                  >
                    <strong style={{ color: isCorrectOption ? '#00b8a3' : (isSelectedOption && !isCorrect ? '#ff5252' : '#ffa116') }}>
                      {optionLetter}.
                    </strong>
                    <span style={{ color: isCorrectOption || isSelectedOption ? '#fff' : '#bbb' }}>{opt}</span>
                    {isCorrectOption && <span style={{ marginLeft: 'auto', color: '#00b8a3' }}>✓</span>}
                    {isSelectedOption && !isCorrect && <span style={{ marginLeft: 'auto', color: '#ff5252' }}>✗</span>}
                  </div>
                );
              })}
            </div>

            {/* Feedback message */}
            <div style={{ 
              padding: '1.5rem', 
              marginBottom: '1rem',
              backgroundColor: isCorrect ? 'rgba(0, 184, 163, 0.1)' : 'rgba(255, 82, 82, 0.1)',
              border: `1px solid ${isCorrect ? '#00b8a3' : '#ff5252'}`,
              borderRadius: '8px'
            }}>
              <h3 style={{ 
                color: isCorrect ? '#00b8a3' : '#ff5252', 
                marginBottom: '0.75rem',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
              </h3>
              {!isCorrect && (
                <p style={{ color: '#bbb', marginBottom: '0.5rem' }}>
                  The correct answer is <strong style={{ color: '#00b8a3' }}>{dailyProblem.answer}</strong>
                </p>
              )}
            </div>

            {/* Explanation */}
            {dailyProblem.explanation && (
              <div style={{ 
                background: '#141414', 
                borderRadius: '8px', 
                padding: '1.5rem', 
                border: '1px dashed #2a2a2a' 
              }}>
                <div style={{ fontWeight: 600, color: '#ffa116', marginBottom: '0.75rem', fontSize: '1rem' }}>
                  📝 Explanation
                </div>
                <div style={{ color: '#bbb', lineHeight: 1.6 }}>{dailyProblem.explanation}</div>
              </div>
            )}
          </div>
        )}
      </div>
        </div>
      </div>
    </div>
  );
};

export default DailyProblemPage;
