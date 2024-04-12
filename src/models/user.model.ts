// Make sure to import mongoose correctly
import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import { config } from "../config/config";

export interface IUser extends Document {
   name: string;
   email: string;
   password: string;
   avatar: {
      public_id: string;
      url: string;
   };
   isComparePassword(password: string): boolean;
   generateAccess(password: string): boolean;
}

const UserSchema = new mongoose.Schema(
   {
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String },
      avatar: {
         public_id: { type: String },
         url: { type: String },
      },
   },
   {
      timestamps: true,
   }
);

UserSchema.pre<IUser>("save", async function (next) {
   try {
      if (this.password && this.isModified("password")) {
         this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(10));
      }
      next();
   } catch (error: any) {
      console.error("Error occurred during password hashing:", error);

      next(error);
   }
});

UserSchema.methods.isComparePassword = function (password: string): boolean {
   const isMatched = bcrypt.compareSync(password, this.password);
   return isMatched;
};

UserSchema.methods.generateAccessToken = async function () {
   return jwt.sign(
      {
         _id: this._id,
         email: this.email,
         name: this.name,
      },
      config.access_token_key,
      { expiresIn: config.access_token_expiry }
   );
};
UserSchema.methods.generateRefreshToken = async function () {
   return jwt.sign(
      {
         _id: this._id,
      },
      config.refresh_token_key,
      { expiresIn: config.refresh_token_expiry }
   );
};

// Make sure to use mongoose.model, not mongoose.Model
const UserModel: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
export default UserModel;
