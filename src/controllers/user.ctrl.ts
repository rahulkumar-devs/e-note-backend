import { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import createHttpError from "http-errors";
import userModel, { IUser } from "../models/user.model";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import path from "path";
import generateAccessAndRefreshToken from "../utils/generate.utils.tokens";
import UserModel from "../models/user.model";

const createUser = expressAsyncHandler(
   async (req: Request, res: Response, next: NextFunction) => {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
         const err = createHttpError(400, "All fields are required");
         return next(err);
      }

      const user = await userModel.findOne({ email });
      if (user) {
         const err = createHttpError(400, `user Already exist with ${email}`);
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
            next(createHttpError(500, "Error while jwt sign token"));
         }
      }
   }
);


const loginUser = expressAsyncHandler(
   async (req: Request, res: Response, next: NextFunction) => {
      const { email, password } = req.body;
      try {
         // Check if email and password are not provided
         if (!email || !password) {
            return next(createHttpError(400, "All fields are required"));
         }

         // Check if the user exists in the database
         const user = await userModel.findOne({ email });

         if (!user) {
            return next(createHttpError(400, `Email ${email} not found`));
         }

         // Check if the entered password matches the hashed password stored in the database
         if (!user.isComparePassword(password)) {
            return next(createHttpError(400, "Password does not match"));
         }

         // Generate a new access token
         const { accessToken, refreshToken } =
            await generateAccessAndRefreshToken(user._id);

         const loggedUser = await UserModel.findById(user._id).select(
            "-password -refreshToken"
         );

         // set to cookies
         const cookie_options = {
            httpOnly: true,
            secure: true,
         };

         // req.loggedUser = loggedUser;
         // Send the access token in the response
         res.status(201)
            .cookie("accessToken", accessToken, cookie_options)
            .cookie("refreshToken", refreshToken, cookie_options)
            .json({
               success: true,
               message: "user loggedIn ",
               user: {
                  loggedUser,
                  accessToken,
                  refreshToken,
               },
            });



      } catch (error: any) {
         // Handle any other errors
         next(createHttpError(500, error.message || "Internal server error"));
      }
   }
);
// todo LOGOUT user

const logOutUser = expressAsyncHandler(
   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      if (!req.user) {
         return next(createHttpError(401, "User not logged in"));
      }

    const id =  req.user?._id;
      try {
         await userModel.findByIdAndUpdate(
            id,
            {
               $set: { refreshToken: undefined },
            },
            { new: true }
         );
         const cookie_options = {
            httpOnly: true,
            secure: true,
         };

         res.status(200)
            .clearCookie("accessToken", cookie_options)
            .clearCookie("refreshToken", cookie_options)
            .json({ success: true, message: "succcessfully logout" });

         return Promise.resolve();
      } catch (error) {
         next(createHttpError(500, "Unable to logout"));
      }
   }
);
export { createUser, loginUser, logOutUser };
