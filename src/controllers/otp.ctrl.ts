import { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import createHttpError from "http-errors";
import UserModel from "../models/user.model";
import sendMailer, { mailOptType } from "../utils/sendMailer.utils";
import generateOTP from "../utils/otp-generator.utils";
import otpModel from "../models/otp.model";
import { config } from "../config/config";

export const sendOtp = expressAsyncHandler(
   async (req: Request, res: Response, next: NextFunction) => {
      const { email } = req.body;
      if (!email) {
         return next(createHttpError(400, "Email is required"));
      }
      try {
         const user = await UserModel.findOne({ email });
         if (!user) {
            return next(createHttpError(404, "User not found"));
         }

         const otp = generateOTP();
         const opts: mailOptType = {
            from: config.smtp_user as string,
            to: email,
            subject: `OTP Verification for ${email}`,
            html: `
            <p>Your One-Time Password (OTP) is: <strong>${otp}</strong><br/> </p>
            <p><em>Caution: This OTP will expire in <strong>2 minutes</strong>. Please use it before then.</em></p>
        `,
         };

         // Create OTP entry in database
         await otpModel.create({
            email: email,
            otp: otp,
         });

         // Send OTP email
         await sendMailer(opts, otp);

         res.status(200).json({
            success: true,
            message: "OTP sent successfully",
         });
      } catch (error: any) {
         console.error("Error sending OTP:", error);
         next(createHttpError(500, "Error sending OTP"));
      }
   }
);

export const emailVerification = expressAsyncHandler(
   async (req: Request, res: Response, next: NextFunction) => {
      try {
         const { id } = req.params;

         const user = await UserModel.findOneAndUpdate(
            { _id: id },
            { isVerified: true }
         );

         if (!user) {
            return next(createHttpError(404, "Invalid user"));
         }

         res.send("Email verified successfully");
      } catch (error: any) {
         console.error("Error verifying email:", error);
         next(createHttpError(500, "Error verifying email"));
      }
   }
);
