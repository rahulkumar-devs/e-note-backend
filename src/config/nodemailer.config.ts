import nodemailer from "nodemailer";
import { config } from "./config";


const transporter = nodemailer.createTransport({
    host: config.smtp_host,
    port: 465,
    secure: false,
    service : 'Gmail',
    requireTLS:true, 
    auth: {
      user: config.smtp_user,
      pass: config.smtp_password,
    },
  });

  export default transporter;