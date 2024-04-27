import Redis from "ioredis";
import { config } from "./config";

const redisClient = () => {
   if (config.redis_uri) {
      console.log({ message: "Redis is connected" });
      return config.redis_uri;
   } else {
      console.error("Redis connection failed");
      process.exit(1);
    
   }
};

export const redis = new Redis(redisClient());
