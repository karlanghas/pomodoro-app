const express = require('express');
const router = express.Router();

// Get current Pomodoro session
router.get('/session', (req, res) => {
  // In a real app, this would fetch from a database
  // For simplicity, returning a mock session
  res.json({
    isActive: false,
    isBreak: false,
    timeRemaining: 25 * 60, // 25 minutes in seconds
    currentTask: null
  });
});

// Start a Pomodoro session
router.post('/start', (req, res) => {
  const { taskId, isBreak } = req.body;
  
  // In a real app, this would save to a database
  // For simplicity, returning a mock response
  res.json({
    success: true,
    session: {
      isActive: true,
      isBreak: isBreak || false,
      timeRemaining: isBreak ? 5 * 60 : 25 * 60, // 5 min break or 25 min work
      currentTask: taskId
    }
  });
});

// Pause a Pomodoro session
router.post('/pause', (req, res) => {
  // In a real app, this would update the database
  res.json({
    success: true,
    session: {
      isActive: false,
      isBreak: false,
      timeRemaining: 25 * 60,
      currentTask: null
    }
  });
});

// Reset a Pomodoro session
router.post('/reset', (req, res) => {
  // In a real app, this would update the database
  res.json({
    success: true,
    session: {
      isActive: false,
      isBreak: false,
      timeRemaining: 25 * 60,
      currentTask: null
    }
  });
});

module.exports = router;