import { Router } from "express";
import { isAuthenticated } from "../middlewares/authentication.middleware";
import { restrict } from "../middlewares/rolePermission.middleware";
import updateAdminRoutes from "../controllers/admin/admin.ctrl";

const adminRoute = Router();

adminRoute
   .route("/update-admin/:id")
   .put(isAuthenticated, restrict("admin"), updateAdminRoutes);

export default adminRoute;
