
import express from "express"
import { createUser } from "../controllers/user.ctrl";

const userRouter = express.Router();

userRouter.route("/").post(createUser)


export default userRouter;