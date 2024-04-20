import express from "express";

import { createUser, userLogin, logoutUser, refreshAccessToken } from "../controllers/user.ctrl";

import { isAuthenticated } from "../middlewares/authentication.middleware";

const userRouter = express.Router();

// Route for user registration
userRouter.route("/register").post(createUser);

userRouter.route("/login").post(userLogin);
userRouter.route("/refresh").post(isAuthenticated,refreshAccessToken)
userRouter.route("/logout").get(isAuthenticated,logoutUser);


// Some Functionality

export default userRouter;
