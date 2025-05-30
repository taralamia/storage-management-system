const createError = require('http-errors');
const folderService = require('../services/folderService');

async function createFolder(req, res, next) {
  try {
    const { folderName } = req.body;
    const userId = req.user._id;

    if (!folderName) {
      return next(createError(400, 'Folder name is required'));
    }

    const folder = await folderService.createUserFolder(userId, folderName);

    res.status(201).json({
      message: 'Folder created successfully',
      folder,
    });
  } catch (error) {
    next(
      createError(
        error.status || 500,
        error.message || 'Failed to create folder',
      ),
    );
  }
}

module.exports = {
  createFolder,
};
