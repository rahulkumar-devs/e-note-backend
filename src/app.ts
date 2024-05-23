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

// Enable CORS middleware

app.use(
   cors({
      origin: "http://localhost:3000",
      methods: ["GET", "POST","PUT"], 
      allowedHeaders: ["Content-Type"],
      credentials: true
   })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Enable gzip compression middleware
app.use(compression());

// Logging middleware
app.use(morgan("dev"));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

// Set up user routes
app.use("/api", userRouter, booksRoute);


// 404 Route
app.all("*", (req: Request, res: Response, next: NextFunction) => {
   const err = createHttpError(404, `Route Not Found ${req.originalUrl}`);
   next(err);
});

// Error handling middleware
app.use(globalErrorHandler);

export default app;
