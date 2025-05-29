const storageInfoService = require('../services/storageInfoService');

async function getStorageInfo(req, res) {
  try {
    const userId = req.user._id;
    const result = await storageInfoService.calculateUserStorageInfo(userId);
    res.status(200).json(result);
  } catch (err) {
    console.error('Error in getStorageInfo:', err);
    res.status(500).json({ error: 'Failed to calculate storage usage' });
  }
}

const getRecentItems = async (req, res) => {
  try {
    const userId = req.user._id;
    const recentItems = await storageInfoService.fetchRecentItems(userId);
    res.status(200).json({ success: true, recent: recentItems });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: 'Failed to fetch recent items' });
  }
};
module.exports = {
  getStorageInfo,
  getRecentItems,
};
