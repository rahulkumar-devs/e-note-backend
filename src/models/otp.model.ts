import mongoose, { Document } from "mongoose";

export interface IOtp extends Document {
   otp: string;
   email: string;
   expires: Date;
}

const otpSchema = new mongoose.Schema<IOtp>(
   {
      email: { type: String, required: true },
      otp: { type: String, required: true },
      expires: { type: Date, default: () => new Date(Date.now() + 2* 60 * 1000) }, // Current time + 2 minutes
   },
   {
      timestamps: true,
   }
);
// Create TTL index for expires field
otpSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });
const otpModel = mongoose.model<IOtp>("Otp", otpSchema);
export default otpModel;
