
import express, { Request, Response } from "express";

import { createUser,userLogin } from "../controllers/user.ctrl";
import { sendOtp } from "../controllers/otp.ctrl";

const userRouter = express.Router();

// Route for user registration
userRouter.route("/register").post(createUser);

userRouter.route("/login").post(userLogin);

userRouter.route("/send-otp").post(sendOtp);

// Some Functionality

export default userRouter;
