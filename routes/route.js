const express = require('express');
const router = express.Router();

// Import modular routes
const localRoutes = require('./auth/localRoutes');
const googleRoutes = require('./auth/googleRoutes');

// Mount under /v1/auth
router.use('/v1/auth', localRoutes);
router.use('/v1/auth', googleRoutes);

module.exports = router;
