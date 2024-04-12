import app from "./src/app";
import { config } from "./src/config/config";
import connectDB from "./src/config/db.config";
import "./src/config/redis.config";

const startServer = async () => {
   const port = config.port || 3000;

   await connectDB();
   app.listen(port, () => {
      console.log({ message: `server is Running `, port: port });
   });
};

startServer();
