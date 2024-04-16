import UserModel from "../models/user.model";
import { HttpError } from "http-errors";

const generateTokens = async (userId: string): Promise<{ accessToken: string, refreshToken: string }> => {
   try {
      const user = await UserModel.findById(userId);

      if (!user) {
          throw new HttpError( "User not found");
      }

      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();

      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });

      return {
         accessToken,
         refreshToken,
      };
   } catch (error) {
      // If an error occurred, rethrow it for the caller to handle
      throw error;
   }
};

export default generateTokens;
