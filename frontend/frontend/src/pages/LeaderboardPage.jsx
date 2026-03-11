import React, { useState, useEffect } from 'react';
import { userAPI } from '../utils/api';
import { Trophy, Award, TrendingUp } from 'lucide-react';
import { useAuth } from '../utils/AuthContext';

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const data = await userAPI.getLeaderboard();
      setLeaderboard(data);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return '#ffa116';
    if (rank === 2) return '#c0c0c0';
    if (rank === 3) return '#cd7f32';
    return '#aaa';
  };

  if (loading) {
    return <div className="loading">Loading leaderboard...</div>;
  }

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <Trophy size={64} color="#ffa116" style={{ marginBottom: '1rem' }} />
        <h1>Leaderboard</h1>
        <p style={{ color: '#aaa' }}>Top performers in UPSC preparation</p>
      </div>

      {/* Your Rank */}
      {user && (
        <div className="card" style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '1rem' }}>Your Rank</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffa116' }}>
            {user.rank ? `#${user.rank}` : 'Unranked'}
          </div>
          <div style={{ color: '#aaa', marginTop: '0.5rem' }}>
            Solve more problems to improve your rank!
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>User</th>
              <th>Problems Solved</th>
              <th>Current Streak</th>
              <th>Total Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, idx) => {
              const rank = idx + 1;
              const isCurrentUser = user && entry.username === user.username;
              
              return (
                <tr 
                  key={entry.id}
                  style={{
                    backgroundColor: isCurrentUser ? 'rgba(255, 161, 22, 0.1)' : 'transparent',
                    fontWeight: isCurrentUser ? 'bold' : 'normal'
                  }}
                >
                  <td>
                    <span style={{ 
                      fontSize: rank <= 3 ? '1.5rem' : '1rem',
                      color: getRankColor(rank)
                    }}>
                      {getRankIcon(rank)}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {entry.full_name || entry.username}
                      {isCurrentUser && (
                        <span style={{ fontSize: '0.8rem', color: '#ffa116' }}>(You)</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Award size={16} color="#00b8a3" />
                      {entry.problems_solved}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <TrendingUp size={16} color="#ffa116" />
                      {entry.current_streak} days
                    </div>
                  </td>
                  <td style={{ color: '#ffa116', fontWeight: 'bold' }}>
                    {entry.total_score}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {leaderboard.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa' }}>
            No users on leaderboard yet. Be the first!
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1rem',
        marginTop: '2rem'
      }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffa116' }}>
            {leaderboard.length}
          </div>
          <div style={{ color: '#aaa' }}>Active Users</div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏆</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00b8a3' }}>
            {leaderboard[0]?.total_score || 0}
          </div>
          <div style={{ color: '#aaa' }}>Top Score</div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔥</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef476f' }}>
            {Math.max(...leaderboard.map(u => u.current_streak || 0), 0)}
          </div>
          <div style={{ color: '#aaa' }}>Longest Streak</div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
