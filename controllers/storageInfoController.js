const createError = require('http-errors');
const storageInfoService = require('../services/storageInfoService');

async function getStorageInfo(req, res, next) {
  try {
    const userId = req.user._id;
    const result = await storageInfoService.calculateUserStorageInfo(userId);
    res.status(200).json(result);
  } catch (err) {
    next(createError(500, 'Failed to calculate storage usage'));
  }
}

const getRecentItems = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const recentItems = await storageInfoService.fetchRecentItems(userId);
    res.status(200).json({ success: true, recent: recentItems });
  } catch (error) {
    next(createError(500, 'Failed to fetch recent items'));
  }
};

module.exports = {
  getStorageInfo,
  getRecentItems,
};
