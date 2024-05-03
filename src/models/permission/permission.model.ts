import mongoose, { Document, Schema, Types } from "mongoose";

interface IPermission extends Document {
    user_id: Types.ObjectId;
    permissions: ("create" | "read" | "delete")[];
}

const permissionSchema = new Schema<IPermission>({
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    permissions: [{ type: String, enum: ["create", "read", "delete"], required: true }]
});

// Index on user_id for faster queries
permissionSchema.index({ user_id: 1 });

// Default permissions (if needed)
permissionSchema.pre("save", function(this: IPermission, next) {
    if (!this.permissions || this.permissions.length === 0) {
        this.permissions = ["read"]; // Default to read permission
    }
    next();
});

// Custom method to add permission
permissionSchema.methods.addPermission = function(permission: string) {
    if (!this.permissions.includes(permission)) {
        this.permissions.push(permission);
    }
};

// Virtuals example
permissionSchema.virtual('permissionCount').get(function(this: IPermission) {
    return this.permissions.length;
});

const permissionModel = mongoose.model<IPermission>("Permission", permissionSchema);

export default permissionModel;
