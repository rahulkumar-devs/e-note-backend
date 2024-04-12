import { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import createHttpError from "http-errors";
import userModel from "../models/user.model";
import jwt from "jsonwebtoken";
import { config } from "../config/config";

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

// login
const loginUser = expressAsyncHandler(
   async (req: Request, res: Response, next: NextFunction) => {
      res.json("ok")
   }
);
export { createUser, loginUser };
