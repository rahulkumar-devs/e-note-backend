import "dotenv/config";

// _config make it private
const _config = {
   port: process.env.PORT,
   mongoDB_uri: process.env.MONGODB_URI as string,
   env: process.env.NODE_ENV,
   redis_uri: process.env.REDIS_URI,
   cloud_name: process.env.CLOUD_NAME,
   api_key: process.env.API_KEY,
   api_secret_key: process.env.API_SECRET_KEY,
   jwt_secret_key: process.env.JWT_SECRET_KEY as string,

   // google crediential
   google_client_id: process.env.GOOGLE_CLIENT_ID as string,
   google_client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
   express_session_secret_key: process.env.EXPRESS_SESSION_SECRET_KEY as string,

   //    tokens details
   access_token_key: process.env.REFRESH_TOKEN_KEY as string,
   refresh_token_key: process.env.ACCESS_TOKEN_KEY as string,
   access_token_expiry: process.env.REFRESH_TOKEN_EXPIRY as string,
   refresh_token_expiry: process.env.ACCESS_TOKEN_EXPIRY as string,
};

// freez _config so that noBody can overWrite
export const config = Object.freeze(_config);
