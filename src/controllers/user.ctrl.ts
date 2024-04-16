import { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import createHttpError from "http-errors";
import userModel, { IUser } from "../models/user.model";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import UserModel from "../models/user.model";
import { generateVerificationToken } from "../utils/otp-generator.utils";
import sendMailer from "../utils/sendMailer.utils";
import generateTokens from "../utils/generateToken.utils";

const createUser = expressAsyncHandler(
   async (req: Request, res: Response, next: NextFunction) => {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
         const err = createHttpError(400, "All fields are required");
         return next(err);
      }

      const user = await userModel.findOne({ email });

      const verificationLink = `${config.client_url}/verify?id=${user?._id}`;

      // Send verification email
      await sendMailer({
         from: config.smtp_user,
         to: email,
         subject: `User Verification ${email}`,
         html: `
         <p>
         Verify your account 
         <a href="${verificationLink}" style="color: #007bff; text-decoration: none; border-bottom: 1px dotted #007bff;">Verify your account</a>
         </p>
         `,
      });

      if (user) {
         const err = createHttpError(400, `User already exists with ${email}`);
         return next(err);
      } else {
         const newUser = await userModel.create({ name, email, password });

         try {
            const token = newUser.generateAccessToken();
            res.status(201).json({
               success: true,
               accessToken: token,
            });
         } catch (error) {
            next(createHttpError(500, "Error while signing JWT token"));
         }
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
         const resetLink = `${config.client_url}/reset-password/${resetToken}`;
         await sendMailer(
            {
               from: config.smtp_user,
               to: email,
               subject: "Password Reset",
               html: `Please click <a href="${resetLink}">here</a> to reset your password.`,
            },
            "123"
         );

         res.status(200).json({
            success: true,
            message: "Password reset instructions sent to your email.",
         });
      } catch (error) {
         next(error);
      }
   }
);

export { createUser, forgotpassword, userLogin };
