const storageService = require('../services/storageService');

async function uploadImage(req, res, next) {
  try {
    const userId = req.user._id;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Pass control to service
    const savedFiles = await storageService.handleFileUpload({
      userId,
      files: req.files,
      folderPath: req.folderPath1,
    });

    res.status(200).json({
      message: 'Image(s) uploaded successfully!',
      files: savedFiles,
    });
  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({ error: 'Failed to upload image(s)' });
  }
}
async function uploadPdf(req, res, next) {
  try {
    const userId = req.user._id;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const savedFiles = await storageService.handleFileUpload({
      userId,
      files: req.files,
      folderPath: req.folderPath1,
    });

    res.status(200).json({
      message: 'PDF(s) uploaded successfully!',
      files: savedFiles,
    });
  } catch (error) {
    console.error('Upload PDF error:', error.message);
    res.status(500).json({ error: 'Failed to upload PDF(s)' });
  }
}
async function uploadNotes(req, res, next) {
  try {
    const userId = req.user._id;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const savedFiles = await storageService.handleFileUpload({
      userId,
      files: req.files,
      folderPath: req.folderPath1,
    });

    res.status(200).json({
      message: 'Note file(s) uploaded successfully!',
      files: savedFiles,
    });
  } catch (error) {
    console.error('Upload Notes error:', error.message);
    res.status(500).json({ error: 'Failed to upload note file(s)' });
  }
}

module.exports = {
  uploadImage,
  uploadPdf,
  uploadNotes,
};
