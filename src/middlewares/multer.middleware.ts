import multer from "multer";
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
      cb(null, filePath);
   },

   filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix);
   },
});

const upload = multer({ storage: storage, limits: { fieldNameSize: 3e7 } });
export default upload;