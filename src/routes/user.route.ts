import express, { Request, Response } from "express";

import { createUser } from "../controllers/user.ctrl";


const userRouter = express.Router();



// Route for user registration
userRouter.route("/register").post(createUser);

// Route for user login







export default userRouter;
