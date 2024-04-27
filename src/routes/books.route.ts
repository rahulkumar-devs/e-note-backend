import express, { Router } from "express";
import { isAuthenticated } from "../middlewares/authentication.middleware";
import { restrict } from "../middlewares/rolePermission.middleware";
import { createBook, deleteSpecificFile, readAllBooks, updateBook } from "../controllers/book.ctrl";
import upload from "../middlewares/multer.middleware";

const booksRoute: Router = express.Router();

booksRoute.route("/create-book").post(
   isAuthenticated,
   upload.fields([
      { name: "coverImage", maxCount: 1 },
      { name: "pdf_file", maxCount: 10 },
      { name: "imageFiles", maxCount: 100 },
   ]),
   createBook
);
booksRoute.route("/updatee-book/:id").post(
   isAuthenticated,
   upload.fields([
      { name: "coverImage", maxCount: 1 },
      { name: "pdf_file", maxCount: 10 },
      { name: "imageFiles", maxCount: 100 },
   ]),
   updateBook
);
booksRoute
   .route("/books")
   .get(isAuthenticated, restrict("admin"), readAllBooks);

   booksRoute.route('/books/:book_id/files/:file_id').put(isAuthenticated,deleteSpecificFile)


export default booksRoute;
