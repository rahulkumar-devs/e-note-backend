import mongoose, { Document, Schema, Types } from "mongoose";

interface IPermission {
    permission_name: string;
    permission_value: 'create' | 'read' | 'edit' | 'delete';
}

interface IUserPermission extends Document {
    user_id: Types.ObjectId;
    permission: IPermission[];
}

const permissionSchema = new Schema<IPermission>({
    permission_name: {
        type: String,
        required: true
    },
    permission_value: {
        type: String,
        enum: ['create', 'read', 'edit', 'delete'],
        default: 'read'
    }
});

const userPermissionSchema = new Schema<IUserPermission>({
    user_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    permission: [permissionSchema]
});

const UserPermission = mongoose.model<IUserPermission>('UserPermission', userPermissionSchema);

export default UserPermission;
