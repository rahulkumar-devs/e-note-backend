import "dotenv/config"


// _config make it private
const _config ={
    port: process.env.PORT,
    mongoDB_uri : process.env.MONGODB_URI as string,
    env:process.env.NODE_ENV 
}

// freez _config so that noBody can overWrite
export const config = Object.freeze(_config);