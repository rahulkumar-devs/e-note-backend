import "dotenv/config"


// _config make it private
const _config ={
    port: process.env.PORT,
    mongoDB_uri : process.env.MONGODB_URI as string,
    env:process.env.NODE_ENV ,
    redis_uri : process.env.REDIS_URI,
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret_key:process.env.API_SECRET_KEY

}

// freez _config so that noBody can overWrite
export const config = Object.freeze(_config);