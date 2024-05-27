module.exports = {
   app: [
      {
         name: "elib-backend-app",
         script: "./dist/server.js",
         instances: "max",
         exec_mode: "cluster",
         env: {
            NODE_ENV: "devlopment",
         },
         env_production: {
            NODE_ENV: "production",
         },
      },
   ],
};
