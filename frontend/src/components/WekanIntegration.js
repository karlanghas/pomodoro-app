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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Dashboard as DashboardIcon, Sync as SyncIcon } from '@mui/icons-material';

const WekanIntegration = ({ user }) => {
  const [boards, setBoards] = useState([]);
  const [cards, setCards] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [wekanUrl, setWekanUrl] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = () => {
    setLoading(true);
    setError('');
    
    fetch('/api/wekan/boards', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Error al obtener tableros');
        return res.json();
      })
      .then(data => {
        setBoards(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching Wekan boards:', err);
        setError('Error al obtener tableros de Wekan. Verifica la configuración.');
        setLoading(false);
      });
  };

  const fetchCards = (boardId) => {
    setLoading(true);
    setError('');
    
    fetch(`/api/wekan/boards/${boardId}/cards`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Error al obtener tarjetas');
        return res.json();
      })
      .then(data => {
        setCards(prev => ({
          ...prev,
          [boardId]: data
        }));
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching Wekan cards:', err);
        setError('Error al obtener tarjetas de Wekan');
        setLoading(false);
      });
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSaveConfig = () => {
    // In a real app, this would save the configuration to the user's profile
    // For simplicity, we'll just use it for this session
    setOpenDialog(false);
    fetchBoards();
  };

  const handleBoardExpand = (boardId) => {
    if (!cards[boardId]) {
      fetchCards(boardId);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">Integración con Wekan</Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<SyncIcon />}
              onClick={fetchBoards}
              sx={{ mr: 2 }}
            >
              Sincronizar
            </Button>
            <Button
              variant="outlined"
              onClick={handleOpenDialog}
            >
              Configurar Wekan
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
            {boards.length === 0 ? (
              <Alert severity="info">
                No se encontraron tableros en Wekan. Asegúrate de haber configurado correctamente la URL y el token de API.
              </Alert>
            ) : (
              <Box>
                {boards.map(board => (
                  <Accordion key={board._id} onChange={() => handleBoardExpand(board._id)}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DashboardIcon sx={{ mr: 2, color: 'primary.main' }} />
                        <Typography variant="h6">{board.title}</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      {cards[board._id] ? (
                        <List>
                          {cards[board._id].map(card => (
                            <ListItem key={card._id} sx={{ border: '1px solid', borderColor: 'grey.300', borderRadius: 1, mb: 1 }}>
                              <ListItemText
                                primary={card.title}
                                secondary={
                                  <>
                                    {card.description && (
                                      <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                                        {card.description}
                                      </Typography>
                                    )}
                                    {card.labels && card.labels.length > 0 && (
                                      <Box sx={{ mt: 1 }}>
                                        {card.labels.map(label => (
                                          <Chip
                                            key={label._id}
                                            label={label.name}
                                            size="small"
                                            sx={{
                                              mr: 1,
                                              bgcolor: label.color,
                                              color: 'white'
                                            }}
                                          />
                                        ))}
                                      </Box>
                                    )}
                                  </>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                          <CircularProgress size={24} />
                        </Box>
                      )}
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            )}
          </>
        )}
      </Paper>
      
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Configurar Wekan</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="wekanUrl"
            label="URL de Wekan"
            type="url"
            fullWidth
            variant="outlined"
            value={wekanUrl}
            onChange={(e) => setWekanUrl(e.target.value)}
            helperText="Ej: https://wekan.infociber.cl"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="apiToken"
            label="Token de API"
            type="text"
            fullWidth
            variant="outlined"
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            helperText="Token de API de Wekan para autenticación"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSaveConfig}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WekanIntegration;
