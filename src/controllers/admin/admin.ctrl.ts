import { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import UserModel from "../../models/user.model";
import createHttpError from "http-errors";

const updateAdminRoutes = expressAsyncHandler(
   async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { id } = req.params;
        const { role } = req.body;

        // Validate input
        if (!id || !role) {
          throw createHttpError(400, "User ID and role are required.");
        }

        // Update user role
        const user = await UserModel.findByIdAndUpdate(
          id,
          { $push: { role } },
          { new: true }
        );

        // Check if user exists
        if (!user) {
          throw createHttpError(404, "User not found.");
        }

        res.status(200).json({
          success: true,
          message: "Role updated successfully",
          user,
        });
      } catch (error: any) {
        next(createHttpError(error.status || 500, error.message));
      }
   }
);

export default updateAdminRoutes;
