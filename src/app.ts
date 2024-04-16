
import express, { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./routes/user.route";
import compression from "compression";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";


const app = express();

// Body parsing middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Cookie parsing middleware
app.use(cookieParser());


// Enable CORS middleware
app.use(cors());

// Enable gzip compression middleware
app.use(compression());

// Logging middleware
app.use(morgan("dev"));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Set up user routes
app.use(userRouter);


// 404 Route
app.all("*", (req: Request, res: Response, next: NextFunction) => {
   const err = createHttpError(404, `Route Not Found ${req.originalUrl}`);
   next(err);
});

// Error handling middleware
app.use(globalErrorHandler);

export default app;
