import expressAsyncHandler from "express-async-handler";
import { IUser } from "./user.model";
import mongoose, { Model, Types } from "mongoose";

export interface IFile {}

export interface IBook {
   _id?: string;
   title: string;
   author: Types.ObjectId;
   genre: string;
   coverImage: { public_id: string; url: string };
   pdf_file: { public_id: string; url: string }[];
   imageFiles:{ public_id: string; url: string }[];
   descriptions?:string;
   like?: Array<string>;
   dislike?: Array<string>;
   createdAt?: Date;
   updatedAt?: Date;
}

const bookSchema = new mongoose.Schema<IBook>(
   {
      title: { type: String },
      author: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         required: true,
      },
      genre: { type: String },
      coverImage: { public_id: String, url: String },
      pdf_file: [{ public_id: String, url: String }],
      imageFiles: [{ public_id: String, url: String }],
      descriptions:String,
      createdAt: {
         type: Date,
         default: Date.now(),
      },
      updatedAt: { type: Date, default: Date.now() },
   },
   { timestamps: true }
);

const bookModel: Model<IBook> = mongoose.model<IBook>("Book", bookSchema);
export default bookModel;
