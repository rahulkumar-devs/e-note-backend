import express, { Router } from "express";
import { isAuthenticated } from "../middlewares/authentication.middleware";
import { createBook } from "../controllers/book.ctrl";
import upload from "../middlewares/multer.middleware";

const booksRoute: Router = express.Router();

booksRoute.post(
   "/create-book",
   isAuthenticated,
   upload.fields([
      { name: "coverImage", maxCount: 1 },
      { name: "pdf_file", maxCount: 1 },
      { name: "file", maxCount: 10 },
   ]),
   createBook
);

export default booksRoute;
