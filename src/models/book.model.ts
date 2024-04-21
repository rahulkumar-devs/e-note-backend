import expressAsyncHandler from "express-async-handler";
import { IUser } from "./user.model";
import mongoose, { Model, Types } from "mongoose";

export interface IFile {}

export interface IBook {
   _id?: string;
   title: string;
   author: Types.ObjectId;
   gener: string;
   coverImage: Array<{ public_id: string; url: string }>;
   pdf_file: Array<{ public_id: string; url: string }>;
   file: Array<{ public_id: string; url: string }>;
   like?: Array<string>;
   dislike: Array<string>;
   createdAt: Date;
   updatedAt: Date;
}

const bookSchema = new mongoose.Schema<IBook>(
   {
      title: { type: String },
      author: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         required: true,
      },
      gener: { type: String },
      coverImage: [{ public_id: String, url: String }],
      pdf_file:[{ public_id: String, url: String }],
      file: [{ public_id: String, url: String }],
      createdAt: {
         type: Date,
      },
      updatedAt: { type: Date },
   },
   { timestamps: true }
);

const bookModel: Model<IBook> = mongoose.model<IBook>("Book", bookSchema);
export default bookModel;
