import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';

import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PomodoroTimer from './components/PomodoroTimer';
import TaskManager from './components/TaskManager';
import CalendarIntegration from './components/CalendarIntegration';
import WekanIntegration from './components/WekanIntegration';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#e53935', // Red for Pomodoro
    },
    secondary: {
      main: '#43a047', // Green for breaks
    },
  },
});

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Revisa si hay un token en la URL (después del login)
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');

    if (tokenFromUrl) {
      // Si hay un token, guárdalo en localStorage
      localStorage.setItem('pomodoroToken', tokenFromUrl);
      // Limpia la URL para que no se vea el token
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // 2. Obtiene el token del almacenamiento local
    const token = localStorage.getItem('pomodoroToken');

    if (token) {
      // Si hay un token, verifica su validez con el backend
      fetch('/api/auth/verify-token', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setUser(data.user);
          } else {
            localStorage.removeItem('pomodoroToken'); // Token inválido
          }
        })
        .catch(err => console.error('Error verifying token:', err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('pomodoroToken');
    setUser(null);
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              App Pomodoro
            </Typography>
            {user && (
              <Button color="inherit" onClick={handleLogout}>
                Cerrar sesión
              </Button>
            )}
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Routes>
            <Route 
              path="/login" 
              element={!user ? <Login /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/timer" 
              element={user ? <PomodoroTimer user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/tasks" 
              element={user ? <TaskManager user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/calendar" 
              element={user ? <CalendarIntegration user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/wekan" 
              element={user ? <WekanIntegration user={user} /> : <Navigate to="/login" />} 
            />
            <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;
