import React, { useState, useEffect } from 'react';
import { discussionsAPI } from '../utils/api';
import { MessageSquare, Send, Plus, ThumbsUp, Reply } from 'lucide-react';

const DiscussionsPage = () => {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [newText, setNewText] = useState('');
  const [username, setUsername] = useState(localStorage.getItem('discussionUsername') || '');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [expandedDiscussions, setExpandedDiscussions] = useState({});

  useEffect(() => {
    loadDiscussions();
  }, []);

  const loadDiscussions = async () => {
    try {
      const data = await discussionsAPI.getAll();
      setDiscussions(data);
    } catch (err) {
      console.error('Failed to load discussions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      alert('Please enter your name');
      return;
    }
    
    if (!newText.trim()) {
      alert('Please enter a message');
      return;
    }
    
    try {
      // Save username for future use
      localStorage.setItem('discussionUsername', username);
      
      await discussionsAPI.create({ 
        text: newText,
        username: username.trim(),
        topic: 'general'
      });
      
      setNewText('');
      setShowNewDiscussion(false);
      loadDiscussions();
    } catch (err) {
      console.error('Failed to create discussion:', err);
      alert('Failed to create discussion: ' + (err.response?.data?.error || 'Unknown error'));
    }
  };

  const handleAddReply = async (discussionId) => {
    if (!username.trim()) {
      alert('Please enter your name');
      return;
    }
    
    if (!replyText.trim()) {
      alert('Please enter a reply');
      return;
    }
    
    try {
      localStorage.setItem('discussionUsername', username);
      
      await discussionsAPI.addReply(discussionId, {
        text: replyText,
        username: username.trim()
      });
      
      setReplyText('');
      setReplyingTo(null);
      loadDiscussions();
    } catch (err) {
      console.error('Failed to add reply:', err);
      alert('Failed to add reply: ' + (err.response?.data?.error || 'Unknown error'));
    }
  };

  const handleUpvote = async (discussionId) => {
    try {
      await discussionsAPI.upvote(discussionId, {
        userId: username || 'anonymous'
      });
      loadDiscussions();
    } catch (err) {
      console.error('Failed to upvote:', err);
    }
  };

  const toggleReplies = (discussionId) => {
    setExpandedDiscussions(prev => ({
      ...prev,
      [discussionId]: !prev[discussionId]
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return <div className="loading">Loading discussions...</div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>Discussions</h1>
          <p style={{ color: '#aaa' }}>Connect with fellow aspirants and discuss UPSC topics</p>
        </div>
        <button 
          onClick={() => setShowNewDiscussion(!showNewDiscussion)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={20} />
          New Discussion
        </button>
      </div>

      {/* New Discussion Form */}
      {showNewDiscussion && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Start a New Discussion</h3>
          <form onSubmit={handleCreateDiscussion}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Your Name</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name..."
                required
                style={{ width: '100%', padding: '0.75rem', background: '#161616', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#fff' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Message</label>
              <textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="What would you like to discuss about UPSC preparation?"
                rows={6}
                required
                style={{ width: '100%', padding: '0.75rem', background: '#161616', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#fff', resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary">Post Discussion</button>
              <button 
                type="button" 
                onClick={() => setShowNewDiscussion(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Discussions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {discussions.map((discussion) => (
          <div key={discussion._id} className="card">
            {/* Main Discussion */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ 
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ffa116, #ff6b6b)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '1.2rem'
                  }}>
                    {discussion.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{discussion.username || 'Anonymous'}</div>
                    <div style={{ fontSize: '0.85rem', color: '#aaa' }}>{formatDate(discussion.timestamp || discussion.createdAt)}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleUpvote(discussion._id)}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
                >
                  <ThumbsUp size={16} />
                  {discussion.upvotes || 0}
                </button>
              </div>
              
              <p style={{ marginBottom: '1rem', lineHeight: '1.7', fontSize: '1.05rem' }}>
                {discussion.text}
              </p>
              
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
                <button
                  onClick={() => toggleReplies(discussion._id)}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem' }}
                >
                  <MessageSquare size={16} />
                  {(discussion.replies?.length || 0)} {(discussion.replies?.length || 0) === 1 ? 'Reply' : 'Replies'}
                </button>
                <button
                  onClick={() => setReplyingTo(discussion._id)}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem' }}
                >
                  <Reply size={16} />
                  Reply
                </button>
              </div>
            </div>
            
            {/* Reply Form */}
            {replyingTo === discussion._id && (
              <div style={{ 
                marginTop: '1rem',
                padding: '1rem',
                background: '#161616',
                borderRadius: '8px',
                border: '1px solid #2a2a2a'
              }}>
                <h4 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>Add a Reply</h4>
                <div style={{ marginBottom: '0.75rem' }}>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Your name..."
                    style={{ width: '100%', padding: '0.6rem', background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#fff', marginBottom: '0.5rem' }}
                  />
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your reply..."
                    rows={3}
                    style={{ width: '100%', padding: '0.6rem', background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#fff', resize: 'vertical' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleAddReply(discussion._id)}
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                  >
                    <Send size={14} style={{ marginRight: '0.5rem' }} />
                    Post Reply
                  </button>
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText('');
                    }}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            {/* Replies List */}
            {expandedDiscussions[discussion._id] && discussion.replies && discussion.replies.length > 0 && (
              <div style={{ 
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid #2a2a2a'
              }}>
                <h4 style={{ marginBottom: '1rem', fontSize: '1rem', color: '#aaa' }}>Replies:</h4>
                {discussion.replies.map((reply, idx) => (
                  <div 
                    key={reply._id || idx}
                    style={{ 
                      marginBottom: '1rem',
                      padding: '1rem',
                      background: '#161616',
                      borderRadius: '8px',
                      borderLeft: '3px solid #ffa116'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div style={{ 
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #00b8a3, #06d6a0)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '0.9rem'
                      }}>
                        {reply.username?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{reply.username || 'Anonymous'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#aaa' }}>{formatDate(reply.timestamp)}</div>
                      </div>
                    </div>
                    <p style={{ marginLeft: '2.5rem', lineHeight: '1.6', color: '#ddd' }}>{reply.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {discussions.length === 0 && !showNewDiscussion && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <MessageSquare size={64} color="#aaa" style={{ marginBottom: '1rem', marginLeft: 'auto', marginRight: 'auto' }} />
          <h3 style={{ marginBottom: '1rem' }}>No discussions yet</h3>
          <p style={{ color: '#aaa', marginBottom: '2rem' }}>
            Be the first to start a discussion about UPSC preparation!
          </p>
          <button 
            onClick={() => setShowNewDiscussion(true)}
            className="btn btn-primary"
          >
            Create First Discussion
          </button>
        </div>
      )}
    </div>
  );
};

export default DiscussionsPage;
