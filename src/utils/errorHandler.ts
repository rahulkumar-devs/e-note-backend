import { NextFunction, Request, Response } from "express";
import morgan from "morgan";


// Custom Morgan token to log request bodies
morgan.token('body', (req:Request) => JSON.stringify(req.body));
morgan.token('params', (req:Request) => JSON.stringify(req.params));
morgan.token('query', (req:Request) => JSON.stringify(req.query));

export const morgonDebug=morgan(':method :url :status :res[content-length] - :response-time ms :body :params :query')

export  const errorHandler = (err:any, req:Request, res:Response, next:NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
