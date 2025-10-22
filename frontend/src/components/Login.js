import React from 'react';
import { Container, Box, Typography, Button, Paper } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';

const Login = () => {
  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            App Pomodoro
          </Typography>
          <Typography variant="body1" align="center" sx={{ mb: 3 }}>
            Inicia sesión con tu cuenta de Google para acceder a la aplicación
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              sx={{ textTransform: 'none' }}
            >
              Iniciar sesión con Google
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;