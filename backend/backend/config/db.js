import mongoose from 'mongoose';

let isConnected = false;

export default async function connectDB() {
  if (isConnected) {
    return;
  }

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/upsc_progress';

  mongoose.set('strictQuery', true);
  const masked = (() => {
    try {
      const u = new URL(uri);
      if (u.username || u.password) {
        u.username = '***';
        u.password = '***';
      }
      return u.toString();
    } catch (_) {
      return uri.replace(/:\/\/[^@]+@/, '://***:***@');
    }
  })();
  // eslint-disable-next-line no-console
  console.log(`Attempting MongoDB connection using URI: ${masked}`);
  await mongoose.connect(uri, {
    dbName: uri.split('/').pop()?.split('?')[0] || 'upsc_progress',
  });

  isConnected = true;
  // eslint-disable-next-line no-console
  console.log(`Connected to MongoDB at ${uri}`);
}


