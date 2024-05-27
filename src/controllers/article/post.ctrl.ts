import { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import createHttpError from "http-errors";


// createPost
export const createPost = expressAsyncHandler(
    async (req:Request,res:Response,next:NextFunction)=>{
        try {

            const {} = req.body;

            
        } catch (error:any) {
            next(createHttpError(500,error.message))
        }
    }
)

// update Post

export const updatePost = expressAsyncHandler(
    async (req:Request,res:Response,next:NextFunction)=>{
        try {

            
        } catch (error:any) {
            next(createHttpError(500,error.message))
        }
    }
)


export const deletePost = expressAsyncHandler(
    async (req:Request,res:Response,next:NextFunction)=>{
        try {

            
        } catch (error:any) {
            next(createHttpError(500,error.message))
        }
    }
)



export const readPost = expressAsyncHandler(
    async (req:Request,res:Response,next:NextFunction)=>{
        try {

            
        } catch (error:any) {
            next(createHttpError(500,error.message))
        }
    }
)