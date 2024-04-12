import { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import path from "path";

const successPassport = expressAsyncHandler(
   async (req: Request, res: Response, next: NextFunction) => {
      console.log(req.user);
     res.send("Worked")
   }
);

export { successPassport };
