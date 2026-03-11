import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, Target, BookOpen, CheckCircle, Clock, BarChart3, PieChart } from 'lucide-react';
import { progressAPI } from '../utils/api';

const ProgressPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadFlag, setReloadFlag] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function fetchProgress() {
      try {
        setLoading(true);
        const response = await progressAPI.getAll();
        if (!isMounted) return;
        const fetchedUsers = response?.users || [];
        setUsers(fetchedUsers);
        setSelectedUserId((prev) => prev || fetchedUsers[0]?.userId || null);
        setError('');
      } catch (err) {
        console.error('Progress fetch failed:', err);
        if (isMounted) {
          setError('Unable to load progress data. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProgress();

    return () => {
      isMounted = false;
    };
  }, [reloadFlag]);

  const selectedUser = users.find((user) => user.userId === selectedUserId) || null;

  const defaultStats = {
    totalQuestions: 0,
    solvedQuestions: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalStudyHours: 0,
    averageAccuracy: 0,
    rank: 0,
    badges: 0,
  };

  const stats = { ...defaultStats, ...(selectedUser?.overallStats || {}) };
  const subtopics = selectedUser?.subtopics || [];
  const weeklyProgress = selectedUser?.weeklyProgress || [];
  const weeklyProgressSorted = [...weeklyProgress].sort((a, b) => {
    const aTime = new Date(a?.weekStart || 0).getTime();
    const bTime = new Date(b?.weekStart || 0).getTime();
    return bTime - aTime;
  });
  const recommendations = selectedUser?.recommendations || [];

  const overallProgressRatio =
    stats.totalQuestions > 0 ? stats.solvedQuestions / stats.totalQuestions : 0;
  const overallProgress = (overallProgressRatio * 100).toFixed(1);

  const accuracyValue =
    typeof stats.averageAccuracy === 'number' ? stats.averageAccuracy : 0;
  const accuracyRatio = Math.max(0, Math.min(accuracyValue / 100, 1));
  const circleCircumference = 2 * Math.PI * 70;

  const completedSubtopics = subtopics.filter(
    (s) => (s.total || 0) > 0 && (s.completed || 0) >= (s.total || 0)
  ).length;
  const inProgressSubtopics = subtopics.filter(
    (s) => (s.completed || 0) > 0 && (s.total || 0) > (s.completed || 0)
  ).length;
  const notStartedSubtopics = Math.max(
    subtopics.length - completedSubtopics - inProgressSubtopics,
    0
  );

  const userInitials = selectedUser?.fullName
    ? selectedUser.fullName
        .split(' ')
        .filter(Boolean)
        .map((word) => word[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'UP';

  const hasMultipleUsers = users.length > 1;

  const formatNumber = (value) =>
    typeof value === 'number' ? value.toLocaleString('en-IN') : value || '--';

  const formatDate = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  };

  const formatWeekRange = (week) => {
    if (!week?.weekStart || !week?.weekEnd) return 'Week';
    return `${formatDate(week.weekStart)} - ${formatDate(week.weekEnd)}`;
  };

  const handleRetry = () => setReloadFlag((prev) => prev + 1);
  const latestWeek = weeklyProgressSorted[0];
  const lastSyncedAt = selectedUser?.lastSyncAt || selectedUser?.updatedAt;
  const formattedLastSync = lastSyncedAt ? formatDate(lastSyncedAt) : '—';

  if (loading) {
    return (
      <div className="container">
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#aaa' }}>Loading progress...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#ef476f', marginBottom: '1rem' }}>{error}</p>
          <button
            onClick={handleRetry}
            style={{
              background: '#8b5cf6',
              border: 'none',
              borderRadius: '999px',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
              padding: '0.75rem 1.5rem',
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div className="container">
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#aaa' }}>No progress data available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <TrendingUp size={36} color="#ffa116" />
          Your Progress Dashboard
        </h1>
        <p style={{ color: '#aaa' }}>
          Track your UPSC preparation journey with detailed insights and analytics
        </p>
      </div>

      {/* Overall Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, #00b8a3, #00a693)',
          border: 'none',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff' }}>
            {overallProgress}%
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.9rem' }}>Overall Progress</div>
          <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            {stats.solvedQuestions} / {stats.totalQuestions} Questions
          </div>
        </div>

        <div className="card" style={{ 
          background: 'linear-gradient(135deg, #ffa116, #ff8800)',
          border: 'none',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff' }}>
            {stats.currentStreak}
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.9rem' }}>Day Streak 🔥</div>
          <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            Longest: {stats.longestStreak} days
          </div>
        </div>

        <div className="card" style={{ 
          background: 'linear-gradient(135deg, #ef476f, #d63f5f)',
          border: 'none',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff' }}>
            {stats.averageAccuracy}%
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.9rem' }}>Accuracy</div>
          <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            Average Score
          </div>
        </div>

        <div className="card" style={{ 
          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
          border: 'none',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff' }}>
            #{stats.rank}
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.9rem' }}>Global Rank</div>
          <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            {stats.badges} Badges Earned
          </div>
        </div>
      </div>

      {/* Subtopic Coverage Overview */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <PieChart size={24} color="#ffa116" />
          Subtopic Coverage Overview
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{ 
            padding: '1.5rem', 
            background: 'linear-gradient(135deg, #00b8a320, #00b8a310)',
            border: '2px solid #00b8a3',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00b8a3' }}>
              {completedSubtopics}
            </div>
            <div style={{ color: '#aaa', marginTop: '0.5rem' }}>
              <CheckCircle size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Completed Subtopics
            </div>
          </div>

          <div style={{ 
            padding: '1.5rem', 
            background: 'linear-gradient(135deg, #ffa11620, #ffa11610)',
            border: '2px solid #ffa116',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffa116' }}>
              {inProgressSubtopics}
            </div>
            <div style={{ color: '#aaa', marginTop: '0.5rem' }}>
              <Clock size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              In Progress
            </div>
          </div>

          <div style={{ 
            padding: '1.5rem', 
            background: 'linear-gradient(135deg, #ef476f20, #ef476f10)',
            border: '2px solid #ef476f',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef476f' }}>
              {notStartedSubtopics}
            </div>
            <div style={{ color: '#aaa', marginTop: '0.5rem' }}>
              <Target size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Not Started
            </div>
          </div>
        </div>

        {/* Circular Progress Visualization */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          gap: '3rem',
          flexWrap: 'wrap',
          marginTop: '2rem'
        }}>
          {/* Overall Progress Circle */}
          <div style={{ textAlign: 'center' }}>
            <svg width="180" height="180" viewBox="0 0 180 180">
              <circle
                cx="90"
                cy="90"
                r="70"
                fill="none"
                stroke="#2a2a2a"
                strokeWidth="12"
              />
              <circle
                cx="90"
                cy="90"
                r="70"
                fill="none"
                stroke="#00b8a3"
                strokeWidth="12"
                strokeDasharray={`${2 * Math.PI * 70 * (overallProgress / 100)} ${2 * Math.PI * 70}`}
                strokeDashoffset={2 * Math.PI * 70 * 0.25}
                strokeLinecap="round"
                transform="rotate(-90 90 90)"
              />
              <text
                x="90"
                y="85"
                textAnchor="middle"
                fontSize="32"
                fontWeight="bold"
                fill="#00b8a3"
              >
                {overallProgress}%
              </text>
              <text
                x="90"
                y="105"
                textAnchor="middle"
                fontSize="12"
                fill="#aaa"
              >
                Complete
              </text>
            </svg>
            <div style={{ marginTop: '1rem', color: '#aaa', fontSize: '0.9rem' }}>
              Overall Progress
            </div>
          </div>

          {/* Accuracy Circle */}
          <div style={{ textAlign: 'center' }}>
            <svg width="180" height="180" viewBox="0 0 180 180">
              <circle
                cx="90"
                cy="90"
                r="70"
                fill="none"
                stroke="#2a2a2a"
                strokeWidth="12"
              />
              <circle
                cx="90"
                cy="90"
                r="70"
                fill="none"
                stroke="#ffa116"
                strokeWidth="12"
                strokeDasharray={`${2 * Math.PI * 70 * (stats.averageAccuracy / 100)} ${2 * Math.PI * 70}`}
                strokeDashoffset={2 * Math.PI * 70 * 0.25}
                strokeLinecap="round"
                transform="rotate(-90 90 90)"
              />
              <text
                x="90"
                y="85"
                textAnchor="middle"
                fontSize="32"
                fontWeight="bold"
                fill="#ffa116"
              >
                {stats.averageAccuracy}%
              </text>
              <text
                x="90"
                y="105"
                textAnchor="middle"
                fontSize="12"
                fill="#aaa"
              >
                Accuracy
              </text>
            </svg>
            <div style={{ marginTop: '1rem', color: '#aaa', fontSize: '0.9rem' }}>
              Average Accuracy
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Subtopic Progress */}
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BarChart3 size={24} color="#ffa116" />
          Subtopic-wise Progress
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {subtopics.map((subtopic, idx) => {
            const percentage = ((subtopic.completed / subtopic.total) * 100).toFixed(1);
            const status = subtopic.completed === 0 ? 'Not Started' : 
                          subtopic.completed === subtopic.total ? 'Completed' : 'In Progress';
            
            return (
              <div key={idx} style={{ 
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #1a1a1a, #0f0f0f)',
                borderRadius: '12px',
                border: `1px solid ${subtopic.color}40`
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: subtopic.color
                    }}></div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{subtopic.name}</h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <span style={{ 
                      color: subtopic.completed === 0 ? '#ef476f' : 
                             subtopic.completed === subtopic.total ? '#00b8a3' : '#ffa116',
                      fontSize: '0.9rem',
                      fontWeight: 'bold'
                    }}>
                      {status}
                    </span>
                    <span style={{ color: '#aaa', fontSize: '0.9rem' }}>
                      {subtopic.completed} / {subtopic.total} questions
                    </span>
                    <span style={{ 
                      color: subtopic.color, 
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      minWidth: '60px',
                      textAlign: 'right'
                    }}>
                      {percentage}%
                    </span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div style={{ 
                  width: '100%', 
                  height: '12px', 
                  background: '#2a2a2a', 
                  borderRadius: '6px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <div style={{ 
                    width: `${percentage}%`, 
                    height: '100%', 
                    background: `linear-gradient(90deg, ${subtopic.color}, ${subtopic.color}dd)`,
                    borderRadius: '6px',
                    transition: 'width 0.5s ease',
                    boxShadow: `0 0 10px ${subtopic.color}60`
                  }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      <div className="card" style={{ marginTop: '2rem', background: 'linear-gradient(135deg, #8b5cf620, #8b5cf610)', border: '2px solid #8b5cf6' }}>
        <h3 style={{ marginBottom: '1rem', color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Award size={24} />
          Recommendations
        </h3>
        <ul style={{ color: '#ccc', lineHeight: '2', paddingLeft: '1.5rem' }}>
          <li>Focus on <strong style={{ color: '#ef476f' }}>Art & Culture</strong> - Not started yet (100 questions pending)</li>
          <li>Complete <strong style={{ color: '#ffa116' }}>Indian Economy</strong> - 45 questions remaining</li>
          <li>Maintain your streak! You're on a <strong style={{ color: '#00b8a3' }}>{stats.currentStreak}-day streak</strong> 🔥</li>
          <li>Your accuracy is <strong style={{ color: '#ffa116' }}>{stats.averageAccuracy}%</strong> - Aim for 80%+ for better results</li>
        </ul>
      </div>
    </div>
  );
};

export default ProgressPage;
