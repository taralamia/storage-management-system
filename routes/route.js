const express = require('express');

const router = express.Router();

// Auth routes
const localRoutes = require('./auth/localRoutes');
const googleRoutes = require('./auth/googleRoutes');

// Mount under /v1/auth
router.use('/v1/auth', localRoutes);
router.use('/v1/auth', googleRoutes);
// Storage routes
const imageRoutes = require('./storage/imageRoutes');
const pdfRoutes = require('./storage/pdfRoutes');

const noteRoutes = require('./storage/notesRoutes');

router.use('/v1/storage', imageRoutes);
router.use('/v1/storage', pdfRoutes);
router.use('/v1/storage',noteRoutes);
module.exports = router;
