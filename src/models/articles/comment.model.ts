import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '../user.model';
import { IPost } from './blog.model';
// Define interface for Comment
export interface IComment extends Document {
  content: string;
  author: IUser['_id'];
  post: IPost['_id'];
  createdAt: Date;
  updatedAt: Date;
}

// Define schema for Comment
const CommentSchema: Schema = new Schema({
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Define and export Comment model
export default mongoose.model<IComment>('Comment', CommentSchema);
