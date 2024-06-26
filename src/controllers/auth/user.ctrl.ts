import { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import createHttpError from "http-errors";
import userModel, { IUser } from "../../models/user.model";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { config } from "../../config/config";
import UserModel from "../../models/user.model";
import generateOTP, {
   generateVerificationToken,
} from "../../utils/otp-generator.utils";
import sendMailer, { IEmailOptions } from "../../utils/sendMailer.utils";
import generateTokens from "../../utils/generateToken.utils";
import { isValidObjectId } from "mongoose";

const userRegister = expressAsyncHandler(
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
               message: `Check your email ${email} test-${otp}  for verification `,
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
            return next(createHttpError(400, "otp not matched"));
         }


         const user = await userModel.create({
            name,
            email,
            password,
            isVerified: true,
         });

         console.log(user)
         if (!user) {
            return next(createHttpError(500, "user not created"));
         }

         res.status(200).json({
            success: true,
            message: "user created successfully",
            user,
         });
      } catch (error: any) {
         return next(createHttpError(500, error.message));
      }
   }
);

// <== Update user
const updateUser = expressAsyncHandler(
   async (req: Request, res: Response, next: NextFunction) => {
      try {
         const id = req.params.id;
         const { name, avatar } = req.body;

         if (!isValidObjectId(id)) {
            next(createHttpError("Not a valid Id"));
         }

         const user = await userModel.findByIdAndUpdate(id, { name, avatar });
         if (!user) {
            next(createHttpError("User not found"));
         }

         res.status(200).json({
            success: true,
            message: "Profile Updated",
         });
      } catch (error: any) {
         next(createHttpError(500, error.message));
      }
   }
);

// User login 
// console.log()

const userLogin = expressAsyncHandler(
   async (req: Request, res: Response, next: NextFunction) => {
      const { email, password } = req.body;
      if (!email || !password)
         return next(createHttpError(404, "Invalid Details"));
      try {
         let user = await userModel.findOne({ email });

         if (!user) return next(createHttpError(400, "Invalid email"));
         if (!user.isComparePassword(password))
            return next(createHttpError(400, "Invalid password"));

         const { accessToken, refreshToken } = await generateTokens(user._id);

         const newuser = await userModel.findOne({ email }).select("-password -refreshToken")

         const options = {
            httpOnly: true,
            secure: true,

         };

         res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({
               success: true,
               accessToken,
               refreshToken,
               user: newuser,
               message: "User loged in successfully",
            });
      } catch (error: any) {
         next(createHttpError(500, error.message))
      }
   }
);

// Logout user

const logoutUser = expressAsyncHandler(
   async (req: Request, res: Response, next: NextFunction) => {
      try {
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

         // await redis.del(req.user?._id);

         res.status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json({
               success: true,
               message: "Logout successfully",
            });

      } catch (error: any) {
         next(createHttpError(500, error.message))
      }
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
            return next(createHttpError(403, "forbidden"));
         }

         if (user?.refreshToken !== incomingToken) {
            return next(
               createHttpError(403, "Refresh Token is Expired or used")
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
               accessToken,
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

// get all user list
// For admin
const getAlluser = expressAsyncHandler(
   async (req: Request, res: Response, next: NextFunction) => {

      try {
         const page = parseInt(req.query.page as string) || 1;
         const limit = parseInt(req.query.page as string) || 10;

         const skipIndex = (page - 1) * limit;



         const users = await userModel.find().skip(skipIndex).limit(limit).select("-password -refreshToken");


         // .populate("blogs","title ");

         res.status(200).json({
            success: true,
            message: "users successfully retrieved",
            page: page,
            limit: limit,
            totalBooks: users.length, // Total number of books on this page
            totalPages: Math.ceil(users.length / limit), // Total number of pages
            users,
         });
      } catch (error: any) {

         next(createHttpError(500, `${error.message}===>`));
      }
   }
);



const deleteUser = expressAsyncHandler(
   async (req: Request, res: Response, next: NextFunction) => {
      try {
         const { id } = req.params;

         await userModel.findByIdAndDelete({ _id: id })

         res.status(200).json({
            success: true,
            message: "user deleted",
         });
      } catch (error: any) {
         next(createHttpError(500, error.message))
      }
   }
)

const getUserUploadedBook =  expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
   try {
      const { userId } = req.params;

      // Use findById to retrieve a single user document by ID
      const user = await UserModel.findById(userId).populate("uploadedBooks").exec();

      if (!user) {
         return next(createHttpError(404, 'User not found'));
      }

      // Assert the type of 'user' to IUser
      const typedUser = user as IUser;

      // At this point, TypeScript knows that 'typedUser' is of type IUser
      // We can safely access properties like 'uploadedBooks'
      res.status(200).json({
         success: true,
         message: 'User uploaded books',
         uploadedBooks: typedUser.uploadedBooks, // This should work without TypeScript errors
      });
   } catch (error: any) {
      next(createHttpError(500, error.message));
   }
});

export {
   userRegister,
   userLogin,
   logoutUser,
   refreshAccessToken,
   activateUser,
   forgotpassword,
   verifyResetPassword,
   createResetpass,
   updateUser,
   getAlluser,
   deleteUser,
   getUserUploadedBook
};
