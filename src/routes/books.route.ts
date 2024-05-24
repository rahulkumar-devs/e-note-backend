import express, { Router } from "express";
import { isAuthenticated } from "../middlewares/authentication.middleware";
import { restrict } from "../middlewares/rolePermission.middleware";
import {
   createBook,
   deleteSingleImage,
   deleteSpecificFile,
   getSingleImage,
   readAllBooks,
   searchBook,
   singleBook,
   updateBook,
   updateBookDislikes,
   updateBookLikes,
} from "../controllers/book/book.ctrl";
import upload from "../middlewares/multer.middleware";

const booksRoute: Router = express.Router();

// Protected Routes or admin or member route
booksRoute.route("/create-book").post(
   isAuthenticated,
   restrict("admin", "member"),
   upload.fields([
      { name: "coverImage", maxCount: 1 },
      { name: "pdf_file", maxCount: 2 },
      { name: "imageFiles", maxCount: 100 },
   ]),
   createBook
);
booksRoute.route("/update-book/:id").put(
   isAuthenticated,
   restrict("admin", "member"),
   upload.fields([
      { name: "coverImage", maxCount: 1 },
      { name: "pdf_file", maxCount: 2 },
      { name: "imageFiles", maxCount: 100 },
   ]),
   updateBook
);

// <======All user Access======>
booksRoute
   .route("/book/dislikes/:bookId")
   .put(isAuthenticated, updateBookDislikes);
booksRoute.route("/book/likes/:bookId").put(isAuthenticated, updateBookLikes);
booksRoute
   .route("/books/:book_id/files/:file_id")
   .put(isAuthenticated, restrict("admin", "member"), deleteSpecificFile);

booksRoute
   .route("/search-books")
   .get(isAuthenticated, restrict("user", "admin", "member"), searchBook);

// <==============================>
// <========General Routes============>
// <==============================>

booksRoute.route("/books").get(isAuthenticated, readAllBooks);

booksRoute.route("/book/:id").get(isAuthenticated, singleBook);

// single book routes
booksRoute
   .route("/single-image")
   .get(isAuthenticated, restrict("user", "admin", "member"), getSingleImage);
booksRoute
   .route("/delete-single-image")
   .delete(isAuthenticated, deleteSingleImage);

export default booksRoute;
