import { Request, Response, NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";
import bookModel, { IBook } from "../models/book.model";
import {
   deleteToCloudinary,
   uploadFileToCloudinary,
} from "../utils/uploadToCloudinary";
import createHttpError from "http-errors";
import UserModel from "../models/user.model";
import mongoose, { ObjectId, isValidObjectId } from "mongoose";

// Create Book
export const createBook = expressAsyncHandler(
   async (req: Request, res: Response, next: NextFunction) => {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const { title, genre, descriptions } = req.body as IBook;

      try {
         // Validate title and genre
         if (!title || !genre || !descriptions) {
            return next(createHttpError(404, "Title and genre are required."));
         }

         let coverImageDetails: { public_id: string; url: string } = {
            public_id: "",
            url: "",
         };
         const coverImage = files.coverImage?.[0];
         if (coverImage) {
            // Upload Cover Image
            const resultCoverImage = await uploadFileToCloudinary(
               coverImage,
               "coverImage"
            );
            coverImageDetails = {
               public_id: resultCoverImage.public_id,
               url: resultCoverImage.url,
            };
         }

         // Upload PDF Files

         let pdf_fileDetails: { public_id: string; url: string } = {
            public_id: "",
            url: "",
         };

         const pdf_file = files.pdf_file?.[0];
         if (pdf_file) {
            const resultPdf_file = await uploadFileToCloudinary(
               pdf_file,
               "pdf_file"
            );
            pdf_fileDetails = {
               public_id: resultPdf_file.public_id,
               url: resultPdf_file.url,
            };
         }

         // Upload Image Files
         const imageFiles = await Promise.all(
            (files.imageFiles || []).map(async (imageFile) => {
               const imageFileResult = await uploadFileToCloudinary(
                  imageFile,
                  "imageFiles"
               );
               return {
                  public_id: imageFileResult.public_id,
                  url: imageFileResult.url,
               };
            })
         );

         // Create book in MongoDB
         const book = await bookModel.create({
            title,
            genre,
            descriptions,
            coverImage: coverImageDetails,
            pdf_file: pdf_fileDetails,
            imageFiles: imageFiles.map((file) => ({
               public_id: file.public_id,
               url: file.url,
            })),
            author: req.user?._id,
         });

         // Respond with success message
         res.status(201).json({
            success: true,
            message: "Book successfully created",
            book_id: book._id,
         });
      } catch (error: any) {
         console.error("Error creating book:", error);
         next(createHttpError(500, "Internal Server Error"));
      }
   }
);
// <=======================Update Book=========================>

export const updateBook = expressAsyncHandler(
   async (req: Request, res: Response, next: NextFunction) => {
      try {
         const { title, genre, descriptions } = req.body as IBook;
         const id = req.params.id;

         const files = req.files as {
            [fieldname: string]: Express.Multer.File[];
         };

         // Find the book by ID
         const book = await bookModel.findById(id);
         if (!book) {
            return next(createHttpError(404, "Book not found"));
         }

         // Handle cover image update
         const coverImage = files.coverImage?.[0];

         if (coverImage) {
            // Delete existing cover image
            if (book.coverImage && book.coverImage.public_id) {
               await deleteToCloudinary(book.coverImage.public_id);
            }

            // Upload new cover image
            const coverImageResult = await uploadFileToCloudinary(
               coverImage,
               "coverImage"
            );

            // Update book's cover image
            book.coverImage = {
               public_id: coverImageResult.public_id,
               url: coverImageResult.url,
            };
         }

         // Handle PDF files update

         const pdf_file = files.pdf_file?.[0];
         if (pdf_file) {
            if (book.pdf_file && book.pdf_file.public_id) {
               await deleteToCloudinary(book.pdf_file.public_id);
            }

            // Upload new cover image
            const pdf_fileResult = await uploadFileToCloudinary(
               pdf_file,
               "pdf_file"
            );

            // Update book's cover image
            book.pdf_file = {
               public_id: pdf_fileResult.public_id,
               url: pdf_fileResult.url,
            };
         }

         // Handle image files update
         const imageFiles = files.imageFiles || [];
         if (imageFiles.length > 0) {
            // Delete existing image files
            await Promise.all(
               book.imageFiles.map(async (imgFile) => {
                  await deleteToCloudinary(imgFile.public_id);
               })
            );

            // Upload new image files
            const resultImageFiles = await Promise.all(
               imageFiles.map(async (imageFile) => {
                  const img_result = await uploadFileToCloudinary(
                     imageFile,
                     "image_file"
                  );
                  return {
                     public_id: img_result.public_id,
                     url: img_result.url,
                  };
               })
            );

            // Update book's image files
            book.imageFiles = resultImageFiles;
         }

         // Save the updated book
         await book.save();

         // Send response
         res.status(200).json({
            success: true,
            message: "Update successfully",
            book,
         });
      } catch (error) {
         console.error("Error updating book:", error);
         next(createHttpError(500, "Internal Server Error"));
      }
   }
);

// <=======================Delete Book=========================>
export const deleteBook = expressAsyncHandler(
   async (req: Request, res: Response, next: NextFunction) => {
      try {
         const id = req.params.id;
         // find book
         const book = await bookModel.findById(id);
         await deleteToCloudinary(book?.coverImage.public_id as string);

         await deleteToCloudinary(book?.pdf_file.public_id as string);

         book?.imageFiles.map(async (img_file) => {
            await deleteToCloudinary(img_file.public_id as string);
         });

         await bookModel.findByIdAndDelete(id);
         // Respond with success message
         res.status(200).json({
            success: true,
            message: "Book successfully updated",
         });
      } catch (error) {
         console.error("Error deleting book:", error);
         next(createHttpError(500, "Internal Server Error"));
      }
   }
);

// Read Book
// For Admin
export const readAllBooks = expressAsyncHandler(
   async (req: Request, res: Response, next: NextFunction) => {
      try {
         // Pagination parameters
         const page = parseInt(req.query.page as string) || 1; // Cast to string
         const limit = parseInt(req.query.limit as string) || 10; // Cast to string

         // Calculate the number of documents to skip
         const skipIndex = (page - 1) * limit;

         // Query to fetch paginated results
         const allBooks = await bookModel
            .find()
            .skip(skipIndex)
            .limit(limit)
            .populate("author", "name email");

         // Response with paginated data
         res.status(200).json({
            success: true,
            message: "Books successfully retrieved",
            page: page,
            limit: limit,
            totalBooks: allBooks.length, // Total number of books on this page
            totalPages: Math.ceil(allBooks.length / limit), // Total number of pages
            books: allBooks,
         });
      } catch (error) {
         console.error("Error reading books:", error);
         next(createHttpError(500, "Internal Server Error"));
      }
   }
);

// delete specific files
export const deleteSpecificFile = expressAsyncHandler(
   async (req: Request, res: Response, next: NextFunction) => {
      try {
         const book_id = req.params.book_id;
         const file_id = req.params.file_id;

         const book = await bookModel.findById(book_id);

         if (!book) {
            return next(createHttpError(404, "Book not found"));
         }

         if (book.coverImage && book.coverImage.public_id === file_id) {
            book.coverImage = { public_id: "", url: "" };
            await book.save();
         }

         if (book.pdf_file && book.pdf_file.public_id === file_id) {
            book.pdf_file = { public_id: "", url: "" };
            await book.save();
         }

         if (book.imageFiles && book.imageFiles.length > 0) {
            await bookModel.findByIdAndUpdate(
               { _id: book_id },
               { $pull: { imageFiles: { _id: file_id } } },
               { new: true }
            );
         }

         res.status(200).json({
            success: true,
            message: "File deleted successfully",
         });
      } catch (error) {
         console.error("Error deleting file:", error);
         res.status(500).json({
            success: false,
            message: "Internal Server Error",
         });
      }
   }
);

// get single book or pdf

export const singleBook = expressAsyncHandler(
   async (req: Request, res: Response, next: NextFunction) => {
      try {
         const id = req.params.id;

         const book = await bookModel.findById(id);

         if (!book) {
            next(createHttpError(404, "Book not found"));
         }

         res.status(200).json({
            success: true,
            message: "Book successfully found",
            book,
         });
      } catch (error: any) {
         next(createHttpError(error.message));
      }
   }
);

// Add like and dislike
export const likeOrDislike = expressAsyncHandler(
   async (req: Request, res: Response, next: NextFunction) => {
      try {
         const { bookId, userId } = req.params;
         if (!isValidObjectId(bookId) || !isValidObjectId(userId)) {
            return next(createHttpError(400, "Not valid Id"));
         }

         const bookObjectId = new mongoose.Types.ObjectId(bookId);
         const userObjectId = new mongoose.Types.ObjectId(userId);

         const book = await bookModel.findById(bookObjectId);
         const user = await UserModel.findById(userObjectId);

         if (!book) {
            return next(createHttpError(404, "Book not found"));
         }
         if (!user) {
            return next(createHttpError(404, "User not found"));
         }

         let updateQuery: any = {};
         const isAlreadyLiked = book.likedBy?.includes(userObjectId);

         if (isAlreadyLiked) {
            updateQuery = {
               $inc: { likes: -1 },
               $pull: { likedBy: userId },
            };
         } else {
            updateQuery = {
               $inc: { likes: 1 },
               $addToSet: { likedBy: userId },
            };
         }

         const isAlreadyDisliked = book.dislikedBy?.includes(userObjectId);

         if (isAlreadyDisliked) {
            updateQuery = {
               $inc: { dislikes: -1 },
               $pull: { dislikedBy: userId },
            };
         }

         if (Object.keys(updateQuery).length === 0) {
            res.status(400).json({
               success: true,
               message: "Not Liked",
            });
         }
         await bookModel.updateOne({ _id: bookId }, updateQuery);

        const newBookId =  await bookModel.findById(bookObjectId)

         res.status(200).json({
            success: true,
            message: "Like or dislike updated successfully",
            book:newBookId
         });
      } catch (error: any) {
         next(createHttpError(error.message));
      }
   }
);

