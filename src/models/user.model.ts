
import createHttpError from "http-errors";
import mongoose, { Document } from "mongoose";
import bcrypt from "bcryptjs";

enum userRole {
    ADMIN = 'admin',
    GUEST = 'guest',
    
}

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    avatar: object;
    role: userRole;
}

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    avatar: { 
        public_id:String,
        url:String
     },
    role: { type: String, required: true, enum: userRole },
},{
    timestamps:true
});

UserSchema.pre<IUser>('save', function (next) {
    try {
        if (this.password && this.isModified('password')) {
            this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(8));
        } else next();
    } catch (error) {
        const err = createHttpError(500, "internal server error");
        next(err);
    }
});

const userModel = mongoose.model<IUser>('User', UserSchema);
export default userModel;