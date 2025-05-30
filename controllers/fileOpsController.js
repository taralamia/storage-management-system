const createError = require('http-errors');
const fileOpsService = require('../services/fileOpsService');
const Folder = require('../models/Folder');

async function deleteItem(req, res, next) {
  try {
    const { id: itemId } = req.params;
    const userId = req.user._id;

    const result = await fileOpsService.deleteItem({ userId, itemId });

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    next(err);
  }
}
async function copyItem(req, res, next) {
  try {
    const { id: itemId } = req.params;
    const { itemType, targetFolderPath } = req.body;
    const userId = req.user._id;

    if (!itemType) {
      return next(createError(400, 'itemType is required'));
    }

    const result = await fileOpsService.copyItem({
      userId,
      itemId,
      itemType,
      targetFolderPath,
    });

    res.status(200).json({
      success: true,
      message: result.message,
      item: result.item,
    });
  } catch (err) {
    next(err);
  }
}

async function renameItem(req, res, next) {
  try {
    const { id: itemId } = req.params;
    const { itemType, newName } = req.body;
    const userId = req.user._id;

    if (!itemType || !newName) {
      return next(createError(400, 'itemType and newName are required'));
    }

    const result = await fileOpsService.renameItem({
      userId,
      itemId,
      itemType,
      newName,
    });

    res.status(200).json({
      success: true,
      message: result.message,
      item: result.item,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  deleteItem,
  copyItem,
  renameItem,
};
