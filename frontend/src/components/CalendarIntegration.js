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
  DialogActions
} from '@mui/material';
import { Event as EventIcon, Sync as SyncIcon } from '@mui/icons-material';

const CalendarIntegration = ({ user }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [calendarId, setCalendarId] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    setLoading(true);
    setError('');
    
    fetch('/api/calendar/study-events', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Error al obtener eventos');
        return res.json();
      })
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching calendar events:', err);
        setError('Error al obtener eventos del calendario');
        setLoading(false);
      });
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSaveCalendarId = () => {
    // In a real app, this would save the calendar ID to the user's profile
    // For simplicity, we'll just use it for this session
    setOpenDialog(false);
    fetchEvents();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper elevation={3} sx={{ p: 3 }}>
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
            helperText="Deja en blanco para usar el calendario principal"
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