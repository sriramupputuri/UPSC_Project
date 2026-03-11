import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure dotenv to load environment variables from the root .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('Environment variables loaded:');
console.log('NEWS_API_KEY:', process.env.NEWS_API_KEY ? '***' + process.env.NEWS_API_KEY.slice(-4) : 'Not found');
console.log('MONGODB_URI:', process.env.MONGODB_URI || 'Not found');

// Import the news updater functions
import('./utils/newsUpdater.js').then(({ init, updateNews }) => {
  try {
    // Initialize the news updater with configuration
    init({
      newsApiKey: process.env.NEWS_API_KEY,
      mongoUri: process.env.MONGODB_URI
    });

    // Run the news update
    updateNews()
      .then(() => {
        console.log('News update completed');
        process.exit(0);
      })
      .catch(error => {
        console.error('News update failed:', error);
        process.exit(1);
      });
  } catch (error) {
    console.error('Failed to initialize news updater:', error);
    process.exit(1);
  }
}).catch(error => {
  console.error('Failed to load news updater:', error);
  process.exit(1);
});
