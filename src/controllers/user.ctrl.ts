import { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import createHttpError from "http-errors";
import userModel from "../models/user.model";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import path from "path";

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
            const token = jwt.sign(
               { sub: newUser._id },
               config.jwt_secret_key,
               {
                  expiresIn: "7d",
                  algorithm: "HS256",
               }
            );
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
         const token = jwt.sign(
            { sub: user._id },
            config.jwt_secret_key,
            {
               expiresIn: "7d",
               algorithm: "HS256",
            }
         );

         // Send the access token in the response
         res.status(201).json({
            success: true,
            accessToken: token,
         });

      } catch (error: any) {
         // Handle any other errors
         next(createHttpError(500, error.message || "Internal server error"));
      }
   }
);


export { createUser, loginUser };
