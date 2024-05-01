import fs from "fs";
import cloudinary from "../config/cloudinary.config";
import path from "path";

interface ICloudinaryUpload {
   public_id: string;
   url: string;
}

// Maintain a list of uploaded file names
const uploadedFiles: string[] = [];

export const uploadFileToCloudinary = async (
   file: Express.Multer.File,
   folder: string
): Promise<ICloudinaryUpload> => {
   const fileName = file.filename;
   const filePath = path.resolve(__dirname, "../../public/data", fileName);

   try {
      // Check if the file has already been uploaded
      if (uploadedFiles.includes(fileName)) {
         throw new Error(`File '${fileName}' has already been uploaded`);
      }

      // Upload file to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(filePath, {
         folder,
         quality_analysis: true,
      });

      // Add the uploaded file name to the list
      uploadedFiles.push(fileName);

      // Delete local file after successful upload
      if (fs.existsSync(filePath)) {
         fs.unlinkSync(filePath);
      }

      // Return upload result
      const cloudinaryUpload: ICloudinaryUpload = {
         public_id: uploadResult.public_id,
         url: uploadResult.secure_url,
      };

      return cloudinaryUpload;
   } catch (error) {
      // Delete local file in case of upload failure
      if (fs.existsSync(filePath)) {
         fs.unlinkSync(filePath);
      }

      console.error(`Error uploading file to Cloudinary: ${fileName}`, error);
      throw new Error("Failed to upload file to Cloudinary");
   }
};

export const deleteToCloudinary = async (public_id: string): Promise<void> => {
   try {
      const deleted = await cloudinary.uploader.destroy(public_id);
   } catch (error: any) {
      console.log(error);
      throw new Error(error.message);
   }
};
