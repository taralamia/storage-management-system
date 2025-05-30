const createError = require('http-errors');
const storageService = require('../services/storageService');

async function uploadHandler(req, res, next, fileType) {
  try {
    const userId = req.user._id;

    if (!req.files || req.files.length === 0) {
      return next(createError(400, 'No files uploaded'));
    }

    const savedFiles = await storageService.handleFileUpload({
      userId,
      files: req.files,
      folderPath: req.folderPath1,
    });

    res.status(200).json({
      message: `${fileType} file(s) uploaded successfully!`,
      files: savedFiles,
    });
  } catch (err) {
    // This automatically logs & formats error in errorHandler
    next(createError(500, `Failed to upload ${fileType} file(s)`));
  }
}

async function uploadImage(req, res, next) {
  return uploadHandler(req, res, next, 'Image');
}

async function uploadPdf(req, res, next) {
  return uploadHandler(req, res, next, 'PDF');
}

async function uploadNotes(req, res, next) {
  return uploadHandler(req, res, next, 'Note');
}

module.exports = {
  uploadImage,
  uploadPdf,
  uploadNotes,
};
