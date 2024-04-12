// Make sure to import mongoose correctly
import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";
import createHttpError from "http-errors";

export interface IUser extends Document {
   name: string;
   email: string;
   password: string;
   avatar: {
      public_id: string;
      url: string;
   };
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
         this.password =  bcrypt.hashSync(
            this.password,
            bcrypt.genSaltSync(10)
         );
      }
      next();
   } catch (error) {
      const err = createHttpError(500, "internal server error");
      next(err);
   }
});


UserSchema.methods.isComparePassword =  async function(){

}

// Make sure to use mongoose.model, not mongoose.Model
const UserModel: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
export default UserModel;
