import app from "./src/app";

const startServer = () => {
   const port = process.env.PORT || 3000;
   app.listen(port, () => {
      console.log(`server is Running on ${port}`);
   });
};
startServer();
