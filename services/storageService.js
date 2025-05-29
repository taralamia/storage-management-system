const path = require('path');
const fs = require('fs');
const StorageFile = require('../models/StorageFile');

const rootDir = path.resolve(__dirname, '..');
const uploadsBasePath = path.join(rootDir, process.env.UPLOADS_BASE);
function resolveUploadFolder(file, folderNameFromReq) {
  let folderPath;

  if (folderNameFromReq) {
    folderPath = path.join(uploadsBasePath, 'folders', folderNameFromReq);
  } else {
    const mime = file.mimetype;
    if (['image/jpeg', 'image/jpg', 'image/png'].includes(mime)) {
      folderPath = path.join(uploadsBasePath, 'images');
    } else if (mime === 'application/pdf') {
      folderPath = path.join(uploadsBasePath, 'pdf');
    } else if (['text/plain', 'application/msword'].includes(mime)) {
      folderPath = path.join(uploadsBasePath, 'notes');
    } else {
      throw new Error('Unsupported file type and no folder name provided.');
    }
  }

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  console.log('Resolved folder path:', folderPath);
  return folderPath;
}

async function handleFileUpload({ userId, files, folderPath }) {
  const uploads = files.map(async (file) => {
    const newFile = new StorageFile({
      userId,
      fileName: file.originalname,
      filePath: path.join(folderPath, file.originalname),
      fileType: file.mimetype,
      folderPath,
      image: {
        data: null,
        contentType: file.mimetype,
      },
    });

    await newFile.save();
    return newFile;
  });

  return Promise.all(uploads);
}

module.exports = {
  resolveUploadFolder,
  handleFileUpload,
};
