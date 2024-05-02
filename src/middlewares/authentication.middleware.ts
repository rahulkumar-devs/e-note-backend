import { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import createHttpError from "http-errors";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config/config";
import UserModel, { IUser } from "../models/user.model";

declare global {
   namespace Express {
      interface Request {
         user?: IUser;
      }
   }
}

const isAuthenticated = expressAsyncHandler(
   async (req: Request, _, next: NextFunction) => {
      try {
         const tokens =
            req.cookies?.accessToken ||
            req.header("authorization")?.replace("Bearer", "");

         if (!tokens) {
            return next(createHttpError(401, "Unauthorized request"));
         }

         const decodeToken = jwt.verify(
            tokens,
            config.access_token_key
         ) as JwtPayload;

         const user = await UserModel.findById(decodeToken?._id)
       

         if (!user) {
            return next(
               createHttpError(401, "Unauthorized user user not found")
            );
         }

         // Now user contains the user data, set it to req.user
         req.user =user;
         next();
      } catch (error) {
         next(error);
      }
   }
);

export { isAuthenticated };
