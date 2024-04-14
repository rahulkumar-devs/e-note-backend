import express, { Request, Response } from "express";

import { createUser, logOutUser, loginUser } from "../controllers/user.ctrl";
import { isAuthenticate } from "../middlewares/auth.middleware";


const userRouter = express.Router();



// Route for user registration
userRouter.route("/register").post(createUser);

// Route for user login
userRouter.route("/login").post(loginUser);

userRouter.route("/profile").get(isAuthenticate,(req,res)=>{
   res.send(req.user)
   
})
userRouter.route("/logout").get(isAuthenticate,logOutUser)
userRouter.route("/").get((req,res)=>{
console.log(req.session.id,req.session)



})





export default userRouter;
