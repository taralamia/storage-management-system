const express = require('express');

const router = express.Router();

// Auth routes
const localRoutes = require('./auth/localRoutes');
const googleRoutes = require('./auth/googleRoutes');
// Storage routes

const folderRoutes = require('./storage/folderRoutes');
const infoRoutes = require('./storage/infoRoutes');
const fileRoutes = require('./storage/fileRoutes');
// Mount under /v1/auth
router.use('/v1/auth', localRoutes);
router.use('/v1/auth', googleRoutes);

// Mount under /v1/storage
router.use('/v1/storage', fileRoutes);
router.use('/v1/storage', folderRoutes);
router.use('/v1/storage', infoRoutes);
module.exports = router;
