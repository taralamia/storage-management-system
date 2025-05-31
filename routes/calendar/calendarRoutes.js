const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/users/authMiddleware');
const { getCalendarView } = require('../../controllers/calendarController');

router.get('/items', authMiddleware, getCalendarView);

module.exports = router;
