const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken'); // <-- Añade esta línea
const router = express.Router();

// Google OAuth route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar.readonly'] }));

// Google callback - ahora crea un JWT
router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', (err, user, info) => {
    if (err || !user) {
      console.error('Error en autenticación de Google:', err);
      return res.redirect(`${process.env.FRONTEND_URL}/login`);
    }
    
    // Creamos el payload para el JWT
    const payload = {
      id: user.profile.id,
      displayName: user.profile.displayName,
      email: user.profile.emails[0].value,
      accessToken: user.accessToken // Guardamos el token de Google aquí
    };

    // Firmamos el token
    const token = jwt.sign(payload, process.env.SESSION_SECRET, { expiresIn: '24h' });

    // Redirigimos al frontend con el token en la URL
    return res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
  })(req, res, next);
});

// Nueva ruta para verificar el token
router.get('/verify-token', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.SESSION_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.json({ user: decoded });
  });
});

router.get('/logout', (req, res) => {
  // En un sistema sin estado, el logout es una acción del cliente (borrar el token)
  res.json({ message: 'Logout successful. Please clear token on client.' });
});

module.exports = router;
