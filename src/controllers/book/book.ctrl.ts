import { Request, Response, NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";
import bookModel, { IBook } from "../../models/book.model";
import {
   deleteToCloudinary,
   uploadFileToCloudinary,
} from "../../utils/uploadToCloudinary";
import createHttpError from "http-errors";
import mongoose, { isValidObjectId } from "mongoose";

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

         const book = await bookModel
            .findById(id)
            .populate("likedBy", "_id name avatar");

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

export const updateBookLikes = expressAsyncHandler(
   async (req: Request, res: Response, next: NextFunction) => {
      try {
         const { bookId } = req.params;
         const userId = req.user?._id;

         if (!userId || !bookId) {
            return next(createHttpError(404, "User or book id not found"));
         }

         const userObjectId = new mongoose.Types.ObjectId(userId);

         const book = await bookModel.findById(bookId);

         if (!book) {
            return next(createHttpError(404, "Book not found"));
         }

         const alreadyLiked = book?.likedBy.includes(userObjectId);
         const alreadyDisliked = book?.dislikedBy.includes(userObjectId);

         const queryObject: any = {};

         if (alreadyLiked) {
            // If user already liked the book, remove the like
            queryObject.$pull = { likedBy: userObjectId };
            queryObject.$inc = { likes: -1 };
            //  const updateLike=  await bookModel.findByIdAndUpdate(bookId, queryObject);
            //  console.log(updateLike)
         } else if (alreadyDisliked) {
            // If user already disliked the book, remove the dislike and add like
            queryObject.$pull = { dislikedBy: userObjectId };
            queryObject.$inc = { dislikes: -1 };
            queryObject.$addToSet = { likedBy: userObjectId };
            queryObject.$inc = { likes: 1 };
         } else {
            // If user hasn't interacted with the book yet, add like
            queryObject.$addToSet = { likedBy: userObjectId };
            queryObject.$inc = { likes: 1 };
         }

         const likesData = await bookModel.findByIdAndUpdate(
            bookId,
            queryObject
         );

         res.status(200).json({
            success: true,
            message: "Like updated successfully",
            likesData,
         });
      } catch (error) {
         next(createHttpError(500, "Internal server error"));
      }
   }
);
export const updateBookDislikes = expressAsyncHandler(
   async (req: Request, res: Response, next: NextFunction) => {
      try {
         const { bookId } = req.params;

         const userId = req.user?._id;

         if (!userId || !bookId) {
            return next(createHttpError(404, "User or book id not found"));
         }

         const userObjectId = new mongoose.Types.ObjectId(userId);

         const book = await bookModel.findById(bookId);

         if (!book) {
            return next(createHttpError(404, "Book not found"));
         }

         const alreadyLiked = book?.likedBy.includes(userObjectId);
         const alreadyDisliked = book?.dislikedBy.includes(userObjectId);

         const queryObject: any = {};

         if (alreadyLiked) {
            // If user already liked the book, remove the like
            queryObject.$pull = { likedBy: userObjectId };
            queryObject.$inc = { likes: -1 };
         } else if (alreadyDisliked) {
            // If user already disliked the book, remove the dislike
            queryObject.$pull = { dislikedBy: userObjectId };
            queryObject.$inc = { dislikes: -1 };
         } else {
            // If user hasn't interacted with the book yet, add dislike
            queryObject.$addToSet = { dislikedBy: userObjectId };
            queryObject.$inc = { dislikes: 1 };
         }

         const disliked = await bookModel.findByIdAndUpdate(
            bookId,
            queryObject
         );

         res.status(200).json({
            success: true,
            message: " dislike updated successfully",
            disliked,
         });
      } catch (error) {
         next(createHttpError(500, "Internal server error"));
      }
   }
);

// <======Operations on ImageFiles========>

// get single imageFile

interface ISingleImage {
   bookId: string;
   imageId: string;
}

export const getSingleImage = expressAsyncHandler(
   async (req: Request, res: Response, next: NextFunction) => {
      try {
         const { bookId, imageId } = req.body as ISingleImage;

         if (!isValidObjectId(bookId) || !isValidObjectId(imageId)) {
            res.status(400).json({
               success: false,
               message: "Invalid bookId or imageId",
            });
            return;
         }

         const book = await bookModel.findById(bookId);

         if (!book) {
            res.status(404).json({
               success: false,
               message: "Book not found",
            });
            return;
         }

         const findImageId = book.imageFiles.find((image) => {
            return image._id && image._id.toString() === imageId;
         });

         if (!findImageId) {
            res.status(404).json({
               success: false,
               message: "Image not found in the book",
            });
            return;
         }

         res.status(200).json({
            success: true,
            message: "Image found",
            image: findImageId,
         });
      } catch (error: any) {
         next(createHttpError(500, error.message));
      }
   }
);

// delete single image file

export const deleteSingleImage = expressAsyncHandler(
   async (req: Request, res: Response, next: NextFunction) => {
      try {
         const { bookId, imageId } = req.body as ISingleImage;

         if (!isValidObjectId(bookId) || !isValidObjectId(imageId)) {
            res.status(400).json({
               success: false,
               message: "Invalid bookId or imageId",
            });
            return;
         }

         const book = await bookModel.findById(bookId);

         if (!book) {
            res.status(404).json({
               success: false,
               message: "Book not found",
            });
            return;
         }
         const imageIndex = book.imageFiles.findIndex(
            (image) => image._id?.toString() === imageId
         );

         await deleteToCloudinary(imageId);

         if (imageIndex === -1) {
            res.status(404).json({
               success: false,
               message: "Image not found in the book",
            });
            return;
         }

         book.imageFiles.splice(imageIndex, 1);

         await book.save();

         res.status(200).json({
            success: true,
            message: "Image deleted successfully",
         });
      } catch (error: any) {
         next(createHttpError(500, error.message));
      }
   }
);



export const searchBook = expressAsyncHandler(
   async (req: Request, res: Response, next: NextFunction) => {
     try {
       // Pagination parameters
       const page = parseInt(req.query.page as string) || 1;
       const limit = parseInt(req.query.limit as string) || 10;
 
       // Search parameters from request body
       const searchParams = req.body;
 
       // Construct the search query dynamically
       const searchQuery: any = {};
       for (const [key, value] of Object.entries(searchParams)) {
         if (typeof value === 'string') {
           searchQuery[key] = { $regex: value, $options: 'i' }; 
         } else {
           searchQuery[key] = value; 
         }
       }
 
       // Calculate the number of documents to skip
       const skipIndex = (page - 1) * limit;
 
       // Query to fetch paginated and filtered results
       const allBooks = await bookModel
         .find(searchQuery)
         .skip(skipIndex)
         .limit(limit)
         .populate('author', 'name email');
 
       // Get the total count for pagination purposes
       const totalBooks = await bookModel.countDocuments(searchQuery);
 
       // Respond with the paginated and filtered books
       res.status(200).json({
         totalBooks,
         totalPages: Math.ceil(totalBooks / limit),
         currentPage: page,
         books: allBooks
       });
     } catch (error: any) {
       res.status(500).json({ message: 'Error fetching books', error: error.message });
     }
   }
 );