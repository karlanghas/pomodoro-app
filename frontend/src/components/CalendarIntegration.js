import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  AppBar,
  Toolbar,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Event as EventIcon, Sync as SyncIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiRequest from '../services/api';

const CalendarIntegration = ({ user }) => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [calendarId, setCalendarId] = useState(localStorage.getItem('studyCalendarId') || 'primary');
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    setLoading(true);
    setError('');
    
    // La petición ahora incluye el calendarId como parámetro de consulta
    apiRequest(`/calendar/study-events?calendarId=${calendarId}`)
      .then(data => setEvents(data))
      .catch(err => {
        console.error('Error fetching calendar events:', err);
        setError('Error al obtener eventos del calendario');
      })
      .finally(() => setLoading(false));
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSaveCalendarId = () => {
    localStorage.setItem('studyCalendarId', calendarId);
    setOpenDialog(false);
    fetchEvents(); // Sincronizar después de guardar
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Box sx={{ width: '100%' }}>
      <AppBar position="static" color="primary" enableColorOnDark>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Integración con Google Calendar
          </Typography>
        </Toolbar>
      </AppBar>

      <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">Integración con Google Calendar</Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<SyncIcon />}
              onClick={fetchEvents}
              sx={{ mr: 2 }}
            >
              Sincronizar
            </Button>
            <Button
              variant="outlined"
              onClick={handleOpenDialog}
            >
              Configurar Calendario
            </Button>
          </Box>
        </Box>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {events.length === 0 ? (
              <Alert severity="info">
                No se encontraron eventos de estudio en tu calendario. Asegúrate de haber configurado correctamente el calendario de estudio.
              </Alert>
            ) : (
              <List>
                {events.map(event => (
                  <ListItem key={event.id} sx={{ border: '1px solid', borderColor: 'grey.300', borderRadius: 1, mb: 1 }}>
                    <EventIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <ListItemText
                      primary={event.summary}
                      secondary={
                        <>
                          <Typography variant="body2" component="span">
                            {formatDate(event.start)} - {formatDate(event.end)}
                          </Typography>
                          {event.description && (
                            <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                              {event.description}
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </>
        )}
      </Paper>
      
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Configurar Calendario de Estudio</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="calendarId"
            label="ID del Calendario"
            type="text"
            fullWidth
            variant="outlined"
            value={calendarId}
            onChange={(e) => setCalendarId(e.target.value)}
            helperText="Deja en 'primary' para usar el calendario principal o pega el ID de un calendario específico."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSaveCalendarId}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CalendarIntegration;