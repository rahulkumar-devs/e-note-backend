import mongoose from "mongoose";
import { config } from "./config";

const connectDB = async () => {
   try {
      mongoose.connection.once("connected", () => {
         console.log({
            message: `Database is Connected , `,
            host: `${mongoose.connection.host}`,
         });
      });

      mongoose.connection.on("error", (err: any) => {
         console.log("error in connected to db", err);
      });
      const isConnected = await mongoose.connect(config.mongoDB_uri);
   } catch (error: any) {
      console.error("Error connecting to the database:", error);
      process.exit(1);
   }
};

export default connectDB;
