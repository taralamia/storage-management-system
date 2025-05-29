const express = require('express');

const router = express.Router();

const notesUpload = require('../../middlewares/users/notesUpload');
const authMiddleware = require('../../middlewares/users/authMiddleware');
const { uploadNotes } = require('../../controllers/storageController');

router.post('/upload/notes', authMiddleware, notesUpload, uploadNotes);
module.exports = router;
