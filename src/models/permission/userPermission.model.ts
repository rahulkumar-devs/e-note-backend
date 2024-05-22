import mongoose, { Document, Schema, Types } from "mongoose";

interface IPermission extends Document {
   user_id: Types.ObjectId;
   permissions: ("create" | "read" | "delete" | "update")[];
}

const userPermissionSchema = new Schema<IPermission>({
   user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
   permissions: [
      {
         type: String,
         enum: ["create", "read", "delete"],
         required: true,
         default: "read",
      },
   ],
});

// Index on user_id for faster queries
userPermissionSchema.index({ user_id: 1 });

const userPermission = mongoose.model<IPermission>(
   "Permission",
   userPermissionSchema
);

export default userPermission;
