import { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import createHttpError from "http-errors";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config/config";
import UserModel, { IUser } from "../models/user.model";
import { redis } from "../config/redis.config";

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

         // Retrieve user data by awaiting UserModel.findById()
         // const user = await UserModel.findById(decodeToken?._id).select(
         //    "-refreshToken -password"
         // );

         const userString = await redis.get(JSON.parse(decodeToken?.id));
         const user: IUser = userString ? JSON.parse(userString) : null;

         if (!user) {
            return next(createHttpError(401, "Unauthorized user"));
         }

         // Now user contains the user data, set it to req.user
         req.user = user;
         next();
      } catch (error) {
         next(error);
      }
   }
);

export { isAuthenticated };
