import expressAsyncHandler from "express-async-handler";
import { IUser } from "./user.model";
import mongoose, { Model } from "mongoose";



export interface IFile {

}

export interface IBook {
   _id?: string;
   title: string;
   author: IUser;
   gener: string;
   coverImage: string;
   file: string;
   createdAt: Date;
   updatedAt: Date;
}





const bookSchema = new mongoose.Schema<IBook>(
   {
      title: { type: String },
      author: { type: mongoose.Schema.Types.ObjectId, ref:"User",required: true },
      gener: { type: String },
      coverImage: { type: String },
      file: { type: String },
      createdAt: {
         type: Date,
      },
      updatedAt: { type: Date, default: Date.now() },
   },
   { timestamps: true }
);

const bookModel: Model<IBook> = mongoose.model<IBook>("Book", bookSchema);
export default bookModel;
