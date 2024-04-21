import multer from "multer";
import fs from "node:fs";
import path from "node:path";

/**
 * Generates a unique filename for the uploaded file.
 *
 * @param {Express.Request} req - The request object
 * @param {Express.Multer.File} file - The uploaded file
 * @param {Function} cb - The callback function
 * @return {void} Callback with the generated filename
 */

/**
 * Generates a unique filename for the uploaded file.
 *
 * @param {Express.Request} req - The request object
 * @param {Express.Multer.File} file - The uploaded file
 * @param {Function} cb - The callback function
 * @return {void} Callback with the generated filename
 */

const storage = multer.diskStorage({
   destination: function (req, file, cb) {
      const filePath: string = path.resolve(__dirname, "../../public/data");
      if (!fs.existsSync(filePath)) {
         fs.mkdir(filePath, { recursive: true }, (err) => {
            if (err) {
               console.log("directory doesn't exist");
            }
         });
      }
      cb(null, filePath);
   },

   filename: function (req, file, cb) {
      cb(null, file.fieldname + path.extname(file.originalname));
   },
});

const upload = multer({ storage: storage, limits: { fieldNameSize: 3e7 } });
export default upload;
