const express = require('express');

const router = express.Router();

// Auth routes
const localRoutes = require('./auth/localRoutes');
const googleRoutes = require('./auth/googleRoutes');
// Storage routes
const imageRoutes = require('./storage/imageRoutes');
const pdfRoutes = require('./storage/pdfRoutes');
const noteRoutes = require('./storage/notesRoutes');
const folderRoutes = require('./storage/folderRoutes');
const infoRoutes = require('./storage/infoRoutes');

// Mount under /v1/auth
router.use('/v1/auth', localRoutes);
router.use('/v1/auth', googleRoutes);

// Mount under /v1/storage
router.use('/v1/storage', imageRoutes);
router.use('/v1/storage', pdfRoutes);
router.use('/v1/storage', noteRoutes);
router.use('/v1/storage', folderRoutes);
router.use('/v1/storage', infoRoutes);
module.exports = router;
