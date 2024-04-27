import cloudinary from "../config/cloudinary.config";

// Function to check if a file exists in Cloudinary
export const checkFileExistsInCloudinary = async (publicId: string): Promise<boolean> => {
   try {
      // Perform a search in Cloudinary using the public ID
      const searchResult = await cloudinary.search
         .expression(`public_id:${publicId}`)
         .execute();

        

      // If any results are returned, the file exists in Cloudinary
      return searchResult.total_count > 0;
   } catch (error) {
      console.error(`Error checking file existence in Cloudinary: ${publicId}`, error);
      throw new Error("Failed to check file existence in Cloudinary");
   }
};
