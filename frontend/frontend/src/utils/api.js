import axios from 'axios';

// Use empty baseURL to leverage Vite proxy, or set to backend URL for direct connection
// Vite proxy in vite.config.js forwards /api/* to http://localhost:5000
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Success: ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Request URL:', error.config?.url);
    } else if (error.request) {
      console.error('No response received - Backend might be down');
      console.error('Request URL:', error.config?.url);
      console.error('Full error:', error);
    } else {
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

export const problemsAPI = {
  list: async (filters = {}) => {
    const search = new URLSearchParams(
      Object.entries(filters).filter(([, value]) => value !== '' && value !== undefined)
    );
    const url = search.toString() ? `/api/problems?${search.toString()}` : '/api/problems';
    const { data } = await api.get(url);
    return data;
  },
};

export const prelimsAPI = {
  fetchAll: async (filters = {}) => {
    const search = new URLSearchParams(
      Object.entries(filters).filter(([, value]) => value !== '' && value !== undefined)
    );
    const url = search.toString() ? `/api/prelims?${search.toString()}` : '/api/prelims';
    const { data } = await api.get(url);
    return data;
  },
  fetchByPaperYear: async (paper, year) => {
    const { data } = await api.get(`/api/prelims/${encodeURIComponent(paper)}/${year}`);
    return data;
  },
};

export const dailyAPI = {
  getToday: async () => {
    const { data } = await api.get('/api/daily');
    return data;
  },
  getAll: async () => {
    const { data } = await api.get('/api/daily/all');
    return data;
  },
  getByDate: async (date) => {
    const { data } = await api.get(`/api/daily/${date}`);
    return data;
  },
};

export const contestsAPI = {
  list: async () => {
    const { data } = await api.get('/api/contests');
    return data;
  },
  start: async (id) => {
    const { data } = await api.get(`/api/contests/start/${id}`);
    return data;
  },
};

export const mockTestsAPI = {
  getByYear: async (year) => {
    // Use the dynamic Gemini-powered endpoint (plural: /mocktests/:year)
    const { data } = await api.get(`/api/mocktests/${year}`);

    // Backend returns: { ok, year, total, questions }
    // where questions is either:
    //   1) ["1. ...", "2. ...", ...]
    //   2) [{ id, question, options: {A,B,C,D}, answer, explanation }, ...]
    const questionsArray = Array.isArray(data.questions) ? data.questions : [];

    let adaptedQuestions;

    if (questionsArray.length > 0 && typeof questionsArray[0] === 'string') {
      // Case 1: simple string questions (no options)
      adaptedQuestions = questionsArray.map((q, idx) => ({
        _id: `${year}_q${idx + 1}`,
        question: q,
        options: [],
        answer: null,
        explanation: '',
        subtopic: null,
        difficulty: null,
      }));
    } else if (questionsArray.length > 0 && typeof questionsArray[0] === 'object') {
      // Case 2: full MCQs from JSON (with options, answer, explanation)
      adaptedQuestions = questionsArray.map((q, idx) => {
        // options may be an object {A: '...', B: '...'}; convert to array
        let optionsArray = [];
        if (q.options && typeof q.options === 'object' && !Array.isArray(q.options)) {
          optionsArray = ['A', 'B', 'C', 'D']
            .filter((key) => q.options[key])
            .map((key) => `${key}. ${q.options[key]}`);
        } else if (Array.isArray(q.options)) {
          optionsArray = q.options;
        }

        return {
          _id: q._id || `${year}_q${idx + 1}`,
          question: q.question || '',
          options: optionsArray,
          answer: q.answer || null,
          explanation: q.explanation || '',
          subtopic: q.subtopic || null,
          difficulty: q.difficulty || null,
        };
      });
    } else {
      adaptedQuestions = [];
    }

    return {
      _id: `pyq_${year}`,
      year: Number(year),
      title: `UPSC Prelims ${year} - Previous Year Questions`,
      description: `Static previous year paper with ${adaptedQuestions.length} questions`,
      durationMinutes: 120,
      totalQuestions: adaptedQuestions.length,
      questions: adaptedQuestions,
    };
  },
  submitResult: async (payload) => {
    const { data } = await api.post('/api/mocktests/submit', payload);
    return data;
  },
};

export const leaderboardAPI = {
  list: async () => {
    const { data } = await api.get('/api/leaderboard');
    return data;
  },
};

export const discussionsAPI = {
  getAll: async (topic) => {
    const url = topic ? `/api/discussions?topic=${topic}` : '/api/discussions';
    const { data } = await api.get(url);
    return data;
  },
  create: async (payload) => {
    const { data } = await api.post('/api/discussions', payload);
    return data;
  },
  addReply: async (discussionId, payload) => {
    const { data } = await api.post(`/api/discussions/${discussionId}/reply`, payload);
    return data;
  },
  upvote: async (discussionId, payload) => {
    const { data } = await api.post(`/api/discussions/${discussionId}/upvote`, payload);
    return data;
  },
};

export const authAPI = {
  login: async (username, password) => {
    try {
      // Try JSON first (simpler and works better with proxy)
      const { data } = await api.post('/api/auth/login', {
        username: username,
        password: password
      });
      return data;
    } catch (err) {
      // If JSON fails, try form-urlencoded as fallback
      console.warn('JSON login failed, trying form-urlencoded:', err.message);
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      const { data } = await api.post('/api/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      return data;
    }
  },
  register: async (payload) => {
    const { data } = await api.post('/api/auth/register', payload);
    return data;
  },
  getCurrentUser: async () => {
    const { data } = await api.get('/api/auth/me');
    return data;
  },
};

export const submissionsAPI = {
  submitAnswer: async (questionId, answer) => {
    const { data } = await api.post('/api/submissions', {
      question_id: questionId,
      answer_text: answer,
    });
    return data;
  },
  getUserSubmissions: async () => {
    const { data } = await api.get('/api/submissions/user');
    return data;
  },
};

export const userAPI = {
  getStats: async () => {
    const { data } = await api.get('/api/users/stats');
    return data;
  },
  getLeaderboard: async () => {
    const { data } = await api.get('/api/users/leaderboard');
    return data;
  },
};

export const progressAPI = {
  getAll: async () => {
    const { data } = await api.get('/api/progress');
    return data;
  },
  getByUser: async (userId) => {
    const { data } = await api.get(`/api/progress/${userId}`);
    return data;
  },
};

export const badgesAPI = {
  getAllBadges: async () => {
    const { data } = await api.get('/api/badges');
    return data;
  },
  getUserBadges: async () => {
    const { data } = await api.get('/api/badges/user');
    return data;
  },
};

export const questionsAPI = {
  getAllQuestions: async (filters = {}) => {
    return problemsAPI.list(filters);
  },
  getDailyProblem: async () => {
    return dailyAPI.getToday();
  },
  getSubjects: async () => {
    const data = await problemsAPI.list();
    return Array.from(new Set(data.map((item) => item.subject).filter(Boolean))).sort();
  },
};

export const newsAPI = {
  getAll: async (filters = {}) => {
    const search = new URLSearchParams(
      Object.entries(filters).filter(([, value]) => value !== '' && value !== undefined)
    );
    const url = search.toString() ? `/api/news?${search.toString()}` : '/api/news';
    const { data } = await api.get(url);
    // Backend returns { ok: true, news: [...], total, page, ... }
    // Return the news array directly
    if (data && data.news && Array.isArray(data.news)) {
      return data.news;
    }
    // Fallback for other response formats
    return Array.isArray(data) ? data : [];
  },
  getById: async (id) => {
    const { data } = await api.get(`/api/news/${id}`);
    return data.news || data;
  },
  save: async (article) => {
    const { data } = await api.post('/api/news/save', { article });
    return data;
  },
  getSaved: async () => {
    const { data } = await api.get('/api/news/saved');
    return data.articles || data || [];
  },
};

mockTestsAPI.generate = async (filters = {}) => {
  const { data } = await api.post('/api/mock-tests', filters);
  return data;
};

export default api;
