import { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";
import { MulterError } from "multer";
import jwt from "jsonwebtoken";
import { config } from "../config/config";

const globalErrorHandler = (err: HttpError, req: Request, res: Response, next: NextFunction) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let errorStack = "";

  // Handle JWT Token errors
  if (err instanceof jwt.TokenExpiredError) {
    statusCode = 401;
    message = "Token expired";
  } else if (err instanceof jwt.JsonWebTokenError) {
    statusCode = 401;
    message = "Invalid token";
  }

  // Handle Multer file size limit exceeded error
  if (err instanceof MulterError && err.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    message = "File size limit exceeded";
  }

  // Log the error if in development environment
  if (config.env === "development") {
    console.error(err);
  }

  // Send response with error details
  return res.status(statusCode).json({
    success: false,
    message,
    errorStack: config.env === "development" ? err.stack : errorStack,
  });
};

export default globalErrorHandler;
