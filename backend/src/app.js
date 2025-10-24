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
const PORT = process.env.PORT || 3100;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL, // Debe ser tu URL pública
  credentials: true // <-- ¡MUY IMPORTANTE! Permite el envío de cookies
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  proxy: true, // Confía en el proxy inverso (Nginx)
  cookie: {
    domain: '.pomodoro.infociber.cl', // <-- ¡CLAVE! Define explícitamente el dominio
    path: '/', // La cookie es válida para todo el sitio
    secure: true, // Solo por HTTPS
    httpOnly: true, // No accesible por JavaScript
    sameSite: 'none', // <-- ¡CAMBIO IMPORTANTE! Requerido para cross-site con proxy
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
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
  callbackURL: `${process.env.PUBLIC_URL}/auth/google/callback`
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
