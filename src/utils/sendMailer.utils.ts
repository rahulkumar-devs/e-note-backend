import path from "path";
import ejs from "ejs";
import { config } from "../config/config";
import transporter from "../config/nodemailer.config";

export interface IEmailOptions {
   email: string;
   subject: string;
   template: string;
   data: { [key: string]: any };
}

/**
 * Sends an email using the provided options.
 *
 * @param {IEmailOptions} options - Object containing email details such as email, subject, template, and data.
 * @return {Promise<void>} - Resolves when the email is sent successfully.
 */
const sendMailer = async (options: IEmailOptions): Promise<void> => {
   try {
      const { email, subject, template, data } = options;

      // Get the path to the email template file
      const templatePath = path.join(__dirname, "../mails", template);
      console.log("Template Path:", templatePath);

      // Render the email template with provided data
      const html = await ejs.renderFile(templatePath, data);

      const mailOptions = {
         from: config.smtp_user,
         to: email,
         subject,
         html,
      };

      // Send the email using nodemailer transporter
      await transporter.sendMail(mailOptions);

      console.log("Email sent successfully");
   } catch (error) {
      console.error("Failed to send email:", error);
      throw new Error("Failed to send email");
   }
};

export default sendMailer;
