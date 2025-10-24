import React from 'react';
import { Grid, Paper, Typography, Box, Button } from '@mui/material';
import { Timer as TimerIcon, Assignment as TaskIcon, CalendarToday as CalendarIcon, Dashboard as WekanIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Bienvenido, {user?.profile?.displayName || 'Cargando...'}
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              cursor: 'pointer',
              '&:hover': {
                boxShadow: 3,
              }
            }}
            onClick={() => navigate('/timer')}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TimerIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Temporizador</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Inicia una sesión Pomodoro
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              cursor: 'pointer',
              '&:hover': {
                boxShadow: 3,
              }
            }}
            onClick={() => navigate('/tasks')}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TaskIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Tareas</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Gestiona tus tareas de estudio
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              cursor: 'pointer',
              '&:hover': {
                boxShadow: 3,
              }
            }}
            onClick={() => navigate('/calendar')}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CalendarIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Calendario</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Ver eventos de estudio
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              cursor: 'pointer',
              '&:hover': {
                boxShadow: 3,
              }
            }}
            onClick={() => navigate('/wekan')}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <WekanIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Wekan</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Integración con Wekan
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            ¿Qué es el método Pomodoro?
          </Typography>
          <Typography variant="body1" paragraph>
            El método Pomodoro es una técnica de gestión del tiempo que utiliza un temporizador para dividir el trabajo en intervalos, 
            tradicionalmente de 25 minutos de duración, separados por descansos cortos.
          </Typography>
          <Typography variant="body1">
            Esta aplicación te ayudará a implementar esta técnica, permitiéndote gestionar tus tareas de estudio, 
            sincronizarlas con tu calendario de Google y tableros de Wekan.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;