const express = require('express');

const router = express.Router();

const pdfUpload = require('../../middlewares/users/pdfUpload');
const authMiddleware = require('../../middlewares/users/authMiddleware');
const {uploadPdf} = require('../../controllers/storageController');

router.post('/upload/pdf', authMiddleware, pdfUpload, uploadPdf);
module.exports = router;
