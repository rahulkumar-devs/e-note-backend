import { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import createHttpError from "http-errors";
import userModel from "../models/user.model";

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

      }

      res.json({
         success: true,
         data: req.body,
      });
   }
);

export { createUser };
