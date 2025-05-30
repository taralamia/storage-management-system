const fs = require('fs');
const path = require('path');
const StorageFile = require('../models/StorageFile');
const Folder = require('../models/Folder');

async function calculateUserStorageInfo(userId) {
  const files = await StorageFile.find({ userId });
  const folders = await Folder.find({ userId });

  let totalUsed = 0;
  let pdfCount = 0;
  let imageCount = 0;
  let noteCount = 0;
  let folderFileCount = 0;

  files.forEach((file) => {
    if (fs.existsSync(file.filePath)) {
      const stats = fs.statSync(file.filePath);
      totalUsed += stats.size;
    }

    const type = file.fileType;

    if (type === 'application/pdf') {
      pdfCount++;
    } else if (['image/jpeg', 'image/jpg', 'image/png'].includes(type)) {
      imageCount++;
    } else if (
      [
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ].includes(type)
    ) {
      noteCount++;
    }

    if (file.folderPath.includes(path.join('public', 'folders'))) {
      folderFileCount++;
    }
  });

  const totalStorage = 15 * 1024 * 1024 * 1024;
  const availableStorage = totalStorage - totalUsed;

  return {
    totalStorage: `${(totalStorage / 1024 ** 3).toFixed(2)} GB`,
    usedStorage: `${(totalUsed / 1024 ** 3).toFixed(2)} GB`,
    availableStorage: `${(availableStorage / 1024 ** 3).toFixed(2)} GB`,
    fileSummary: {
      images: imageCount,
      pdfs: pdfCount,
      notes: noteCount,
      totalFiles: pdfCount + imageCount + noteCount,
    },
    folderSummary: {
      totalFolders: folders.length,
      totalFilesInFolders: folderFileCount,
    },
  };
}
const fetchRecentItems = async (userId) => {
  const recentFiles = await StorageFile.find({ userId })
    .sort({ uploadDate: -1 })
    .limit(5)
    .lean();

  const recentFolders = await Folder.find({ userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  return { files: recentFiles, folders: recentFolders };
};

module.exports = {
  calculateUserStorageInfo,
  fetchRecentItems,
};
