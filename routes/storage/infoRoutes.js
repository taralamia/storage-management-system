const express = require('express');

const router = express.Router();
const authMiddleware = require('../../middlewares/users/authMiddleware');
const {
  getStorageInfo,
  getRecentItems,
} = require('../../controllers/getStorageInfo');

router.get('/info/usage', authMiddleware, getStorageInfo);
router.get('/info/recent', authMiddleware, getRecentItems);
module.exports = router;
