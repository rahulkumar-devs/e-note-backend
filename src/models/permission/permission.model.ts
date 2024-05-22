import mongoose, { Document, mongo } from "mongoose";


interface IPermission extends Document {
    permission_name :string;
    is_default:string;
}

const permissionSchema = new mongoose.Schema<IPermission>(({
    permission_name:String,
    is_default:{
        type:String,
        default:"read",
        required:true
    }
}))

const permissionModel = mongoose.model("Permission",permissionSchema);
export default permissionModel;

 