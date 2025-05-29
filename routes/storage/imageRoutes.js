const express = require('express');

const router = express.Router();

const avatarUpload = require('../../middlewares/users/avatarUpload');
const authMiddleware = require('../../middlewares/users/authMiddleware');
const { uploadImage } = require('../../controllers/storageController');

router.post('/upload/image', authMiddleware, avatarUpload, uploadImage);
module.exports = router;
