import "dotenv/config"


// _config make it private
const _config ={
    port: process.env.PORT
}

// freez _config so that noBody can overWrite
export const config = Object.freeze(_config);