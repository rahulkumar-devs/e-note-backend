import Redis from "ioredis";
import { config } from "./config";

const redisClient = ()=>{
   if(config.redis_uri){
      console.log("Redis is connected");
      return config.redis_uri;
   }
   else{
      throw new Error("Redis connection failed")

   }
}

export const redis = new Redis(redisClient());