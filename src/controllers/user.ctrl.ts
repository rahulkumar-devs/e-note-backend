import { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import createHttpError from "http-errors";
import userModel, { IUser } from "../models/user.model";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { config } from "../config/config";
import UserModel from "../models/user.model";
import generateOTP, {
   generateVerificationToken,
} from "../utils/otp-generator.utils";
import sendMailer, { IEmailOptions } from "../utils/sendMailer.utils";
import generateTokens from "../utils/generateToken.utils";
import { isValidObjectId } from "mongoose";
import { redis } from "../config/redis.config";

const createUser = expressAsyncHandler(
   async (req: Request, res: Response, next: NextFunction) => {
      const { name, email, password } = req.body;

      // Check if all required fields are present
      if (!name || !email || !password) {
         const err = createHttpError(400, "All fields are required");
         return next(err);
      }

      try {
         // Check if user with given email already exists
         const existingUser = await userModel.findOne({ email });
         if (existingUser) {
            return next(createHttpError(400, "User already exists"));
         } else {
            // Generate OTP for email verification
            const otp = generateOTP();

            // Generate activation token
            const activationToken = jwt.sign(
               { name, email, password },
               config.activate_token_key,
               { expiresIn: "15m" }
            );

            // Prepare email data for OTP verification
            const otpMailOptions: IEmailOptions = {
               email,
               subject: "OTP Verification to Verify Email",
               template: "validMail.ejs",
               data: { user: { name }, otp ,email},
            };

            // Send OTP verification email
            await sendMailer(otpMailOptions);

            // Respond with success message and activation token
            res.status(200).json({
               success: true,
               message: `Check your email ${email} for verification`,
               activationToken,
            });
         }
      } catch (error: any) {
         // Handle any errors
         return next(createHttpError(500, error.message));
      }
   }
);

// User login

const userLogin = expressAsyncHandler(
   async (req: Request, res: Response, next: NextFunction) => {
      const { email, password } = req.body;
      if (!email || !password)
         return next(createHttpError(404, "Invalid Details"));
      try {
         const user = await userModel.findOne({ email });

         if (!user) return next(createHttpError(404, "Invalid email"));
         if (!user.isComparePassword(password))
            return next(createHttpError(404, "Invalid password"));

         const { accessToken, refreshToken } = await generateTokens(user._id);

         await redis.set(user?._id, JSON.stringify(user));

         const options = {
            httpOnly: true,
            secure: true,
         };

         res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({
               success: true,
               user: accessToken,
               refreshToken,
               message: "User loged in successfully",
            });
      } catch (error) {
         next(error);
      }
   }
);

// Logout user

const logoutUser = expressAsyncHandler(
   async (req: Request, res: Response, next: NextFunction) => {
      const id = req.user?._id;
      if (!isValidObjectId(id)) {
         next(createHttpError(400, "not a valid Id"));
      }
      await userModel.findByIdAndUpdate(
         id,
         { $unset: { refreshToken: "" } },
         { new: true }
      );
      const options = {
         httpOnly: true,
         secure: true,
      };

      await redis.del(req.user?._id);

      res.status(200)
         .clearCookie("accessToken", options)
         .clearCookie("refreshToken", options)
         .json({
            success: true,
            message: "Logout successfully",
         });
   }
);

const refreshAccessToken = expressAsyncHandler(
   async (req: Request, res: Response, next: NextFunction) => {
      try {
         const incomingToken =
            req.cookies.refreshToken || req.body.refreshToken;

         if (!incomingToken) {
            return next(createHttpError(401, "Unauthorized user"));
         }

         // Verify the presence of the incoming token before decoding it
         const decodeToken = jwt.verify(
            incomingToken,
            config.refresh_token_key
         ) as JwtPayload;

         if (!decodeToken) {
            return next(createHttpError(401, "Unauthorized user"));
         }

         const user = await userModel.findById(decodeToken?._id);
         if (!user) {
            return next(createHttpError(401, "Invalid refreshToken"));
         }

         if (user?.refreshToken !== incomingToken) {
            return next(
               createHttpError(401, "Refresh Token is Expired or used")
            );
         }

         const options = {
            httpOnly: true,
            secure: true,
         };

         const { accessToken, refreshToken } = await generateTokens(user?._id);
         res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({
               success: true,
               user: accessToken,
               refreshToken,
               message: "Access token refreshed",
            });
      } catch (error) {
         console.error("Error refreshing access token:", error);
         next(error);
      }
   }
);

// Forgot password

const forgotpassword = expressAsyncHandler(
   async (req: Request, res: Response, next: NextFunction) => {
      try {
         const { email } = req.body;
         if (!email) {
            const err = createHttpError(400, "Email is required");
            return next(err);
         }

         // Generate a password reset token
         const resetToken = jwt.sign({ email }, "secret-key", {
            expiresIn: "1h",
         });

         // Store the token in the user document
         await UserModel.findOneAndUpdate(
            { email },
            {
               resetPasswordToken: resetToken,
               resetPasswordExpires: Date.now() + 3600000,
            } // 1 hour in milliseconds
         );

         // Send email with password reset link

         res.status(200).json({
            success: true,
            message: "Password reset instructions sent to your email.",
         });
      } catch (error) {
         next(error);
      }
   }
);

export {
   createUser,
   forgotpassword,
   userLogin,
   logoutUser,
   refreshAccessToken,
};
