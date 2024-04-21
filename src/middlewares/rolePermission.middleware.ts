import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";


/**
 * Middleware function to check if the user has admin privileges.
 *
 * @param {...string[]} roles - The roles to check against the user's role.
 * @return {function} - The middleware function.
 */

export const restrict = (...roles: string[]) => {
   return (req: Request, res: Response, next: NextFunction) => {
      const { user } = req;
      if (!user || !user.role || !user.role.some((r) => roles.includes(r))) {
         return next(
            createHttpError(
               403,
               "You have no permission to access this account"
            )
         );
      }
      next();
   };
};

