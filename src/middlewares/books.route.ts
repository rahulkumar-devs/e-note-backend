import express, { Router } from "express";
import { isAuthenticated } from "../middlewares/authentication.middleware";
import { restrict } from "../middlewares/rolePermission.middleware";
import { createBook } from "../controllers/book.ctrl";
import upload from "../middlewares/multer.middleware";

const booksRoute:Router = express.Router();

booksRoute.route('/create-book').post(isAuthenticated , upload.fields([{name:"coverImage",maxCount:1},{name:"file",maxCount:1}]),createBook)
export default booksRoute;