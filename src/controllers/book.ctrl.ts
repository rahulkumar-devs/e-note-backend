import { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import cloudinary from "../config/cloudinary.config";
import path from "node:path";
import fs from "node:fs";
import createHttpError from "http-errors";
import bookModel, { IBook } from "../models/book.model";
import { uploadToCloudinary } from "../utils/uploadToCloudinary";

export const createBook = expressAsyncHandler(
   async (req: Request, res: Response, next: NextFunction) => {
      const files = req.files as {
         [fieldname: string]: Express.Multer.File[];
      };

      // Upload cover images

      const coverImageUploads = await Promise.all(
         (files.coverImage || []).map(async (coverImageFile) => {
            const coverImgPath = path.join(
               __dirname,
               "../../public/data",
               coverImageFile.filename
            );
            const format = coverImageFile.mimetype.split("/")[1]; // Get format from mimetype
            return await uploadToCloudinary(
               coverImgPath,
               "coverImage",
               coverImageFile.filename,
               format
            );
         })
      );

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
                 return await uploadToCloudinary(
                    pdfFilePath,
                    "pdf_file",
                    pdfFile.filename,
                    format
                 );
              })
           )
         : [];

      const imageFiles = await Promise.all(
         (files.file || []).map(async (imageFile) => {
            const imageFilePath = path.join(
               __dirname,
               "../../public/data",
               imageFile.filename
            );
            const format = imageFile.mimetype.split("/")[1];
            return await uploadToCloudinary(
               imageFilePath,
               "imageFiles",
               imageFile.filename,
               format
            );
         })
      );

      // Create book object
      const newBook = {
         title: req.body.title,
         author: req.user?._id,
         gener: req.body.gener,
         coverImage: coverImageUploads.map((upload) => ({
            public_id: upload.public_id,
            url: upload.url,
         })),
         pdf_file: pdfFileUploads.map((upload) => ({
            public_id: upload.public_id,
            url: upload.url,
         })),
         file: imageFiles.map((upload) => ({
            public_id: upload.public_id,
            url: upload.url,
         })),
      };

      await bookModel.create(newBook);

      // Respond with success message
      res.status(200).json({ success: true });
   }
);
