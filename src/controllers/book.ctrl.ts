import { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import cloudinary from "../config/cloudinary.config";
import path from "node:path";
import fs from "node:fs";
import createHttpError from "http-errors";
import bookModel from "../models/book.model";
import { uploadToCloudinary } from "../utils/uploadToCloudinary";

export const createBook = expressAsyncHandler(
   async (req: Request, res: Response, next: NextFunction) => {
      const files = req.files as {
         [fieldname: string]: Express.Multer.File[];
      };

      try {
         // Upload cover images

         const coverImageUploads = await Promise.all(
            (files.coverImage || []).map(async (coverImageFile) => {
               const coverImgPath = path.join(
                  __dirname,
                  "../../public/data",
                  coverImageFile.filename
               );
               const format = coverImageFile.mimetype.split("/")[1]; // Get format from mimetype
               return uploadToCloudinary(
                  coverImgPath,
                  "coverImage",
                  coverImageFile.filename,
                  format
               );
            })
         );
      } catch (error: any) {
         // Handle cover image upload error
         next(createHttpError(500, error.message));
         return;
      }

      try {
         // Upload PDF files
         const pdfFileUploads = files.pdf_file
         ? await Promise.all(
               files.pdf_file.map(async (pdfFile) => {
                  const pdfFilePath = path.join(
                     __dirname,
                     "../../public/data",
                     pdfFile.filename
                  );
                  const format = pdfFile.mimetype.split("/")[1];
                  return uploadToCloudinary(
                     pdfFilePath,
                     "pdf_file",
                     pdfFile.filename,
                     format
                  );
               })
           )
         : [];
      } catch (error: any) {
         // Handle PDF file upload error
         next(createHttpError(500, error.message));
         return;
      }

      try {
         await Promise.all(
            (files.file || []).map(async (imageFile) => {
               const imageFilePath = path.join(
                  __dirname,
                  "../../public/data",
                  imageFile.filename
               );
               const format = imageFile.mimetype.split("/")[1];
               return uploadToCloudinary(
                  imageFilePath,
                  "pdf_file",
                  imageFile.filename,
                  format
               );
            })
         );
      } catch (error: any) {
         next(createHttpError(500, error.message));
         return;
      }
      // Respond with success message
      res.status(200).json({ success: true });
   }
);
