import express, { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";

import globalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./routes/user.route";
import compression from "compression";
import shouldCompress from "./utils/shouldCompress";
import morgan from "morgan";

const app = express();
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(compression({
   // filter decides if the response should be compressed or not, 
   // based on the `shouldCompress` function above
   filter: shouldCompress,
   // threshold is the byte threshold for the response body size
   // before compression is considered, the default is 1kb
   threshold: 0
 }));

 app.use(morgan("dev"));

// Routes

app.use("/api", userRouter);

app.all("*", (req: Request, res: Response, next: NextFunction) => {
   const err = createHttpError(404, `Route Not Found ${req.originalUrl}`);
   next(err);
});

// Error handler
app.use(globalErrorHandler);

export default app;
