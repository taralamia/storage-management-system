const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/users/authMiddleware');
const {
  deleteItem,
  copyItem,
  renameItem,
} = require('../../controllers/fileOpsController');

router.delete('/delete/:id', authMiddleware, deleteItem);
router.post('/copy/:id', authMiddleware, copyItem);
router.put('/rename/:id', authMiddleware, renameItem);

module.exports = router;
