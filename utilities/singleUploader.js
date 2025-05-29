const path = require('path');
const fs = require('fs');
const createError = require('http-errors');
const multer = require('multer');

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
      let { folderName } = req.body;

      if (!folderName) {
        if (['image/jpeg', 'image/jpg', 'image/png'].includes(file.mimetype)) {
          folderName = 'images';
        } else if (file.mimetype === 'application/pdf') {
          folderName = 'pdf';
        } else if (
          ['text/plain', 'application/msword'].includes(file.mimetype)
        ) {
          folderName = 'notes';
        } else {
          return cb(
            new Error('Unsupported file type and no folder name provided.'),
          );
        }
      }

      const folderPath = path.join(resolvedBasePath, folderName);
      req.folderPath1 = folderPath;

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

  const upload = multer({
    storage,
    limits: {
      fileSize: max_file_size,
    },
    fileFilter: (req, file, cb) => {
      if (allowed_file_types.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(createError(error_msg));
      }
    },
  });

  return upload;
}

module.exports = uploader;
