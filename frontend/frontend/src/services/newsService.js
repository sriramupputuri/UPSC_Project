import axios from 'axios';

// Use Vite's import.meta.env instead of process.env
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const fetchNews = async () => {
  try {
    const response = await axios.get('/api/news');
    return response.data.news || response.data || [];
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};

export const saveArticle = async (article) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      '/api/news/save',
      { article },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error saving article:', error);
    throw error;
  }
};

export const getSavedArticles = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      '/api/news/saved',
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data.articles || response.data || [];
  } catch (error) {
    console.error('Error fetching saved articles:', error);
    throw error;
  }
};
