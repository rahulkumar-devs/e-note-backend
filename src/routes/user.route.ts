import express from "express";
import { createUser, loginUser } from "../controllers/user.ctrl";
import passport from "passport";

const userRouter = express.Router();

// Define routes
userRouter.route("/register").post(createUser);



userRouter.route("/login").get(loginUser);

// Route for initiating Google authentication
userRouter.get(
   "/auth/google",
   passport.authenticate("google", { scope: ["profile", "email"] })
);

// Route for handling Google authentication callback
userRouter.get(
   "/auth/google/callback",
   passport.authenticate("google", {
      failureRedirect: "/login",
      successRedirect: "/test",
   })
);

// Route for testing purposes
userRouter.route("/test").get((req, res) => {
   console.log(req.user)
   res.send(req.user);
});

export default userRouter;
