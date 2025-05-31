const path = require('path');
const fs = require('fs');
const createError = require('http-errors');
const StorageFile = require('../models/StorageFile');
const resolveFolderPath = require('../utils/folderResolver');
const Folder = require('../models/Folder');

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
async function toggleFavoriteItem({
  userId,
  itemId,
  itemType,
  applyToContents = false,
}) {
  const Model = itemType === 'folder' ? Folder : StorageFile;

  const item = await Model.findOne({ _id: itemId, userId });
  if (!item) throw createError(404, `${itemType} not found`);

  // Toggle the favorite status
  item.isFavorite = !item.isFavorite;
  await item.save();

  // If the item is a folder and we want to update its contents
  if (itemType === 'folder' && applyToContents) {
    const { folderPath } = item;

    await StorageFile.updateMany(
      { userId, folderPath },
      { $set: { isFavorite: item.isFavorite } },
    );
  }

  return item;
}
async function getFavorites(userId) {
  const favoriteFiles = await StorageFile.find({ userId, isFavorite: true });
  const favoriteFolders = await Folder.find({ userId, isFavorite: true });

  return {
    favoriteFiles,
    favoriteFolders,
  };
}
module.exports = {
  resolveUploadFolder,
  handleFileUpload,
  toggleFavoriteItem,
  getFavorites,
};
