const folderService = require('../services/folderService');

async function createFolder(req, res) {
  try {
    const { folderName } = req.body;
    const userId = req.user._id;

    if (!folderName) {
      return res.status(400).json({ error: 'Folder name is required' });
    }

    const folder = await folderService.createUserFolder(userId, folderName);
    res.status(201).json({ message: 'Folder created successfully', folder });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createFolder,
};
