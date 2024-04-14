import { Request, Response, NextFunction } from "express";
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

      interface SessionData {
        isLoggedIn?: IUser; // Define the property within SessionData
     }

   }
}

export const isAuthenticate = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   let token: string | undefined;

   token =
      req.cookies.accessToken ||
      req.header("Authorization")?.replace("Bearer", "");

   if (!token) {
      return next(createHttpError(401, "Unauthorized user"));
   }

   try {
      // Verify the token
      const decodedToken = jwt.verify(token, config.access_token_key) as {
         _id: string;
      };

      if (!decodedToken) {
         return next(createHttpError(401, "Invalid token"));
      }

      // Fetch the user from the database
      const user = await UserModel.findById(decodedToken._id).select(
         "-password -refreshToken"
      );

      if (!user) {
         return next(createHttpError(404, "User not found"));
      }

      // Set the user on the request object
      req.user = user;
      (req.session as Express.SessionData).isLoggedIn = user;

      next();
   } catch (error) {
      console.error("Error verifying JWT:", error);
      next(createHttpError(500, "Error verifying JWT"));
   }
};
