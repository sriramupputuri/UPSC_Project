import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { newsAPI } from '../utils/api';
import { ExternalLink, Bookmark, Calendar, Newspaper } from 'lucide-react';

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedArticles, setSavedArticles] = useState([]);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        const data = await newsAPI.getAll({ limit: 20 });
        console.log('News API response:', data); // Debug log
        
        // Handle different response formats
        let newsArray = [];
        if (Array.isArray(data)) {
          newsArray = data;
        } else if (data && Array.isArray(data.news)) {
          newsArray = data.news;
        } else if (data && data.news && typeof data.news === 'object') {
          newsArray = [data.news];
        }
        
        // Normalize the data structure to ensure consistent format
        const normalizedNews = newsArray.map(item => {
          // Handle source field - backend stores as string, frontend expects object
          let sourceObj = { name: 'Unknown' };
          if (typeof item.source === 'string' && item.source) {
            sourceObj = { name: item.source };
          } else if (item.source && typeof item.source === 'object' && item.source.name) {
            sourceObj = { name: item.source.name };
          }
          
          return {
            _id: item._id || item.url, // Use URL as fallback ID
            title: item.title || 'No title',
            description: item.description || item.content || 'No description available',
            url: item.url,
            urlToImage: item.urlToImage || item.image || null,
            publishedAt: item.publishedAt || item.time || new Date().toISOString(),
            source: sourceObj,
            content: item.content || item.description || ''
          };
        }).filter(item => item.url); // Only include items with URLs
        
        console.log(`Loaded ${normalizedNews.length} news articles`); // Debug log
        setNews(normalizedNews);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch news:', err);
        setError('Failed to load news. Please try again later.');
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const loadSavedArticles = async () => {
        try {
          const data = await newsAPI.getSaved();
          setSavedArticles(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error('Failed to fetch saved articles:', err);
        }
      };
      loadSavedArticles();
    }
  }, [isAuthenticated]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      const date = new Date(dateString);
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString(undefined, options);
    } catch (e) {
      return dateString;
    }
  };

  const handleSaveArticle = async (article) => {
    if (!isAuthenticated) {
      alert('Please login to save articles');
      return;
    }

    try {
      await newsAPI.save(article);
      setSavedArticles([...savedArticles, article]);
      alert('Article saved successfully!');
    } catch (err) {
      console.error('Failed to save article:', err);
      alert('Failed to save article. Please try again.');
    }
  };

  const isArticleSaved = (articleUrl) => {
    return savedArticles.some(saved => saved.url === articleUrl);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading news...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2 style={{ color: '#ef476f', marginBottom: '1rem' }}>Error</h2>
          <p style={{ color: '#aaa' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header Section */}
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <Newspaper size={48} color="#ffa116" />
          <h1 style={{ fontSize: '3rem', color: '#ffa116' }}>
            Latest UPSC News & Updates
          </h1>
        </div>
        <p style={{ fontSize: '1.2rem', color: '#aaa' }}>
          Stay updated with the latest news relevant to UPSC preparation
        </p>
      </div>

      {/* News Grid */}
      {news.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Newspaper size={64} color="#ffa116" style={{ margin: '0 auto 1.5rem', display: 'block' }} />
          <h2 style={{ color: '#ffa116', marginBottom: '1rem' }}>No News Articles Yet</h2>
          <p style={{ color: '#aaa', fontSize: '1.2rem', marginBottom: '1rem' }}>
            No news articles available at the moment.
          </p>
          <p style={{ color: '#888', fontSize: '0.95rem' }}>
            To populate news articles, run <code style={{ background: '#2a2a2a', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>npm run update-news</code> in the backend directory.
          </p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          {news.map((item, index) => {
            if (!item || !item.url) {
              return null; // Skip invalid items
            }
            return (
            <div 
              key={item._id || item.url || index}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                border: '1px solid #2a2a2a'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#ffa116';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(255, 161, 22, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#2a2a2a';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* News Image */}
              {(item.urlToImage || item.image) && (
                <div style={{ 
                  width: '100%', 
                  height: '200px', 
                  overflow: 'hidden',
                  borderRadius: '8px 8px 0 0',
                  margin: '-1.5rem -1.5rem 1rem -1.5rem',
                  backgroundColor: '#2a2a2a'
                }}>
                  <img 
                    src={item.urlToImage || item.image} 
                    alt={item.title || 'News image'}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* News Content */}
              <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ 
                  marginBottom: '0.75rem', 
                  fontSize: '1.25rem',
                  lineHeight: '1.4',
                  color: '#ffffff'
                }}>
                  {item.title || 'No title available'}
                </h3>
                
                <p style={{ 
                  color: '#aaa', 
                  marginBottom: '1rem',
                  lineHeight: '1.6',
                  flexGrow: 1,
                  fontSize: '0.95rem'
                }}>
                  {item.description 
                    ? (item.description.length > 150 
                        ? `${item.description.substring(0, 150)}...` 
                        : item.description)
                    : 'No description available'}
                </p>

                {/* Source and Date */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem',
                  marginBottom: '1rem',
                  fontSize: '0.875rem',
                  color: '#888',
                  flexWrap: 'wrap'
                }}>
                  {(item.source?.name || item.source) && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Newspaper size={14} />
                      {item.source?.name || item.source}
                    </span>
                  )}
                  {(item.publishedAt || item.time) && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={14} />
                      {formatDate(item.publishedAt || item.time)}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ 
                  display: 'flex', 
                  gap: '0.75rem',
                  marginTop: 'auto'
                }}>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        textDecoration: 'none',
                        cursor: 'pointer'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={16} />
                      Read More
                    </a>
                  )}
                  
                  {isAuthenticated && (
                    <button
                      className="btn btn-secondary"
                      style={{
                        padding: '0.5rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        opacity: isArticleSaved(item.url) ? 0.6 : 1
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveArticle(item);
                      }}
                      disabled={isArticleSaved(item.url)}
                    >
                      <Bookmark size={16} />
                      {isArticleSaved(item.url) ? 'Saved' : 'Save'}
                    </button>
                  )}
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Info Message */}
      {news.length > 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '2rem', marginTop: '2rem' }}>
          <p style={{ color: '#aaa' }}>
            {news.length} article{news.length !== 1 ? 's' : ''} loaded. 
            {!isAuthenticated && ' Login to save articles for later reading.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default NewsPage;
