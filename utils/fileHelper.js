// utils/fileHelpers.js
const fs = require('fs');
const path = require('path');

function findActualFileName(folderPath, fileName) {
  const folderFiles = fs.readdirSync(folderPath);
  const baseName = path
    .basename(fileName, path.extname(fileName))
    .toLowerCase()
    .replace(/\s+/g, '-');

  return (
    folderFiles.find((f) => {
      const fileNameWithoutExt = path
        .basename(f, path.extname(f))
        .toLowerCase();
      return fileNameWithoutExt.startsWith(baseName);
    }) || null
  );
}
module.exports = {
  findActualFileName,
};
