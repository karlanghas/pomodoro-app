const express = require('express');
const { google } = require('googleapis');
const router = express.Router();

// Get study events from Google Calendar
router.get('/study-events', async (req, res) => {
  try {
    if (!req.user || !req.user.accessToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: req.user.accessToken });

    const calendar = google.calendar({ version: 'v3', auth });
    
    // Get events from the specified calendar
    const response = await calendar.events.list({
      calendarId: process.env.STUDY_CALENDAR_ID || 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items.map(event => ({
      id: event.id,
      summary: event.summary,
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      description: event.description || ''
    }));

    res.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

module.exports = router;