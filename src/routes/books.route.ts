import express, { Router } from "express";
import { isAuthenticated } from "../middlewares/authentication.middleware";
import { restrict } from "../middlewares/rolePermission.middleware";
import { createBook } from "../controllers/book.ctrl";

const booksRoute:Router = express.Router();

booksRoute.route('/create-book').post(isAuthenticated,restrict("admin,mentor"),createBook)
export default booksRoute;