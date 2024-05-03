import mongoose, { Document, Schema, Types } from "mongoose";
import { IUser } from "../user.model";
import { IComment } from "./comment.model";

export interface IPost extends Document {
   title: string;
   content: string;
   author: Types.ObjectId;
   categories: string[];
   tags: string[];
   postFile: IPostFiles;
   comments: IComment["_id"][];
   createdAt: Date;
   updatedAt: Date;
   likes: { user_id: Types.ObjectId }[];
   views: number;
   isFeatured: boolean;
   status: "draft" | "published" | "archived";
   excerpt: string;
   urlSlug: string;
   metadata: IMetadata;
   privacy: "public" | "private" | "members-only";
   commentsSettings: ICommentsSettings;
}

export interface IPostFiles {
   postImage: { public_id: string; url: string };
   postImages: { public_id: string; url: string }[];
   postVideos: { public_id: string; url: string }[];
}

export interface IMetadata {
   keywords: string[];
   authorBio: string;
   publicationDate: Date;
}

export interface ICommentsSettings {
   allowComments: { type: Boolean; default: true };
   requireModeration: { type: Boolean; default: false };
}

const PostSchema: Schema = new Schema<IPost>({
   title: { type: String, required: true },
   content: { type: String, required: true },
   author: { type: Schema.Types.ObjectId, ref: "User", required: true },
   categories: [{ type: String }],
   tags: [{ type: String }],
   postFile: {},
   comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
   createdAt: { type: Date, default: Date.now },
   updatedAt: { type: Date, default: Date.now },
   likes: [{ user_id: Types.ObjectId, ref: "User", required: true }],
   views: { type: Number, default: 0 },
   isFeatured: { type: Boolean, default: false },
   status: { type: String, default: "draft" },
   excerpt: { type: String },
   urlSlug: { type: String },
   metadata: {
      keywords: [{ type: String }],
      authorBio: { type: String },
      publicationDate: { type: Date },
   },
   privacy: { type: String, default: "public" },
   commentsSettings: {
      allowComments: { type: Boolean, default: true },
      requireModeration: { type: Boolean, default: false },
   },
});

// Define and export Post model
const postModel = mongoose.model<IPost>("Post", PostSchema);
export default postModel;
