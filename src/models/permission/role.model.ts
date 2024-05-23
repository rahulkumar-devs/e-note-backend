import mongoose, { Document, Schema, Types } from "mongoose";

interface IRole extends Document {
   role_name: string;
   value: number;
}

const roleSchema = new Schema<IRole>({
   role_name: {
      type: String,
      required: true,
   },
   value: {
      type: Number,
      required: true,
      default: 0,
   },
});

const RoleModel = mongoose.model<IRole>("Role", roleSchema);

export default RoleModel;
