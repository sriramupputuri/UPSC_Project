import News from '../models/News.js';

// Get all news articles
export async function getNews(req, res) {
  try {
    const { category, limit = 20, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { isActive: true };
    if (category) {
      query.category = category;
    }

    const news = await News.find(query)
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await News.countDocuments(query);

    return res.json({
      ok: true,
      news,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get news error:', error);
    return res.status(500).json({
      ok: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// Get single news article by ID
export async function getNewsById(req, res) {
  try {
    const { id } = req.params;
    const news = await News.findById(id);

    if (!news || !news.isActive) {
      return res.status(404).json({
        ok: false,
        error: 'Not Found',
        message: 'News article not found'
      });
    }

    return res.json({
      ok: true,
      news
    });
  } catch (error) {
    console.error('Get news by ID error:', error);
    return res.status(500).json({
      ok: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// Save article for user (requires authentication)
export async function saveArticle(req, res) {
  try {
    // Get user from token (you'll need to add auth middleware)
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.split(' ')[1] 
      : null;

    if (!token) {
      return res.status(401).json({
        ok: false,
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    // For now, just return success
    // In future, you can create a SavedArticle model to store user's saved articles
    return res.json({
      ok: true,
      message: 'Article saved successfully'
    });
  } catch (error) {
    console.error('Save article error:', error);
    return res.status(500).json({
      ok: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// Get saved articles for user
export async function getSavedArticles(req, res) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.split(' ')[1] 
      : null;

    if (!token) {
      return res.status(401).json({
        ok: false,
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    // For now, return empty array
    // In future, fetch from SavedArticle model
    return res.json({
      ok: true,
      articles: []
    });
  } catch (error) {
    console.error('Get saved articles error:', error);
    return res.status(500).json({
      ok: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

