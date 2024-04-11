import { createClient } from "redis";

const redisConnection = async () => {
   const client = createClient({
      url: "rediss://default:bd95d60f68034a8993116340b88589a1@ample-sole-45561.upstash.io:45561",
   });

   client.on("error", (err) => console.log("Redis Client Error", err));

   // Connect to Redis
   client
      .connect()
      .then(() => console.log("Connected to Redis"))
      .catch((err) => console.log("Failed to connect to Redis", err));
};

export default redisConnection;
