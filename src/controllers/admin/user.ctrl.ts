import expressAsyncHandler from "express-async-handler";
import createHttpError from "http-errors";
import { NextFunction, Request, Response } from "express";

const createUser = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction)=>{
        try {

            

            
        } catch (error:any) {
         next(createHttpError(500, error.message));
            
        }
    }
)