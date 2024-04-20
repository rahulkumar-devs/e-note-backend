import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";

/**
 * Middleware function to check if the user has the required role to access the account.
 *
 * @param {string} role - The required role for accessing the account.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next function to be called.
 * @return {void} - This function does not return anything.
 */



export const isAdmin = (role: string) => {
   return (req: Request, res: Response, next: NextFunction) => {
      if (req?.user?.role !== role) {
         return next(
            createHttpError(
               403,
               "you have no permission to access this account"
            )
         );
      }
      next();
   };
};
