const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/users/authMiddleware');
const {
  deleteItem,
  copyItem,
  renameItem,
} = require('../../controllers/fileOpsController');

router.delete('/:id/delete', authMiddleware, deleteItem);
router.post('/:id/copy', authMiddleware, copyItem);
router.put('/:id/rename', authMiddleware, renameItem);

module.exports = router;
