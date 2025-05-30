const path = require('path');
const fs = require('fs');
const createError = require('http-errors');
const Folder = require('../models/Folder');

const rootDir = path.resolve(__dirname, '..');
const foldersBasePath = path.join(rootDir, 'public', 'folders');

async function createUserFolder(userId, folderName) {
  const folderPath = path.join(foldersBasePath, folderName);

  const existing = await Folder.findOne({ userId, folderName });
  if (existing) {
    throw createError(400, 'Folder already exists');
  }

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const folder = new Folder({
    userId,
    folderName,
    folderPath,
  });

  await folder.save();
  return folder;
}

module.exports = {
  createUserFolder,
};
