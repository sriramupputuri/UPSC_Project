import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true,
    unique: true
  },
  urlToImage: {
    type: String,
    default: ''
  },
  publishedAt: {
    type: Date,
    required: true
  },
  source: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['National', 'International', 'Economy', 'Environment', 'Science', 'Technology', 'Polity', 'Governance', 'Others'],
    default: 'Others'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for better query performance
newsSchema.index({ title: 'text', description: 'text', content: 'text' });
newsSchema.index({ publishedAt: -1 });
newsSchema.index({ source: 1 });

const News = mongoose.model('News', newsSchema);

export default News;
