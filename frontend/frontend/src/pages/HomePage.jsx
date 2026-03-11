import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { userAPI } from '../utils/api';
import { Trophy, Calendar, BookOpen, Target, MessageSquare, Users, FileText } from 'lucide-react';

const HomePage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activeCard, setActiveCard] = useState(null);

  useEffect(() => {
    if (user) {
      userAPI.getStats()
        .then(data => setStats(data))
        .catch(err => console.error('Failed to load stats:', err));
    }
  }, [user]);

  const features = [
    {
      title: 'Daily Problem',
      description: 'Solve today\'s challenge and maintain your streak',
      backDescription: 'AI-powered questions with detailed explanations',
      icon: <Calendar size={48} />,
      link: '/daily',
      color: '#00b8a3',
      gradient: 'linear-gradient(135deg, #00b8a3, #00a693)'
    },
    {
      title: 'Prelims',
      description: 'Access UPSC Prelims previous year papers',
      backDescription: 'Year-wise papers with comprehensive solutions',
      icon: <FileText size={48} />,
      link: '/prelims',
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
    },
    {
      title: 'Problems',
      description: 'Browse and solve from our question bank',
      backDescription: 'Thousands of questions across all topics',
      icon: <BookOpen size={48} />,
      link: '/problems',
      color: '#ffa116',
      gradient: 'linear-gradient(135deg, #ffa116, #ff8800)'
    },
    {
      title: 'Mock Tests',
      description: 'Take timed mock tests to practice',
      backDescription: '100 questions in 120 minutes - Real exam experience',
      icon: <Target size={48} />,
      link: '/mock-tests',
      color: '#ef476f',
      gradient: 'linear-gradient(135deg, #ef476f, #d63f5f)'
    },
    {
      title: 'Contests',
      description: 'Compete with others in live contests',
      backDescription: 'AI-generated questions covering all UPSC topics',
      icon: <Trophy size={48} />,
      link: '/contests',
      color: '#06d6a0',
      gradient: 'linear-gradient(135deg, #06d6a0, #05b88a)'
    },
    {
      title: 'Discussions',
      description: 'Engage with the community',
      backDescription: 'Ask questions, share knowledge, help others',
      icon: <MessageSquare size={48} />,
      link: '/discussions',
      color: '#118ab2',
      gradient: 'linear-gradient(135deg, #118ab2, #0e7a9f)'
    },
    {
      title: 'Leaderboard',
      description: 'See top performers and your rank',
      backDescription: 'Track your progress and compete globally',
      icon: <Users size={48} />,
      link: '/leaderboard',
      color: '#073b4c',
      gradient: 'linear-gradient(135deg, #073b4c, #052d3a)'
    }
  ];

  return (
    <div className="container">
      {/* Welcome Section */}
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#ffa116' }}>
          Welcome to UPSC Prep Platform
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#aaa' }}>
          Master UPSC preparation with LeetCode-style practice
        </p>
      </div>

      {/* User Stats (if logged in) */}
      {user && stats && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Your Progress</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffa116' }}>
                {stats.current_streak}
              </div>
              <div style={{ color: '#aaa' }}>Day Streak 🔥</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00b8a3' }}>
                {stats.problems_solved}
              </div>
              <div style={{ color: '#aaa' }}>Problems Solved</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef476f' }}>
                #{stats.rank}
              </div>
              <div style={{ color: '#aaa' }}>Global Rank</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#118ab2' }}>
                {stats.total_score}
              </div>
              <div style={{ color: '#aaa' }}>Total Score</div>
            </div>
          </div>
        </div>
      )}

      {/* Features Grid with 3D Rotation */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '2rem',
        marginBottom: '3rem'
      }}>
        {features.map((feature, idx) => (
          <Link 
            key={idx} 
            to={feature.link} 
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div 
              className="card card-3d" 
              style={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer',
                border: activeCard === idx ? `2px solid ${feature.color}` : '2px solid transparent',
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                boxShadow: activeCard === idx ? `0 0 20px ${feature.color}60, 0 0 40px ${feature.color}30, inset 0 0 20px ${feature.color}10` : 'none',
                background: activeCard === idx 
                  ? `linear-gradient(135deg, ${feature.color}08, #0f0f0f)` 
                  : 'linear-gradient(135deg, #1a1a1a, #0f0f0f)'
              }}
              onClick={() => setActiveCard(activeCard === idx ? null : idx)}
              onMouseEnter={(e) => {
                if (activeCard !== idx) {
                  e.currentTarget.style.boxShadow = `0 8px 24px ${feature.color}20`;
                }
              }}
              onMouseLeave={(e) => {
                if (activeCard !== idx) {
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <div style={{ 
                marginBottom: '1rem', 
                color: feature.color,
                display: 'flex',
                justifyContent: 'center'
              }}>
                {feature.icon}
              </div>
              <h3 style={{ marginBottom: '0.5rem', textAlign: 'center' }}>
                {feature.title}
              </h3>
              <p style={{ color: '#aaa', textAlign: 'center', flexGrow: 1 }}>
                {feature.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Call to Action */}
      {!user && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Ready to Start Your UPSC Journey?</h2>
          <p style={{ color: '#aaa', marginBottom: '2rem' }}>
            Join thousands of aspirants preparing for UPSC with our comprehensive platform
          </p>
          <Link to="/login">
            <button className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.2rem' }}>
              Get Started
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default HomePage;
