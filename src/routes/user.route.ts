import express from "express";

import {
   createUser,
   userLogin,
   logoutUser,
   refreshAccessToken,
   activateUser,
   forgotpassword,
   verifyResetPassword,
   createResetpass,
   getAlluser,
} from "../controllers/user.ctrl";

import { isAuthenticated } from "../middlewares/authentication.middleware";

const userRouter = express.Router();

// Route for user registration
userRouter.route("/signup").post(createUser);
userRouter.route("/activate-user").post(activateUser);

userRouter.route("/signin").post(userLogin);
userRouter.route("/refresh-token").post(isAuthenticated, refreshAccessToken);
userRouter.route("/logout").get(isAuthenticated, logoutUser);

// Pass reset routes
userRouter.route("/forgot-password").post(forgotpassword);
userRouter.route("/verify-password").post(verifyResetPassword);
userRouter.route("/new-password/:id").post(createResetpass);


userRouter.route("/users").get(isAuthenticated,getAlluser);

// Some Functionality

export default userRouter;
