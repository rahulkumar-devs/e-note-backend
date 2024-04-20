import express from "express";

import { createUser, userLogin, logoutUser, refreshAccessToken } from "../controllers/user.ctrl";
import { sendOtp } from "../controllers/otp.ctrl";
import { isAuthenticated } from "../middlewares/authentication.middleware";

const userRouter = express.Router();

// Route for user registration
userRouter.route("/register").post(createUser);

userRouter.route("/login").post(userLogin);
userRouter.route("/refresh").post(isAuthenticated,refreshAccessToken)
userRouter.route("/logout").get(isAuthenticated,logoutUser);

userRouter.route("/send-otp").post(sendOtp);

// Some Functionality

export default userRouter;
