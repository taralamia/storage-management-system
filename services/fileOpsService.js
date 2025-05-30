const fs = require('fs');
const path = require('path');
const createError = require('http-errors');
const StorageFile = require('../models/StorageFile');
const Folder = require('../models/Folder');

async function deleteItem({ userId, itemId }) {
  const folder = await Folder.findOne({ _id: itemId, userId });
  if (folder) {
    const files = await StorageFile.find({ folderPath: folder.folderPath });

    await Promise.all(
      files.map((file) => {
        if (fs.existsSync(file.filePath)) {
          fs.unlinkSync(file.filePath);
        }
      }),
    );

    await StorageFile.deleteMany({ folderPath: folder.folderPath });

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
async function copyItem({ userId, itemId, itemType, targetFolderPath }) {
  if (itemType === 'file') {
    const file = await StorageFile.findOne({ _id: itemId, userId });
    if (!file) throw createError(404, 'File not found');

    const folderFiles = fs.readdirSync(file.folderPath);
    const baseName = path
      .basename(file.fileName, path.extname(file.fileName))
      .toLowerCase()
      .replace(/\s+/g, '-');

    const matchedFile = folderFiles.find((f) => {
      const fileNameWithoutExt = path
        .basename(f, path.extname(f))
        .toLowerCase();
      return fileNameWithoutExt.startsWith(baseName);
    });

    if (!matchedFile) {
      throw createError(
        404,
        `Matching file not found in folder: ${file.folderPath}`,
      );
    }

    const actualFilePath = path.join(file.folderPath, matchedFile);
    const newFileName = `Copy of ${file.fileName}`;
    const newFilePath = path.join(
      targetFolderPath || file.folderPath,
      newFileName,
    );

    fs.copyFileSync(actualFilePath, newFilePath);

    const newFile = new StorageFile({
      ...file.toObject(),
      _id: undefined,
      fileName: newFileName,
      filePath: newFilePath,
      folderPath: targetFolderPath || file.folderPath,
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

    fs.mkdirSync(newFolderPath, { recursive: true });

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
        const folderFiles = fs.readdirSync(file.folderPath);
        const baseName = path
          .basename(file.fileName, path.extname(file.fileName))
          .toLowerCase()
          .replace(/\s+/g, '-');

        const matchedFile = folderFiles.find((f) => {
          const fileNameWithoutExt = path
            .basename(f, path.extname(f))
            .toLowerCase();
          return fileNameWithoutExt.startsWith(baseName);
        });

        if (!matchedFile) {
          console.warn(`Skipping file not found on disk: ${file.fileName}`);
          return;
        }

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

    const { folderPath } = file;
    const ext = path.extname(file.fileName);
    const newFileName = newName.endsWith(ext) ? newName : newName + ext;

    // Handle case where file name on disk has timestamp/slug
    const baseName = path
      .basename(file.fileName, ext)
      .toLowerCase()
      .replace(/\s+/g, '-');

    const folderFiles = fs.readdirSync(folderPath);
    const matchedFileName = folderFiles.find((f) => {
      const name = path.basename(f, path.extname(f)).toLowerCase();
      return name.startsWith(baseName);
    });

    if (!matchedFileName) {
      throw createError(404, 'File not found in folder');
    }

    const actualFilePath = path.join(folderPath, matchedFileName);
    const newFilePath = path.join(folderPath, newFileName);

    // Rename file on disk
    fs.renameSync(actualFilePath, newFilePath);

    // Update in DB
    file.fileName = newFileName;
    file.filePath = newFilePath;
    await file.save();

    return { message: 'File renamed successfully', item: file };
  }

  if (itemType === 'folder') {
    const folder = await Folder.findOne({ _id: itemId, userId });
    if (!folder) throw createError(404, 'Folder not found');

    const newFolderPath = path.join(path.dirname(folder.folderPath), newName);
    fs.renameSync(folder.folderPath, newFolderPath);

    const files = await StorageFile.find({ folderPath: folder.folderPath });

    await Promise.all(
      files.map(async (file) => {
        file.folderPath = newFolderPath;
        file.filePath = path.join(newFolderPath, path.basename(file.filePath));
        await file.save();
      }),
    );

    folder.folderName = newName;
    folder.folderPath = newFolderPath;
    await folder.save();

    return { message: 'Folder renamed successfully', item: folder };
  }

  throw createError(400, 'Invalid itemType');
}

module.exports = {
  deleteItem,
  copyItem,
  renameItem,
};
