const StorageFile = require('../models/StorageFile');
const Folder = require('../models/Folder');

async function getItemsGroupedByDate(userId) {
  const [files, folders] = await Promise.all([
    StorageFile.find({ userId }),
    Folder.find({ userId }),
  ]);

  console.log("📁 Fetched files:", files.length);
  console.log("📂 Fetched folders:", folders.length);

  const combinedItems = [
    ...files.map((file) => ({
      _id: file._id,
      name: file.fileName,
      type: 'file',
      date: file.uploadDate,
    })),
    ...folders.map((folder) => ({
      _id: folder._id,
      name: folder.folderName,
      type: 'folder',
      date: folder.createdAt,
    })),
  ];

  const grouped = {};

  combinedItems.forEach((item) => {
    const dateKey = item.date.toISOString().split('T')[0]; // format YYYY-MM-DD
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(item);
  });

  // Return groups in descending date order
  return Object.fromEntries(
    Object.entries(grouped).sort((a, b) => new Date(b[0]) - new Date(a[0]))
  );
}

module.exports = {
  getItemsGroupedByDate,
};
