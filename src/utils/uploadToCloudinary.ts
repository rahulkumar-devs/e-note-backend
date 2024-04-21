import fs from "node:fs";
import cloudinary from "../config/cloudinary.config";


// Function to upload file to Cloudinary and delete local file


export const uploadToCloudinary = async (
   filePath: string,
   folder: string,
   filename: string,
   format: string
):Promise<{public_id:string,url:string,size:number,width:number,height:number,formate:string,resource_type:string} >=> {
   try {
      const uploadResult = await cloudinary.uploader.upload(filePath, {
         folder,
         filename_override: filename,
         resource_type:"auto",
         format,
      });
      // Delete local file after upload
      fs.unlink(filePath, (err) => {
         if (err) {
            console.error("Error deleting local file:", err);
         } else {
            console.log(
               `Successfully removed local file ${filename} after upload to Cloudinary`
            );
         }
      });
      return {
        public_id:uploadResult.public_id,
        url:uploadResult.secure_url,size:uploadResult.bytes,
        width:uploadResult.width,
        height:uploadResult.height,
        formate:uploadResult.format,
        resource_type:uploadResult.resource_type
      };
   } catch (error) {
      fs.unlinkSync(filePath);
      console.error(`Error uploading file to Cloudinary: ${filename}`, error);
      throw new Error("Failed to upload file to Cloudinary",);
   }
};
