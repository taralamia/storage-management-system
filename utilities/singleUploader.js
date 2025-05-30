const path = require('path');
const multer = require('multer');
const createError = require('http-errors');
const resolveFolderPath = require('../utils/folderResolver');

function uploader(baseFolderPath, allowedFileTypes, maxFileSize, errorMsg) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      try {
        const folderPath = resolveFolderPath(file.mimetype, req.body.folderName);
        req.folderPath1 = folderPath;
        cb(null, folderPath);
      } catch (err) {
        cb(err);
      }
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
    limits: { fileSize: maxFileSize },
    fileFilter: (req, file, cb) => {
      if (allowedFileTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(createError(errorMsg));
      }
    },
  });
}

module.exports = uploader;
