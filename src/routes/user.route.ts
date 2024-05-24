import { restrict } from './../middlewares/rolePermission.middleware';
import express from "express";

import {
   userRegister,
   userLogin,
   logoutUser,
   refreshAccessToken,
   activateUser,
   forgotpassword,
   verifyResetPassword,
   createResetpass,
   getAlluser,
   deleteUser,
} from "../controllers/auth/user.ctrl";

import { isAuthenticated } from "../middlewares/authentication.middleware";
import { searchBook } from '../controllers/book/book.ctrl';

const userRouter = express.Router();

// Route for user registration
userRouter.route("/signup").post(userRegister);
userRouter.route("/activate-user").post(activateUser);

userRouter.route("/signin").post(userLogin);
userRouter.route("/refresh-token").post( refreshAccessToken);

// Pass reset routes
userRouter.route("/forgot-password").post(forgotpassword);
userRouter.route("/verify-password").post(verifyResetPassword);
userRouter.route("/new-password/:id").post(createResetpass);



// Some protected routes
userRouter.route("/logout").get(isAuthenticated, logoutUser);
userRouter.route("/delete-users/:id").delete(isAuthenticated,restrict("admin"),deleteUser);
userRouter.route("/users").get(isAuthenticated,restrict("admin"),getAlluser);



export default userRouter;
