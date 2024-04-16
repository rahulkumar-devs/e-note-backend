import createHttpError from "http-errors";
import transporter from "../config/nodemailer.config";

export type mailOptType = {
   from: string;
   to: string;
   subject: string;
   text?: string;
   html?: string;
};

const sendMailer = async (mailOpt: mailOptType, otp?: string):Promise<void> => {
   try {
      const info = await transporter.sendMail(mailOpt);
      console.log("Message sent: %s", info.messageId);
   } catch (error: any) {
      const err = createHttpError(500, error);
      throw err;
   }
};

export default sendMailer;