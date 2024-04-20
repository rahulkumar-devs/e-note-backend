import { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";


const bookCtrl = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction)=>{

    }
)

export {bookCtrl};