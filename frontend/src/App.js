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
  console.log("App useEffect running...");
  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromUrl = urlParams.get('token');

  if (tokenFromUrl) {
    console.log("Token found in URL:", tokenFromUrl);
    localStorage.setItem('pomodoroToken', tokenFromUrl);
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  const token = localStorage.getItem('pomodoroToken');
  console.log("Token from localStorage:", token);

  if (token) {
    console.log("Token exists, verifying with backend...");
    fetch('/api/auth/verify-token', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        console.log("Verify token response status:", res.status);
        if (!res.ok) {
          throw new Error(`Token verification failed: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        console.log("Verify token response data:", data);
        if (data.user) {
          console.log("User data found, setting user state.");
          setUser(data.user);
        } else {
          console.log("No user in response, clearing token.");
          localStorage.removeItem('pomodoroToken');
        }
      })
      .catch(err => {
        console.error('Error verifying token:', err);
        localStorage.removeItem('pomodoroToken');
      })
      .finally(() => {
        console.log("Finished token verification process.");
        setLoading(false);
      });
  } else {
    console.log("No token found, setting loading to false.");
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
