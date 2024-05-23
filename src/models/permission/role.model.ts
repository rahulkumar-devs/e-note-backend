import mongoose, { Document, Schema, Types } from "mongoose";

interface IRole extends Document {
   role_name: string;
   value: string;
}

const roleSchema = new Schema<IRole>({
   role_name: {
      type: String,
      required: true,
   },
   value: {
      type: String,
      required: true,
      default: "user",
   },
});

const RoleModel = mongoose.model<IRole>("Role", roleSchema);

export default RoleModel;
