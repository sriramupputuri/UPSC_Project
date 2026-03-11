import mongoose from 'mongoose';

const ReplySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
}, { _id: true });

const DiscussionSchema = new mongoose.Schema(
  {
    topic: { type: String, index: true },
    userId: { type: String, required: true },
    username: { type: String, required: true },
    text: { type: String, required: true },
    replies: [ReplySchema],
    timestamp: { type: Date, default: Date.now },
    upvotes: { type: Number, default: 0 },
    upvotedBy: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model('Discussion', DiscussionSchema);


