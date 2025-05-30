const path = require('path');
const fs = require('fs');
const createError = require('http-errors');
const StorageFile = require('../models/StorageFile');
const resolveFolderPath = require('../utils/folderResolver');

function resolveUploadFolder(file, folderNameFromReq) {
  return resolveFolderPath(file.mimetype, folderNameFromReq);
}

async function handleFileUpload({ userId, files, folderPath }) {
  try {
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
  } catch (err) {
    throw createError(500, 'File upload failed');
  }
}

module.exports = {
  resolveUploadFolder,
  handleFileUpload,
};
