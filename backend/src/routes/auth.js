const express = require('express');
const passport = require('passport');
const router = express.Router();

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar.readonly'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect to frontend
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/auth/success`);
  }
);

router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) { return next(err); }
    req.session.destroy();
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}`);
  });
});

router.get('/current_user', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.user);
});

module.exports = router;