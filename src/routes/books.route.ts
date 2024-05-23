import express, { Router } from "express";
import { isAuthenticated } from "../middlewares/authentication.middleware";
import { restrict } from "../middlewares/rolePermission.middleware";
import {
   createBook,
   deleteSingleImage,
   deleteSpecificFile,
   getSingleImage,
   readAllBooks,
   singleBook,
   updateBook,
   updateBookDislikes,
   updateBookLikes,
} from "../controllers/book/book.ctrl";
import upload from "../middlewares/multer.middleware";

const booksRoute: Router = express.Router();

booksRoute.route("/create-book").post(
   isAuthenticated,
   upload.fields([
      { name: "coverImage", maxCount: 1 },
      { name: "pdf_file", maxCount: 2 },
      { name: "imageFiles", maxCount: 100 },
   ]),
   createBook
);
booksRoute.route("/update-book/:id").post(
   isAuthenticated,
   upload.fields([
      { name: "coverImage", maxCount: 1 },
      { name: "pdf_file", maxCount: 2 },
      { name: "imageFiles", maxCount: 100 },
   ]),
   updateBook
);
booksRoute.route("/books").get(isAuthenticated,readAllBooks);

booksRoute
   .route("/books/:book_id/files/:file_id")
   .put(isAuthenticated, deleteSpecificFile);

booksRoute.route("/book/:id").get(singleBook);
booksRoute.route("/book/dislikes/:bookId").put(isAuthenticated,updateBookDislikes);
booksRoute.route("/book/likes/:bookId").put(isAuthenticated,updateBookLikes);

// single book routes
booksRoute.route("/single-image").get(isAuthenticated,getSingleImage);
booksRoute.route("/delete-single-image").delete(isAuthenticated,deleteSingleImage);


export default booksRoute;
