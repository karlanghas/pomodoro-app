const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const calendarRoutes = require('./routes/calendar');
const wekanRoutes = require('./routes/wekan');
const pomodoroRoutes = require('./routes/pomodoro');
const taskRoutes = require('./routes/tasks');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL || 'http://localhost:3000'}/auth/google/callback`
},
(accessToken, refreshToken, profile, done) => {
  // Save user profile to session
  return done(null, { profile, accessToken, refreshToken });
}
));

// Routes
app.use('/auth', authRoutes);
app.use('/calendar', calendarRoutes);
app.use('/wekan', wekanRoutes);
app.use('/pomodoro', pomodoroRoutes);
app.use('/tasks', taskRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});