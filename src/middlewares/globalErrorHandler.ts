import { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";
import { config } from "../config/config";

const globalErrorHandler = (err: HttpError, req: Request, res: Response, next: NextFunction) => {
    const statusCode = (err.statusCode as number) || 500;
 
    return res.status(statusCode).json({
       success: false,
       message: err.message,
       errorStack: config.env === "devlopment" ? err.stack : "",
    });
 }

 export default globalErrorHandler;