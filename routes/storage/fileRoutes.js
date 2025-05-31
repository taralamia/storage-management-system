const express = require('express');

const router = express.Router();

const authMiddleware = require('../../middlewares/users/authMiddleware');
const avatarUpload = require('../../middlewares/users/avatarUpload');
const pdfUpload = require('../../middlewares/users/pdfUpload');
const notesUpload = require('../../middlewares/users/notesUpload');

const {
  uploadImage,
  uploadPdf,
  uploadNotes,
  toggleFavorite,
  getFavoriteItems,
} = require('../../controllers/storageController');

// Unified endpoints for uploads
router.post('/upload/image', authMiddleware, avatarUpload, uploadImage);
router.post('/upload/pdf', authMiddleware, pdfUpload, uploadPdf);
router.post('/upload/notes', authMiddleware, notesUpload, uploadNotes);
// favorite functionality
router.post('/favorite/toggle', authMiddleware, toggleFavorite);
router.get('/favorites', authMiddleware, getFavoriteItems);
module.exports = router;
