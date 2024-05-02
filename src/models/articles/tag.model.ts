import mongoose, { Schema, Document } from 'mongoose';

// Define interface for Tag
export interface ITag extends Document {
  name: string;
}

// Define schema for Tag
const TagSchema: Schema = new Schema({
  name: { type: String, required: true }
});

// Define and export Tag model
export default mongoose.model<ITag>('Tag', TagSchema);
