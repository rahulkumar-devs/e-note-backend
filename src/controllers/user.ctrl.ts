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
               { name, email, password, otp },
               config.activate_token_key,
               { expiresIn: "15m" }
            );

            // Prepare email data for OTP verification
            const otpMailOptions: IEmailOptions = {
               email,
               subject: "OTP Verification to Verify Email",
               template: "validMail.ejs",
               data: { user: { name }, otp, email },
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

const activateUser = expressAsyncHandler(
   async (req: Request, res: Response, next: NextFunction) => {
      try {
         const { activationToken, activationOTP } = req.body;

         const decode = jwt.verify(
            activationToken as string,
            config.activate_token_key
         ) as JwtPayload;
         const { name, email, password } = decode;

         if (activationOTP !== decode.otp) {
            return next(createHttpError(400, "this Otp does'nt matched"));
         }

         const user = await userModel.create({
            name,
            email,
            password,
            isVerified: true,
         });
         if (!user) {
            return next(createHttpError(500, "user not created"));
         }

         res.status(200).json({
            success: true,
            message: "user created successfully",
            user,
         });
      } catch (error: any) {
         return next(error.message);
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

         const user = await userModel.findOne({ email });
         if (!user) {
            const err = createHttpError(404, "Email not found");
            return next(err);
         }

         // Generate OTP for email verification
         const otp = generateOTP();
         // Prepare email data for OTP verification

         // Generate a password reset token
         const resetToken = jwt.sign({ email, otp }, "secret-key", {
            expiresIn: 1000 * 50,
         });
         const otpMailOptions: IEmailOptions = {
            email,
            subject: "OTP Verification to reset password",
            template: "resetPass.ejs",
            data: { user: { name: user?.name }, otp, email },
         };

         // Send OTP verification email
         await sendMailer(otpMailOptions);
         res.status(200).json({
            success: true,
            message: "Password reset instructions sent to your email.",
            resetToken,
         });
      } catch (error: any) {
         next(error.message);
      }
   }
);

// reset password verification and reset password

interface IResetpass {
   resetToken: string;
   otp: string;
}

const verifyResetPassword = expressAsyncHandler(
   async (req: Request, res: Response, next: NextFunction) => {
      try {
         const { resetToken, otp } = req.body as IResetpass;

         const decodeToken = jwt.verify(resetToken, "secret-key") as JwtPayload;
         if (!decodeToken) {
            return next(createHttpError(400, "invalid Token"));
         }

         if (otp !== decodeToken.otp) {
            return next(createHttpError(400, "invalid Otp"));
         }
         res.status(200).json({
            success: true,
            message: " Otp successfully verified",
         });
      } catch (error: any) {
         next(error.message);
      }
   }
);

interface IResetBodyPass {
   password: string;
   confirmPassword: string;
}
const createResetpass = expressAsyncHandler(
   async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      console.log(id);
      const { password, confirmPassword } = req.body as IResetBodyPass;
      try {
         if (password !== confirmPassword) {
            return next(createHttpError(400, "Password not matched"));
         }

         const user = await userModel.findOne({ _id: id });

         if (!user) {
            return next(createHttpError(400, "password not updated"));
         }

         user.password = password;
         await user.save();
         res.status(200).json({
            success: true,
            message: "Password update successfully",
         });
      } catch (error: any) {
         next(error.message);
      }
   }
);

export {
   createUser,
   userLogin,
   logoutUser,
   refreshAccessToken,
   activateUser,
   forgotpassword,
   verifyResetPassword,
   createResetpass,
};
