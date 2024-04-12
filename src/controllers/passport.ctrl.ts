import { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";


const passportCtrl = expressAsyncHandler(
   async (req: Request, res: Response, next: NextFunction) => {
      console.log(req.user );
      res.json(req.user);
   }
);

export { passportCtrl };
