import express, { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";

import globalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./routes/user.route";
import compression from "compression";
import shouldCompress from "./utils/shouldCompress";
import morgan from "morgan";
import cookieSession from "cookie-session";

import passport from "passport";
import cors from "cors";
import path from "path";
import expressSession from "express-session"
import { config } from "./config/config";

const app = express();
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));


app.use(
   expressSession({
      resave:false,
      saveUninitialized:true,
      secret:config.express_session_secret_key
   })
)


app.use(passport.initialize());
app.use(passport.session());
app.use(userRouter);

app.use(cors());
app.use(compression());

// ejs template
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.use(morgan("dev"));

// Routes

app.all("*", (req: Request, res: Response, next: NextFunction) => {
   const err = createHttpError(404, `Route Not Found ${req.originalUrl}`);
   next(err);
});

// Error handler
app.use(globalErrorHandler);

export default app;
