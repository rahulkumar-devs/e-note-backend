import mongoose, { Document, Schema, Model, ObjectId } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config/config";

export interface IUser extends Document {
_id?:string;
   name: string;
   email: string;
   password: string;
   avatar: string;
   isVerified: boolean;
   role: ("admin" | "user" | "member")[];

   refreshToken: string;

   isComparePassword: (password: string) => boolean;
   generateAccessToken: () => string;
   generateRefreshToken: () => string;
}

const UserSchema = new mongoose.Schema<IUser>(
   {
      
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String },
      isVerified: { type: Boolean, default: false },
      avatar: String,
      role: {
         type: [String],
         default: ["user"],
         enum: ["user", "admin", "mentor"],
      },
      refreshToken: { type: String, default: undefined },
   },
   {
      timestamps: true,
   }
);

UserSchema.pre<IUser>("save", function (next) {
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

UserSchema.methods.generateAccessToken = function () {
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

UserSchema.methods.generateRefreshToken = function () {
   return jwt.sign(
      {
         _id: this._id,
      },
      config.refresh_token_key,
      { expiresIn: config.refresh_token_expiry }
   );
};

const UserModel: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
export default UserModel;
