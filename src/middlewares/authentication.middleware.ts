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
      const token =
        req.cookies?.accessToken ||
        req.header("authorization")?.replace("Bearer ", "");

      if (!token) {
        console.error("No token provided");
        return next(createHttpError(401, "No token provided"));
      }

    

      let decodedToken: JwtPayload;

      try {
        decodedToken = jwt.verify(token, config.access_token_key) as JwtPayload;
       
      } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
          console.error("Token expired");
          return next(createHttpError(401, "Token expired"));
        }
        if (error.name === 'JsonWebTokenError') {
          console.error("Invalid token");
          return next(createHttpError(401, "Invalid token"));
        }
        console.error("JWT verification failed", error);
        return next(createHttpError(500, "JWT verification failed"));
      }

      if (!decodedToken || !decodedToken._id) {
        console.error("Invalid decoded token");
        return next(createHttpError(401, "Invalid token"));
      }

      const user = await UserModel.findById(decodedToken._id).select("-password -refreshToken");

      if (!user) {
        console.error("Unauthorized: User not found");
        return next(createHttpError(401, "Unauthorized: User not found"));
      }

      req.user = user;
      next();
    } catch (error: any) {
      console.error("Authentication error", error);
      next(createHttpError(500, error.message));
    }
  }
);

export { isAuthenticated };
