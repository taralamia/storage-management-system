const path = require('path');
const fs = require('fs');
const createError = require('http-errors');

const rootDir = path.resolve(__dirname, '..');
const basePath = path.join(rootDir, process.env.UPLOADS_BASE);

function resolveFolderPath(mimeType, folderName) {
  let folderPath;

  if (folderName) {
    folderPath = path.join(basePath, 'folders', folderName);
  } else {
    if (['image/jpeg', 'image/jpg', 'image/png'].includes(mimeType)) {
      folderPath = path.join(basePath, 'images');
    } else if (mimeType === 'application/pdf') {
      folderPath = path.join(basePath, 'pdf');
    } else if (['text/plain', 'application/msword'].includes(mimeType)) {
      folderPath = path.join(basePath, 'notes');
    } else {
      throw createError(400, 'Unsupported file type and no folder name provided.');
    }
  }

  // Ensure directory exists
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  return folderPath;
}

module.exports = resolveFolderPath;
