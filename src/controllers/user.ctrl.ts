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

/**
 * Renders the login page.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 */
const loginUser = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
   try {
       // Render the login page using EJS template
       res.render(path.join(__dirname, 'login.ejs'));
   } catch (err) {
       // Forward any errors to the error handling middleware
       next(err);
   }
});
export { createUser, loginUser };
