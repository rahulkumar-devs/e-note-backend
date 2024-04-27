import fs from "fs";
import cloudinary from "../config/cloudinary.config";
import path from "path";

interface ICloudinaryUpload {
   public_id: string;
   url: string;
}

export const uploadFileToCloudinary = async (
   file: Express.Multer.File,
   folder: string
): Promise<ICloudinaryUpload> => {
   const filePath = path.resolve(__dirname, "../../public/data", file.filename);
   try {
      const format = file.mimetype.split("/")[1];

      // Upload file to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(filePath, {
         folder,

         quality_analysis: true,
      });

      // Return upload result
      const cloudinaryUpload: ICloudinaryUpload = {
         public_id: uploadResult.public_id,
         url: uploadResult.secure_url,
      };

      // Delete local file after successful upload
      fs.unlink(filePath, (err) => {
         if (err) {
            console.error("Error deleting local file:", err);
         } else {
            console.log(
               `Successfully removed local file ${file.filename} after upload to Cloudinary`
            );
         }
      });

      return cloudinaryUpload;
   } catch (error) {
      // Delete local file in case of upload failure
      fs.unlinkSync(filePath);

      console.error(
         `Error uploading file to Cloudinary: ${file.filename}`,
         error
      );
      throw new Error("Failed to upload file to Cloudinary");
   }
};

export const deleteToCloudinary = async (public_id: string):Promise<void> => {
   try {
      const deleted = await cloudinary.uploader.destroy(public_id);
   } catch (error: any) {
      console.log(error);
      throw new Error(error.message);
   }
};
