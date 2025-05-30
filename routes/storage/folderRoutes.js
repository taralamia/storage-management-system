const express = require('express');
const router = express.Router();

const { createFolder } = require('../../controllers/folderController');
const authMiddleware = require('../../middlewares/users/authMiddleware');

router.post('/folder/create', authMiddleware, createFolder);

module.exports = router;
