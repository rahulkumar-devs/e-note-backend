import mongoose, { Document, Schema, Types } from "mongoose";

interface IPermission extends Document {
   permission_name: string;
   is_default: number;
}

const permissionSchema = new Schema<IPermission>({
   permission_name: {
      type: String,
      required: true,
   },
   is_default: {
      type: Number,
      default:0,
   },
});

const PermissionModel = mongoose.model<IPermission>('Permission', permissionSchema);

export default PermissionModel;