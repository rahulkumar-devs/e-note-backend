import mongoose, { Model, Schema } from "mongoose";

interface ICategory {
   name: string;
   description?: string;
   books: mongoose.Types.ObjectId[];
}

const CategorySchema = new mongoose.Schema<ICategory>(
   {
      name: { type: String, required: true, unique: true },
      description: { type: String },
      books: [{ type: Schema.Types.ObjectId, ref: "Book" }],
   },
   { timestamps: true }
);
const CategoryModel: Model<ICategory> = mongoose.model<ICategory>(
   "Category",
   CategorySchema
);
export default CategoryModel;
