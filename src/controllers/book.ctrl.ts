import { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";

const createBook = expressAsyncHandler(
   async (req: Request, res: Response, next: NextFunction) => {
      try {
         console.log(req.files);
      } catch (error: any) {
         return next(error.message);
      }
   }
);

export { createBook };
