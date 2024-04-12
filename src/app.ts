import express, { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";

import globalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./routes/user.route";


const app = express();

// Routes

app.use(userRouter);

app.all("*", (req: Request, res: Response, next: NextFunction) => {
   const err = createHttpError(404, `Route Not Found ${req.originalUrl}`);
   next(err);
});

// Error handler
app.use(globalErrorHandler);

export default app;
