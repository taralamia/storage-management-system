const path = require('path');
const fs = require('fs');
const createError = require('http-errors');
const multer = require('multer');

/**
 * @param {string} base_folder_path - usually "public"
 * @param {string[]} allowed_file_types - e.g., ["image/jpeg"]
 * @param {number} max_file_size - max size in bytes (e.g., 5MB = 5000000)
 * @param {string} error_msg - validation error message
 * @returns multer middleware
 */
function uploader(
  base_folder_path,
  allowed_file_types,
  max_file_size,
  error_msg,
) {
  const rootDir = path.resolve(__dirname, '..');
  const resolvedBasePath = path.join(rootDir, base_folder_path);

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const { folderName } = req.body;
      let folderPath;

      if (folderName) {
        folderPath = path.join(resolvedBasePath, 'folders', folderName); // User-defined folders
      } else {
        const mime = file.mimetype;

        if (['image/jpeg', 'image/jpg', 'image/png'].includes(mime)) {
          folderPath = path.join(resolvedBasePath, 'images');
        } else if (mime === 'application/pdf') {
          folderPath = path.join(resolvedBasePath, 'pdf');
        } else if (['text/plain', 'application/msword'].includes(mime)) {
          folderPath = path.join(resolvedBasePath, 'notes');
        } else {
          return cb(
            createError('Unsupported file type and no folder name provided.'),
          );
        }
      }

      // Save the resolved folder path for later use
      req.folderPath1 = folderPath;

      // Ensure folder exists
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      cb(null, folderPath);
    },

    filename: (req, file, cb) => {
      const fileExt = path.extname(file.originalname);
      const fileName = `${file.originalname
        .replace(fileExt, '')
        .toLowerCase()
        .split(' ')
        .join('-')}-${Date.now()}`;

      cb(null, fileName + fileExt);
    },
  });

  return multer({
    storage,
    limits: { fileSize: max_file_size },
    fileFilter: (req, file, cb) => {
      if (allowed_file_types.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(createError(error_msg));
      }
    },
  });
}

module.exports = uploader;
