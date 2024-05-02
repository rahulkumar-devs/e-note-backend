import mongoose, { Schema, Document } from 'mongoose';

// Define interface for Category
export interface ICategory extends Document {
  name: string;
  description: string;
}

// Define schema for Category
const CategorySchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String }
});

// Define and export Category model
export default mongoose.model<ICategory>('Category', CategorySchema);
