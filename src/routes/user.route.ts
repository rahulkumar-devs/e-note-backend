import express from "express";
import { createUser, loginUser } from "../controllers/user.ctrl";
import passport from "passport";
import { passportCtrl } from "../controllers/passport.ctrl";

const userRouter = express.Router();

// Define routes
userRouter.route("/register").post(createUser);

userRouter.route("/login").get(loginUser);

// Route for initiating Google authentication
userRouter.get(
   "/auth/google",
   passport.authenticate("google", { scope: ["profile", "email"] })
);

userRouter
   .route("/auth/google/callback")
   .get(
      passport.authenticate("google", { failureRedirect: "/login" }),
      passportCtrl
   );

export default userRouter;
