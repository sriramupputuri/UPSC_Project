import axios from 'axios';
import mongoose from 'mongoose';
import News from '../models/News.js';

// NewsAPI configuration
const NEWS_API_URL = 'https://newsapi.org/v2/everything';

// Configuration object that will be set by the init function
let config = {
  newsApiKey: null,
  mongoUri: null
};

/**
 * Initialize the news updater with configuration
 * @param {Object} options - Configuration options
 * @param {string} options.newsApiKey - NewsAPI key
 * @param {string} [options.mongoUri] - MongoDB connection URI (optional)
 */
const init = (options) => {
  if (!options || !options.newsApiKey) {
    throw new Error('newsApiKey is required');
  }
  
  config.newsApiKey = options.newsApiKey;
  config.mongoUri = options.mongoUri || 'mongodb://localhost:27017/upsc-news';
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (!config.mongoUri) {
      throw new Error('MongoDB URI is not configured');
    }
    await mongoose.connect(config.mongoUri);
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// UPSC-specific keywords for fetching relevant news
const UPSC_KEYWORDS = [
  "India government policy",
  "Indian economy",
  "RBI India",
  "NITI Aayog",
  "Indian Parliament Bill",
  "Supreme Court India judgement",
  "environment India",
  "science technology India",
  "ISRO India",
  "international relations India",
];

// Fetch news from NewsAPI for a specific keyword
const fetchNewsByKeyword = async (keyword) => {
  try {
    if (!config.newsApiKey) {
      throw new Error('NewsAPI key is not configured');
    }
    
    const response = await axios.get(NEWS_API_URL, {
      params: {
        q: keyword,
        apiKey: config.newsApiKey,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 10,
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // Last 7 days
      },
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip,deflate,compress',
      },
      timeout: 10000 // 10 seconds timeout
    });

    return response.data.articles || [];
  } catch (error) {
    console.error(`Error fetching news for keyword "${keyword}":`, error.message);
    return []; // Return empty array on error to continue with other keywords
  }
};

// Fetch news from NewsAPI using all UPSC keywords
const fetchNews = async () => {
  try {
    if (!config.newsApiKey) {
      throw new Error('NewsAPI key is not configured');
    }
    
    console.log('Fetching news from NewsAPI with UPSC keywords...');
    
    const allArticles = [];
    const seenUrls = new Set();
    
    // Fetch news for each keyword
    for (const keyword of UPSC_KEYWORDS) {
      console.log(`Fetching: ${keyword}`);
      const articles = await fetchNewsByKeyword(keyword);
      
      // Add unique articles
      for (const article of articles) {
        const url = article.url;
        if (url && !seenUrls.has(url)) {
          seenUrls.add(url);
          allArticles.push({
            title: article.title,
            description: article.description,
            url: article.url,
            urlToImage: article.urlToImage,
            publishedAt: article.publishedAt,
            source: article.source?.name || 'Unknown',
            content: article.content
          });
        }
      }
      
      // Add delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
    }

    console.log(`Received ${allArticles.length} unique articles`);
    return allArticles;
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      response: {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      },
      config: {
        url: error.config?.url,
        params: error.config?.params
      }
    });
    throw error; // Re-throw to be handled by the caller
  }
};

// Save news to database
const saveNews = async (articles) => {
  try {
    let savedCount = 0;
    let skippedCount = 0;
    
    for (const article of articles) {
      // Skip articles without required fields
      if (!article.url || !article.title) {
        skippedCount++;
        continue;
      }
      
      const existingArticle = await News.findOne({ url: article.url });
      
      if (!existingArticle) {
        try {
          const newsItem = new News({
            title: article.title || 'No title',
            description: article.description || article.title || 'No description available',
            url: article.url,
            urlToImage: article.urlToImage || '',
            publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
            source: article.source || 'Unknown',
            content: article.content || article.description || 'No content available'
          });
          
          await newsItem.save();
          savedCount++;
          console.log(`Saved news: ${article.title?.substring(0, 50)}...`);
        } catch (saveError) {
          console.error(`Error saving article "${article.title}":`, saveError.message);
          skippedCount++;
        }
      } else {
        skippedCount++;
      }
    }
    
    console.log(`News update summary: ${savedCount} new articles saved, ${skippedCount} skipped (duplicates or errors)`);
  } catch (error) {
    console.error('Error saving news:', error.message);
    throw error;
  }
};

// Main function to update news
const updateNews = async () => {
  try {
    console.log('Starting news update...');
    
    if (!config.newsApiKey) {
      throw new Error('NewsAPI key is not configured');
    }
    
    await connectDB();
    
    try {
      const articles = await fetchNews();
      if (articles.length > 0) {
        await saveNews(articles);
        console.log(`Successfully processed ${articles.length} articles`);
      } else {
        console.log('No new articles to process');
      }
      console.log('News update completed successfully');
      return { success: true, message: 'News update completed successfully' };
    } catch (error) {
      console.error('Failed to fetch or process news:', error.message);
      throw error;
    }
  } catch (error) {
    console.error('Fatal error in updateNews:', error.message);
    throw error;
  } finally {
    // Close the MongoDB connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  }
};

// Export the public API
export { 
  init,
  updateNews 
};

// If this module is run directly, initialize with environment variables
if (process.argv[1] && process.argv[1].endsWith('newsUpdater.js')) {
  // This will only run if the file is executed directly, not when imported
  import('dotenv').then(dotenv => {
    dotenv.config();
    
    if (!process.env.NEWS_API_KEY) {
      console.error('Error: NEWS_API_KEY is not defined in the environment variables');
      process.exit(1);
    }
    
    init({
      newsApiKey: process.env.NEWS_API_KEY,
      mongoUri: process.env.MONGODB_URI
    });
    
    updateNews().catch(error => {
      console.error('Failed to update news:', error);
      process.exit(1);
    });
  });
}
