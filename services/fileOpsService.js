const fs = require('fs');
const path = require('path');
const createError = require('http-errors');
const StorageFile = require('../models/StorageFile');
const Folder = require('../models/Folder');
const { findActualFileName } = require('../utils/fileHelper');

const baseStoragePath = path.resolve(__dirname, '../public');
function isPathInsideBase(base, target) {
  const relative = path.relative(base, path.resolve(target));
  return !relative.startsWith('..') && !path.isAbsolute(relative);
}
async function deleteItem({ userId, itemId }) {
  const folder = await Folder.findOne({ _id: itemId, userId });
  if (folder) {
    const files = await StorageFile.find({
      folderPath: folder.folderPath,
      userId,
    });

    await Promise.all(
      files.map((file) => {
        if (fs.existsSync(file.filePath)) {
          fs.unlinkSync(file.filePath);
        }
      }),
    );

    await StorageFile.deleteMany({ folderPath: folder.folderPath, userId });

    if (fs.existsSync(folder.folderPath)) {
      fs.rmSync(folder.folderPath, { recursive: true });
    }

    await Folder.deleteOne({ _id: itemId });
    return { message: 'Folder and its contents deleted successfully' };
  }

  const file = await StorageFile.findOne({ _id: itemId, userId });
  if (file) {
    if (fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath);
    }
    await StorageFile.deleteOne({ _id: itemId });
    return { message: 'File deleted successfully' };
  }

  throw createError(404, 'Item not found');
}
function copyFolderRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  fs.readdirSync(src, { withFileTypes: true }).forEach((entry) => {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyFolderRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

async function copyItem({ userId, itemId, itemType, targetFolderPath }) {
  const safeTargetPath = targetFolderPath || baseStoragePath;

  if (!isPathInsideBase(baseStoragePath, safeTargetPath)) {
    throw createError(400, 'Invalid or unsafe folder path');
  }

  if (itemType === 'file') {
    const file = await StorageFile.findOne({ _id: itemId, userId });
    if (!file) throw createError(404, 'File not found');

    const matchedFile = findActualFileName(file.folderPath, file.fileName);
    if (!matchedFile) {
      throw createError(404, `File not found on disk for ${file.fileName}`);
    }

    const actualFilePath = path.join(file.folderPath, matchedFile);
    const newFileName = `Copy of ${file.fileName}`;
    const newFilePath = path.join(safeTargetPath, newFileName);

    fs.copyFileSync(actualFilePath, newFilePath);

    const newFile = new StorageFile({
      ...file.toObject(),
      _id: undefined,
      fileName: newFileName,
      filePath: newFilePath,
      folderPath: safeTargetPath,
      originalFileId: file._id,
    });

    await newFile.save();
    return { message: 'File copied successfully', item: newFile };
  }

  if (itemType === 'folder') {
    const folder = await Folder.findOne({ _id: itemId, userId });
    if (!folder) throw createError(404, 'Folder not found');

    const newFolderName = `Copy of ${folder.folderName}`;
    const newFolderPath = path.join(
      path.dirname(folder.folderPath),
      newFolderName,
    );

    if (!isPathInsideBase(baseStoragePath, newFolderPath)) {
      throw createError(400, 'Unsafe folder path');
    }

    copyFolderRecursive(folder.folderPath, newFolderPath);

    const newFolder = new Folder({
      ...folder.toObject(),
      _id: undefined,
      folderName: newFolderName,
      folderPath: newFolderPath,
    });
    await newFolder.save();

    const files = await StorageFile.find({ folderPath: folder.folderPath });

    await Promise.all(
      files.map(async (file) => {
        const matchedFile = findActualFileName(file.folderPath, file.fileName);
        if (!matchedFile) return;

        const actualFilePath = path.join(file.folderPath, matchedFile);
        const newFilePath = path.join(newFolderPath, file.fileName);

        fs.copyFileSync(actualFilePath, newFilePath);

        const copiedFile = new StorageFile({
          ...file.toObject(),
          _id: undefined,
          filePath: newFilePath,
          folderPath: newFolderPath,
          originalFileId: file._id,
        });

        await copiedFile.save();
      }),
    );

    return { message: 'Folder copied successfully', item: newFolder };
  }

  throw createError(400, 'Invalid itemType');
}
async function renameItem({ userId, itemId, itemType, newName }) {
  if (itemType === 'file') {
    const file = await StorageFile.findOne({ _id: itemId, userId });
    if (!file) throw createError(404, 'File not found');

    const ext = path.extname(file.fileName);
    const newFileName = newName.endsWith(ext) ? newName : newName + ext;

    const matchedFileName = findActualFileName(file.folderPath, file.fileName);
    if (!matchedFileName) throw createError(404, 'File not found on disk');

    const actualFilePath = path.join(file.folderPath, matchedFileName);
    const newFilePath = path.join(file.folderPath, newFileName);

    fs.renameSync(actualFilePath, newFilePath);

    file.fileName = newFileName;
    file.filePath = newFilePath;
    await file.save();

    return { message: 'File renamed successfully', item: file };
  }

  if (itemType === 'folder') {
    const folder = await Folder.findOne({ _id: itemId, userId });
    if (!folder) throw createError(404, 'Folder not found');

    const oldFolderPath = folder.folderPath;
    const newFolderPath = path.join(path.dirname(oldFolderPath), newName);
    fs.renameSync(oldFolderPath, newFolderPath);

    folder.folderName = newName;
    folder.folderPath = newFolderPath;
    await folder.save();

    const allFiles = await StorageFile.find({
      userId,
      filePath: { $regex: `^${oldFolderPath.replace(/\\/g, '\\\\')}` },
    });

    await Promise.all(
      allFiles.map(async (file) => {
        file.filePath = file.filePath.replace(oldFolderPath, newFolderPath);
        file.folderPath = file.folderPath.replace(oldFolderPath, newFolderPath);
        await file.save();
      }),
    );

    const nestedFolders = await Folder.find({
      userId,
      folderPath: { $regex: `^${oldFolderPath.replace(/\\/g, '\\\\')}` },
    });

    await Promise.all(
      nestedFolders.map(async (subFolder) => {
        subFolder.folderPath = subFolder.folderPath.replace(
          oldFolderPath,
          newFolderPath,
        );
        await subFolder.save();
      }),
    );

    return {
      message: 'Folder renamed successfully (with nested items)',
      item: folder,
    };
  }

  throw createError(400, 'Invalid itemType');
}
module.exports = {
  deleteItem,
  copyItem,
  renameItem,
};
