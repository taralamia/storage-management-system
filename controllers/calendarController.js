const createError = require('http-errors');
const calendarService = require('../services/calendarService');

async function getCalendarView(req, res, next) {
  try {
    const userId = req.user._id;
        console.log('Fetching calendar items for user:', userId);

    const data = await calendarService.getItemsGroupedByDate(userId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(createError(500, 'Failed to fetch calendar items'));
  }
}

module.exports = { getCalendarView };
