const express = require('express');
const passport = require('passport');
const router = express.Router();

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar.readonly'] }));

// VIEJA VERSIÓN (reemplázala por completo)
/*
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3101'}/dashboard`);
  }
);
*/

// NUEVA VERSIÓN (más robusta)
router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', (err, user, info) => {
    if (err) {
      console.error('Error en autenticación de Google:', err);
      return next(err);
    }
    if (!user) {
      console.log('Autenticación de Google fallida, usuario no encontrado.');
      return res.redirect(`${process.env.FRONTEND_URL}/login`);
    }
    
    // Este es el paso clave: iniciar la sesión manualmente
    req.logIn(user, (err) => {
      if (err) {
        console.error('Error al iniciar sesión (req.logIn):', err);
        return next(err);
      }
      
      // ¡Éxito! La sesión debería estar establecida.
      console.log('Sesión iniciada correctamente para el usuario:', user.profile.displayName);
      console.log('Objeto de sesión:', req.session); // Línea de depuración

      // Ahora redirigimos al frontend
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    });
  })(req, res, next);
});

router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) { return next(err); }
    req.session.destroy();
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3101'}`);
  });
});

router.get('/current_user', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.user);
});

module.exports = router;
