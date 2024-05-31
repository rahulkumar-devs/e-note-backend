import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";




export const restrict = (...roles: string[]) => {
   return (req: Request, res: Response, next: NextFunction) => {
     
      const { user } = req;
      console.log(roles)
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

