import express, { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import compression from "compression";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import { config } from "./config/config";
import booksRoute from "./routes/books.route";
import userRouter from "./routes/user.route";

const app = express();

// Cookie parsing middleware
app.use(cookieParser());

// Body parsing middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Enable CORS middleware
app.use(cors({origin:config.client_url}));

// Enable gzip compression middleware
app.use(compression());

// Logging middleware
app.use(morgan("dev"));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Set up user routes
app.use("/api",userRouter,booksRoute);

// 404 Route
app.all("*", (req: Request, res: Response, next: NextFunction) => {
   const err = createHttpError(404, `Route Not Found ${req.originalUrl}`);
   next(err);
});

// Error handling middleware
app.use(globalErrorHandler);

export default app;
