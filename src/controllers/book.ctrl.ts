import { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import path from "node:path";
import bookModel, { IBook } from "../models/book.model";
import { uploadToCloudinary } from "../utils/uploadToCloudinary";
import createHttpError from "http-errors";

export const createBook = expressAsyncHandler(
   async (req: Request, res: Response, next: NextFunction) => {
      const files = req.files as {
         [fieldname: string]: Express.Multer.File[];
      };



      try {
         // Upload Cover Image
         const coverImage = files.coverImage[0];
         const coverImagePath = path.resolve(
            __dirname,
            "../../public/data",
            coverImage.filename
         );
         const coverImageFormat = coverImage.mimetype.split("/")[1];
         const resultCoverImage = await uploadToCloudinary(
            coverImagePath,
            "coverImage",
            coverImage.filename,
            coverImageFormat
         );

         // Upload PDF File
         const pdfFile = files.pdf_file[0];
         const pdfFilePath = path.resolve(
            __dirname,
            "../../public/data",
            pdfFile.filename
         );
         const pdfFileFormat = pdfFile.mimetype.split("/")[1];
         const resultPdf = await uploadToCloudinary(
            pdfFilePath,
            "pdf_file",
            pdfFile.filename,
            pdfFileFormat
         );

         // Upload Image Files
         const imageFiles = await Promise.all(
            (files.file || []).map(async (imageFile) => {
               const imageFilePath = path.resolve(
                  __dirname,
                  "../../public/data",
                  imageFile.filename
               );
               const imageFileFormat = imageFile.mimetype.split("/")[1];
               return await uploadToCloudinary(
                  imageFilePath,
                  "imageFiles",
                  imageFile.filename,
                  imageFileFormat
               );
            })
         );

         // Create book object
         const newBook: IBook = {
            title: req.body.title,
            author: req.user?._id,
            gener: req.body.gener,
            coverImage: {
               public_id: resultCoverImage.public_id,
               url: resultCoverImage.url,
            },
            pdf_file: {
               public_id: resultPdf.public_id,
               url: resultPdf.url,
            },
            file: imageFiles.map((file) => ({
               public_id: file.public_id,
               url: file.url,
            })),
            descriptions: req.body.descriptions,
         };

         // Save book to database
         const createdBook = await bookModel.create(newBook);

         // Respond with success message
         res.status(200).json({
            success: true,
            message: "Book successfully created",
            book: createdBook,
         });
      } catch (error: any) {
         console.log(error)
         next(error.message);
      }
   }
);
